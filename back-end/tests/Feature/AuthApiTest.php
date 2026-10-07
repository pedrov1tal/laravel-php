<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        config()->set('jwt.ttl', 3600);

        Route::middleware('api')->post('/api/v1/protegido-teste', function () {
            return response()->json(['status' => 'criado'], 201);
        });
    }

    public function test_usuario_pode_se_registrar_sem_expor_a_senha(): void
    {
        $response = $this->postJson('/api/v1/auth/registro', [
            'nome' => 'Ana Martins',
            'email' => 'ana@exemplo.com',
            'telefone' => '(11) 99999-0000',
            'senha' => 'senha123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('usuario.nome', 'Ana Martins')
            ->assertJsonPath('usuario.email', 'ana@exemplo.com')
            ->assertJsonPath('cliente.telefone', '(11) 99999-0000')
            ->assertJsonMissingPath('usuario.senha')
            ->assertJsonMissingPath('usuario.password');

        $usuario = User::query()->where('email', 'ana@exemplo.com')->firstOrFail();

        $this->assertNotSame('senha123', $usuario->getRawOriginal('password'));
        $this->assertTrue(Hash::check('senha123', $usuario->password));
        $this->assertTrue(
            Cliente::query()
                ->whereBelongsTo($usuario)
                ->where('telefone', '(11) 99999-0000')
                ->exists(),
        );
    }

    public function test_login_retorna_token_com_validade_de_uma_hora_e_usuario(): void
    {
        User::factory()->create([
            'name' => 'Ana Martins',
            'email' => 'ana@exemplo.com',
            'password' => Hash::make('senha123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'ana@exemplo.com',
            'senha' => 'senha123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('usuario.nome', 'Ana Martins')
            ->assertJsonMissingPath('usuario.password');

        $token = $response->json('token');
        $this->assertIsString($token);
        $this->assertCount(3, explode('.', $token));

        $payload = json_decode($this->base64UrlDecode(explode('.', $token)[1]), true);
        $this->assertSame(3600, $payload['exp'] - $payload['iat']);
    }

    public function test_login_invalido_retorna_401(): void
    {
        User::factory()->create([
            'email' => 'ana@exemplo.com',
            'password' => Hash::make('senha123'),
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'ana@exemplo.com',
            'senha' => 'incorreta',
        ])->assertUnauthorized();
    }

    public function test_me_retorna_usuario_com_token_e_401_sem_token(): void
    {
        $usuario = User::factory()->create([
            'name' => 'Ana Martins',
            'email' => 'ana@exemplo.com',
            'password' => Hash::make('senha123'),
        ]);

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $usuario->email,
            'senha' => 'senha123',
        ])->json('token');

        $this->getJson('/api/v1/auth/me')->assertUnauthorized();

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('usuario.email', $usuario->email)
            ->assertJsonMissingPath('usuario.password');
    }

    public function test_escritas_exigem_token_valido(): void
    {
        $usuario = User::factory()->create([
            'email' => 'ana@exemplo.com',
            'password' => Hash::make('senha123'),
        ]);

        $this->postJson('/api/v1/protegido-teste')->assertUnauthorized();
        $this->withToken('token-invalido')
            ->postJson('/api/v1/protegido-teste')
            ->assertUnauthorized();

        $token = $this->postJson('/api/v1/auth/login', [
            'email' => $usuario->email,
            'senha' => 'senha123',
        ])->json('token');

        $this->withToken($token)
            ->postJson('/api/v1/protegido-teste')
            ->assertCreated()
            ->assertJsonPath('status', 'criado');
    }

    private function base64UrlDecode(string $value): string
    {
        $padding = (4 - strlen($value) % 4) % 4;

        return base64_decode(strtr($value.str_repeat('=', $padding), '-_', '+/'));
    }
}
