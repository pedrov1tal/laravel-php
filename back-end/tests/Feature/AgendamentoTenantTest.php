<?php

namespace Tests\Feature;

use App\Models\Barbearia;
use App\Models\BarbeariaHorario;
use App\Models\Agendamento;
use App\Models\Barbeiro;
use App\Models\BarbeiroHorario;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\User;
use App\Enums\StatusAgendamento;
use App\Services\JwtService;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendamentoTenantTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_cliente_cria_agendamento_apenas_com_dados_do_tenant_e_nao_duplica_horario(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'corte-rapido', 'nome' => 'Corte Rápido', 'ativa' => true]);
        $outraBarbearia = Barbearia::query()->create(['slug' => 'outra', 'nome' => 'Outra Barbearia']);
        $data = CarbonImmutable::now('America/Sao_Paulo')->addDay()->startOfDay();
        BarbeariaHorario::query()->create(['barbearia_id' => $barbearia->id, 'dia_semana' => $data->dayOfWeek, 'abre_as' => '09:00', 'fecha_as' => '18:00']);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'João', 'ativo' => true]);
        BarbeiroHorario::query()->create(['barbeiro_id' => $barbeiro->id, 'dia_semana' => $data->dayOfWeek, 'inicia_as' => '09:00', 'termina_as' => '18:00']);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 45, 'preco' => 45, 'ativo' => true]);
        $servicoDeOutroTenant = Servico::query()->create(['barbearia_id' => $outraBarbearia->id, 'nome' => 'Barba', 'duracao_minutos' => 30, 'preco' => 30, 'ativo' => true]);
        $barbeiro->servicos()->attach($servico);
        $usuario = User::factory()->create();
        Cliente::query()->create(['user_id' => $usuario->id, 'nome' => $usuario->name, 'telefone' => '11999999999', 'email' => $usuario->email]);
        $this->assertTrue($usuario->cliente()->exists());
        $token = app(JwtService::class)->criarPara($usuario);
        $payload = ['barbeiro_id' => $barbeiro->id, 'servico_id' => $servico->id, 'data_hora' => $data->format('Y-m-d').' 10:00'];

        $this->withToken($token)->postJson('/api/v1/barbearias/corte-rapido/agendamentos', $payload)->assertCreated();
        $this->withToken($token)->postJson('/api/v1/barbearias/corte-rapido/agendamentos', $payload)->assertUnprocessable();
        $this->withToken($token)->postJson('/api/v1/barbearias/corte-rapido/agendamentos', [...$payload, 'servico_id' => $servicoDeOutroTenant->id])->assertUnprocessable();
    }

    public function test_contexto_publico_oculta_horarios_conflitantes_considerando_duracao_do_servico(): void
    {
        $barbearia = Barbearia::query()->create(['slug' => 'agenda-real', 'nome' => 'Agenda Real', 'ativa' => true]);
        $data = CarbonImmutable::now('America/Sao_Paulo')->addDay()->startOfDay();
        BarbeariaHorario::query()->create([
            'barbearia_id' => $barbearia->id,
            'dia_semana' => $data->dayOfWeek,
            'abre_as' => '09:00',
            'fecha_as' => '12:00',
        ]);
        $barbeiro = Barbeiro::query()->create([
            'barbearia_id' => $barbearia->id,
            'nome' => 'João',
            'ativo' => true,
        ]);
        BarbeiroHorario::query()->create([
            'barbeiro_id' => $barbeiro->id,
            'dia_semana' => $data->dayOfWeek,
            'inicia_as' => '09:00',
            'termina_as' => '12:00',
        ]);
        $servico = Servico::query()->create([
            'barbearia_id' => $barbearia->id,
            'nome' => 'Corte demorado',
            'duracao_minutos' => 45,
            'preco' => 60,
            'ativo' => true,
        ]);
        $barbeiro->servicos()->attach($servico);
        $cliente = Cliente::query()->create(['nome' => 'Ana', 'telefone' => '11999999999']);
        Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => $data->setTime(10, 0),
            'status' => StatusAgendamento::Confirmado,
        ]);

        $horarios = $this->getJson("/api/v1/barbearias/agenda-real/contexto-agendamento?servico_id={$servico->id}")
            ->assertOk()
            ->json("agendaPorProfissional.{$barbeiro->id}.0.horarios");

        $horariosDoDia = collect($horarios)->pluck('horario')->all();
        $this->assertContains('09:00', $horariosDoDia);
        $this->assertNotContains('09:30', $horariosDoDia);
        $this->assertNotContains('10:00', $horariosDoDia);
        $this->assertNotContains('10:30', $horariosDoDia);
        $this->assertContains('11:00', $horariosDoDia);
    }

    public function test_cliente_consulta_e_cancela_somente_os_proprios_agendamentos(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        Carbon::setTestNow('2030-01-01 10:00:00 America/Sao_Paulo');
        $barbearia = Barbearia::query()->create(['slug' => 'conta-cliente', 'nome' => 'Conta Cliente', 'ativa' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $clienteUsuario = User::factory()->create();
        $cliente = Cliente::query()->create(['user_id' => $clienteUsuario->id, 'nome' => $clienteUsuario->name, 'telefone' => '11999990000', 'email' => $clienteUsuario->email]);
        $outroUsuario = User::factory()->create();
        Cliente::query()->create(['user_id' => $outroUsuario->id, 'nome' => $outroUsuario->name, 'telefone' => '11999990001', 'email' => $outroUsuario->email]);
        $agendamento = Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => '2030-01-05 10:00:00',
            'status' => StatusAgendamento::Confirmado,
        ]);
        $proximoAgendamento = Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'cliente_id' => $cliente->id,
            'barbeiro_id' => $barbeiro->id,
            'servico_id' => $servico->id,
            'data_hora' => '2030-01-01 11:00:00',
            'status' => StatusAgendamento::Confirmado,
        ]);
        $tokenCliente = app(JwtService::class)->criarPara($clienteUsuario);
        $tokenOutro = app(JwtService::class)->criarPara($outroUsuario);

        $this->withToken($tokenCliente)->getJson('/api/v1/cliente/agendamentos')
            ->assertOk()
            ->assertJsonPath('data.0.barbearia.slug', $barbearia->slug)
            ->assertJsonPath('data.0.status', StatusAgendamento::Confirmado->value);
        $this->withToken($tokenOutro)->patchJson("/api/v1/cliente/agendamentos/{$agendamento->id}/cancelamento")
            ->assertNotFound();
        $this->withToken($tokenCliente)->patchJson("/api/v1/cliente/agendamentos/{$proximoAgendamento->id}/cancelamento")
            ->assertUnprocessable();
        $this->withToken($tokenCliente)->patchJson("/api/v1/cliente/agendamentos/{$agendamento->id}/cancelamento")
            ->assertOk()
            ->assertJsonPath('status', StatusAgendamento::Cancelado->value);
    }
}
