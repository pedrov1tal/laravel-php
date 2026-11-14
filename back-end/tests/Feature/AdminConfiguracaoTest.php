<?php

namespace Tests\Feature;

use App\Models\Barbearia;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminConfiguracaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_atualiza_dados_e_horarios_apenas_da_unidade_autorizada(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'nexo-config', 'nome' => 'Nexo', 'ativa' => true]);
        $outra = Barbearia::query()->create(['slug' => 'outra-config', 'nome' => 'Outra', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $token = app(JwtService::class)->criarPara($admin);
        $rota = '/api/v1/admin/barbearias/nexo-config';
        $horarios = collect(range(0, 6))->map(fn (int $dia) => [
            'dia_semana' => $dia,
            'fechado' => $dia === 0,
            'abre_as' => $dia === 0 ? null : '09:00',
            'fecha_as' => $dia === 0 ? null : '18:00',
        ])->all();

        $this->withToken($token)->patchJson("{$rota}/configuracoes", [
            'nome' => 'Nexo Centro', 'descricao' => 'Unidade central', 'telefone' => '1130000000',
            'email' => 'contato@nexo.test', 'endereco' => 'Rua Central, 10',
            'cor_primaria' => '#17231F', 'cor_destaque' => '#BD704C',
            'fuso_horario' => 'America/Sao_Paulo', 'antecedencia_cancelamento_minutos' => 180,
        ])->assertOk()->assertJsonPath('barbearia.nome', 'Nexo Centro');

        $this->withToken($token)->putJson("{$rota}/horarios-funcionamento", ['horarios' => $horarios])
            ->assertOk()->assertJsonPath('horarios.0.fechado', true)->assertJsonPath('horarios.1.abre_as', '09:00');
        $this->assertDatabaseHas('barbearias', ['id' => $barbearia->id, 'nome' => 'Nexo Centro']);
        $this->assertDatabaseHas('barbearia_horarios', ['barbearia_id' => $barbearia->id, 'dia_semana' => 1, 'abre_as' => '09:00']);

        $this->withToken($token)->getJson('/api/v1/admin/barbearias/outra-config/configuracoes')->assertNotFound();
        $this->assertDatabaseHas('barbearias', ['id' => $outra->id, 'nome' => 'Outra']);
    }
}
