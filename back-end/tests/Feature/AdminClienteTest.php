<?php

namespace Tests\Feature;

use App\Enums\StatusAgendamento;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\Barbeiro;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminClienteTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_pesquisa_clientes_e_atualiza_dados_por_unidade(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'unidade-a', 'nome' => 'Unidade A', 'ativa' => true]);
        $outraBarbearia = Barbearia::query()->create(['slug' => 'unidade-b', 'nome' => 'Unidade B', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $cliente = Cliente::query()->create(['nome' => 'Marina Lima', 'telefone' => '11999990000', 'email' => 'marina@example.test']);
        $clienteDeOutraUnidade = Cliente::query()->create(['nome' => 'Outro Cliente', 'telefone' => '11888880000', 'email' => 'outro@example.test']);
        $barbearia->clientes()->attach($cliente);
        $outraBarbearia->clientes()->attach($clienteDeOutraUnidade);

        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 40, 'ativo' => true]);
        foreach ([StatusAgendamento::Concluido, StatusAgendamento::Cancelado] as $status) {
            Agendamento::query()->create([
                'barbearia_id' => $barbearia->id,
                'barbeiro_id' => $barbeiro->id,
                'cliente_id' => $cliente->id,
                'servico_id' => $servico->id,
                'data_hora' => now()->subDay(),
                'status' => $status,
            ]);
        }
        $token = app(JwtService::class)->criarPara($admin);

        $this->withToken($token)
            ->getJson('/api/v1/admin/barbearias/unidade-a/clientes?busca=marina')
            ->assertOk()
            ->assertJsonPath('data.0.nome', 'Marina Lima')
            ->assertJsonPath('data.0.agendamentos_concluidos', 1)
            ->assertJsonPath('data.0.cancelamentos', 1);

        $this->withToken($token)
            ->getJson('/api/v1/admin/barbearias/unidade-a/clientes?busca=outro')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->withToken($token)
            ->patchJson("/api/v1/admin/barbearias/unidade-a/clientes/{$cliente->id}", [
                'observacoes_internas' => 'Prefere atendimento no período da manhã.',
                'bloqueado' => true,
            ])
            ->assertOk()
            ->assertJsonPath('bloqueado', true)
            ->assertJsonPath('observacoes_internas', 'Prefere atendimento no período da manhã.');

        $this->assertDatabaseHas('barbearia_cliente', [
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'bloqueado' => true,
        ]);
    }

    public function test_cliente_bloqueado_na_unidade_nao_consegue_reservar_nela(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'unidade', 'nome' => 'Unidade', 'ativa' => true]);
        $usuario = User::factory()->create();
        $cliente = Cliente::query()->create(['user_id' => $usuario->id, 'nome' => 'Nina', 'telefone' => '11999990000', 'email' => $usuario->email]);
        $barbearia->clientes()->attach($cliente, ['bloqueado' => true]);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 40, 'ativo' => true]);
        $barbeiro->servicos()->attach($servico);
        $token = app(JwtService::class)->criarPara($usuario);

        $this->withToken($token)
            ->postJson('/api/v1/barbearias/unidade/agendamentos', [
                'barbeiro_id' => $barbeiro->id,
                'servico_id' => $servico->id,
                'data_hora' => now()->addDays(2)->format('Y-m-d').' 10:00',
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Esta conta nao pode realizar novos agendamentos nesta barbearia.');
    }
}
