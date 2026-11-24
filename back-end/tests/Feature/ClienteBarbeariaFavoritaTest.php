<?php

namespace Tests\Feature;

use App\Models\Barbearia;
use App\Models\Cliente;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClienteBarbeariaFavoritaTest extends TestCase
{
    use RefreshDatabase;

    public function test_cliente_pode_consultar_adicionar_e_remover_favoritas_sem_duplicar(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $slug = 'favorita';
        $barbearia = Barbearia::query()->create([
            'slug' => $slug,
            'nome' => 'Barbearia Favorita',
            'ativa' => true,
        ]);
        $usuario = User::factory()->create();
        $cliente = Cliente::query()->create([
            'user_id' => $usuario->getKey(),
            'nome' => $usuario->name,
            'telefone' => '11999999999',
            'email' => $usuario->email,
        ]);
        $token = app(JwtService::class)->criarPara($usuario);
        $rota = '/api/v1/cliente/barbearias-favoritas';

        $this->withToken($token)->getJson($rota)
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->withToken($token)->putJson("{$rota}/{$slug}")
            ->assertOk()
            ->assertJsonPath('slug', $slug);
        $this->withToken($token)->putJson("{$rota}/{$slug}")->assertOk();
        $this->assertDatabaseCount('cliente_barbearia_favorita', 1);
        $this->withToken($token)->getJson($rota)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $slug);

        $outroUsuario = User::factory()->create();
        Cliente::query()->create([
            'user_id' => $outroUsuario->getKey(),
            'nome' => $outroUsuario->name,
            'telefone' => '11999999998',
            'email' => $outroUsuario->email,
        ]);
        $outroToken = app(JwtService::class)->criarPara($outroUsuario);
        $this->withToken($outroToken)->getJson($rota)
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->withToken($token)->deleteJson("{$rota}/{$slug}")->assertOk();
        $this->assertDatabaseMissing('cliente_barbearia_favorita', [
            'cliente_id' => $cliente->getKey(),
            'barbearia_id' => $barbearia->getKey(),
        ]);
    }

    public function test_usuario_sem_perfil_de_cliente_nao_pode_manter_favoritas(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $usuario = User::factory()->create();
        $token = app(JwtService::class)->criarPara($usuario);

        $this->withToken($token)->getJson('/api/v1/cliente/barbearias-favoritas')->assertForbidden();
    }
}
