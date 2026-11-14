<?php

namespace Tests\Feature;

use App\Enums\StatusAgendamento;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\BarbeariaHorario;
use App\Models\Barbeiro;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\User;
use App\Services\JwtService;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAgendamentoConclusaoTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_admin_so_conclui_agendamento_apos_o_fim_previsto_e_na_unidade_correta(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'nexo-conclusao', 'nome' => 'Nexo', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $cliente = Cliente::query()->create(['nome' => 'Ana', 'telefone' => '11999990000']);
        $agendamento = Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => '2030-01-01 09:00:00',
            'status' => StatusAgendamento::Confirmado,
        ]);
        $token = app(JwtService::class)->criarPara($admin);
        $rota = "/api/v1/admin/barbearias/nexo-conclusao/agendamentos/{$agendamento->id}/conclusao";

        Carbon::setTestNow('2030-01-01 09:29:00 America/Sao_Paulo');
        $this->withToken($token)->patchJson($rota)->assertUnprocessable();
        $this->assertDatabaseHas('agendamentos', ['id' => $agendamento->id, 'status' => StatusAgendamento::Confirmado->value]);

        Carbon::setTestNow('2030-01-01 09:31:00 America/Sao_Paulo');
        $this->withToken($token)->patchJson($rota)
            ->assertOk()
            ->assertJsonPath('status', StatusAgendamento::Concluido->value);
        $this->assertDatabaseHas('agendamentos', ['id' => $agendamento->id, 'status' => StatusAgendamento::Concluido->value]);
    }

    public function test_agenda_admin_filtra_dentro_da_unidade_e_nao_aceita_profissional_de_outra(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'agenda-admin', 'nome' => 'Agenda Admin', 'ativa' => true]);
        $outra = Barbearia::query()->create(['slug' => 'agenda-alheia', 'nome' => 'Agenda Alheia', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $barbeiroAlheio = Barbeiro::query()->create(['barbearia_id' => $outra->id, 'nome' => 'Leo', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $cliente = Cliente::query()->create(['nome' => 'Ana Silva', 'telefone' => '11999990000']);
        $agendamento = Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => '2030-01-01 10:00:00',
            'status' => StatusAgendamento::Pendente,
        ]);
        $token = app(JwtService::class)->criarPara($admin);
        $rota = '/api/v1/admin/barbearias/agenda-admin/agendamentos';

        $this->withToken($token)->getJson("{$rota}?data_inicio=2030-01-01&data_fim=2030-01-01&barbeiro_id={$barbeiro->id}&busca=Ana")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $agendamento->id)
            ->assertJsonPath('data.0.cliente.nome', 'Ana Silva');
        $this->withToken($token)->getJson("{$rota}?barbeiro_id={$barbeiroAlheio->id}")->assertUnprocessable();
    }

    public function test_agendamento_manual_rejeita_cliente_vinculado_a_outra_unidade(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'manual-admin', 'nome' => 'Manual Admin', 'ativa' => true]);
        $outra = Barbearia::query()->create(['slug' => 'manual-outra', 'nome' => 'Manual Outra', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $barbeiro->servicos()->attach($servico);
        $cliente = Cliente::query()->create(['nome' => 'Cliente externo', 'telefone' => '11999990000']);
        $outra->clientes()->attach($cliente);
        $data = CarbonImmutable::now('America/Sao_Paulo')->addDays(2)->format('Y-m-d');
        $token = app(JwtService::class)->criarPara($admin);

        $this->withToken($token)->postJson('/api/v1/admin/barbearias/manual-admin/agendamentos', [
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => "{$data} 10:00",
            'status' => 'confirmado',
        ])->assertUnprocessable();
        $this->assertDatabaseCount('agendamentos', 0);
    }

    public function test_admin_registra_falta_apos_o_fim_previsto_sem_confundir_com_cancelamento(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        Carbon::setTestNow('2030-01-01 09:31:00 America/Sao_Paulo');
        $barbearia = Barbearia::query()->create(['slug' => 'falta-admin', 'nome' => 'Falta Admin', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $cliente = Cliente::query()->create(['nome' => 'Ana', 'telefone' => '11999990000']);
        $agendamento = Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => '2030-01-01 09:00:00',
            'status' => StatusAgendamento::Confirmado,
        ]);
        $token = app(JwtService::class)->criarPara($admin);

        $this->withToken($token)->patchJson("/api/v1/admin/barbearias/falta-admin/agendamentos/{$agendamento->id}/nao-comparecimento")
            ->assertOk()
            ->assertJsonPath('status', StatusAgendamento::Cancelado->value)
            ->assertJsonPath('nao_compareceu', true);
        $this->assertDatabaseHas('agendamentos', ['id' => $agendamento->id, 'status' => StatusAgendamento::Cancelado->value, 'nao_compareceu' => true]);
    }

    public function test_confirmacao_revalida_expediente_e_conflitos_da_agenda(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        Carbon::setTestNow('2030-01-01 08:00:00 America/Sao_Paulo');
        $barbearia = Barbearia::query()->create(['slug' => 'confirmacao-admin', 'nome' => 'Confirmação Admin', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $cliente = Cliente::query()->create(['nome' => 'Ana', 'telefone' => '11999990000']);
        $outroCliente = Cliente::query()->create(['nome' => 'Bia', 'telefone' => '11999990001']);
        $data = CarbonImmutable::now('America/Sao_Paulo')->addDay()->startOfDay();
        BarbeariaHorario::query()->create(['barbearia_id' => $barbearia->id, 'dia_semana' => $data->dayOfWeek, 'abre_as' => '09:00', 'fecha_as' => '18:00']);
        $criar = fn (Cliente $pessoa, string $hora) => Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $pessoa->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => $data->format('Y-m-d')." {$hora}:00",
            'status' => StatusAgendamento::Pendente,
        ]);
        $primeiro = $criar($cliente, '10:00');
        $conflitante = $criar($outroCliente, '10:15');
        $token = app(JwtService::class)->criarPara($admin);

        $this->withToken($token)->patchJson("/api/v1/admin/barbearias/confirmacao-admin/agendamentos/{$primeiro->id}/confirmacao")
            ->assertOk()->assertJsonPath('status', StatusAgendamento::Confirmado->value);
        $this->withToken($token)->patchJson("/api/v1/admin/barbearias/confirmacao-admin/agendamentos/{$conflitante->id}/confirmacao")
            ->assertUnprocessable();
    }
}
