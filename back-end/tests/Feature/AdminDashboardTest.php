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
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_dashboard_entrega_indicadores_e_analises_reais_da_unidade_no_periodo(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        Carbon::setTestNow('2030-05-15 12:00:00 America/Sao_Paulo');
        $barbearia = Barbearia::query()->create(['slug' => 'dashboard-real', 'nome' => 'Dashboard Real', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $barbeiro->servicos()->attach($servico);
        $cliente = Cliente::query()->create(['nome' => 'Ana', 'telefone' => '11999990000']);
        $barbearia->clientes()->attach($cliente);
        $hoje = CarbonImmutable::now('America/Sao_Paulo')->startOfDay();
        $criar = function (CarbonImmutable $dataHora, StatusAgendamento $status, bool $falta = false) use ($barbearia, $cliente, $barbeiro, $servico): Agendamento {
            return Agendamento::query()->create([
                'barbearia_id' => $barbearia->id,
                'cliente_id' => $cliente->id,
                'barbeiro_id' => $barbeiro->id,
                'servico_id' => $servico->id,
                'data_hora' => $dataHora,
                'status' => $status,
                'nao_compareceu' => $falta,
            ]);
        };
        $criar($hoje->subDay()->setTime(10, 0), StatusAgendamento::Cancelado, true);
        $criar($hoje->setTime(10, 0), StatusAgendamento::Concluido);
        $criar($hoje->setTime(14, 0), StatusAgendamento::Pendente);
        $criar($hoje->addDay()->setTime(10, 0), StatusAgendamento::Confirmado);
        $token = app(JwtService::class)->criarPara($admin);

        $resposta = $this->withToken($token)
            ->getJson('/api/v1/admin/barbearias/dashboard-real/dashboard?periodo=7')
            ->assertOk()
            ->assertJsonPath('indicadores.agendamentos_hoje', 2)
            ->assertJsonPath('indicadores.pendentes', 1)
            ->assertJsonPath('indicadores.concluidos', 1)
            ->assertJsonPath('indicadores.faltas_mes', 1)
            ->assertJsonPath('indicadores.taxa_faltas_mes', 25)
            ->assertJsonPath('analiticos.servicos_mais_realizados.0.nome', 'Corte')
            ->assertJsonPath('analiticos.servicos_mais_realizados.0.quantidade', 1)
            ->assertJsonPath('analiticos.nao_comparecimentos', 1)
            ->assertJsonPath('analiticos.status.4.status', 'nao_compareceu')
            ->assertJsonPath('proximos_agendamentos.0.status', StatusAgendamento::Pendente->value)
            ->assertJsonPath('profissionais.0.proximo_atendimento', '14:00');

        $this->assertCount(7, $resposta->json('analiticos.agendamentos_por_dia'));
        $this->assertCount(2, $resposta->json('proximos_agendamentos'));
        $resposta30Dias = $this->withToken($token)->getJson('/api/v1/admin/barbearias/dashboard-real/dashboard?periodo=30')->assertOk();
        $this->assertCount(30, $resposta30Dias->json('analiticos.agendamentos_por_dia'));
    }
}
