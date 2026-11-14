<?php

namespace Tests\Feature;

use App\Models\Barbearia;
use App\Models\BarbeariaHorario;
use App\Models\Barbeiro;
use App\Models\Servico;
use App\Models\User;
use App\Services\JwtService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBarbeiroTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_cadastra_barbeiro_com_servicos_da_propria_unidade(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'nexo', 'nome' => 'Nexo', 'ativa' => true]);
        $outraBarbearia = Barbearia::query()->create(['slug' => 'outra', 'nome' => 'Outra', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 35, 'ativo' => true]);
        $servicoDeOutraUnidade = Servico::query()->create(['barbearia_id' => $outraBarbearia->id, 'nome' => 'Barba', 'duracao_minutos' => 20, 'preco' => 20, 'ativo' => true]);
        $token = app(JwtService::class)->criarPara($admin);
        $payload = ['nome' => 'Carlos', 'telefone' => '11999990000', 'email' => 'carlos@nexo.test', 'servico_ids' => [$servico->id]];

        $resposta = $this->withToken($token)
            ->postJson('/api/v1/admin/barbearias/nexo/barbeiros', $payload)
            ->assertCreated()
            ->assertJsonPath('nome', 'Carlos')
            ->assertJsonPath('servicos.0.id', $servico->id);

        $this->withToken($token)
            ->postJson('/api/v1/admin/barbearias/nexo/barbeiros', [...$payload, 'email' => 'outro@nexo.test', 'servico_ids' => [$servicoDeOutraUnidade->id]])
            ->assertUnprocessable();

        $this->assertDatabaseHas('barbeiros', ['barbearia_id' => $barbearia->id, 'email' => 'carlos@nexo.test']);
        $this->assertDatabaseHas('barbeiro_servico', ['barbeiro_id' => $resposta->json('id'), 'servico_id' => $servico->id]);
    }

    public function test_administrador_pode_cadastrar_barbeiro_antes_de_criar_o_catalogo_de_servicos(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'equipe-primeiro', 'nome' => 'Equipe Primeiro', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $token = app(JwtService::class)->criarPara($admin);

        $resposta = $this->withToken($token)
            ->postJson('/api/v1/admin/barbearias/equipe-primeiro/barbeiros', [
                'nome' => 'Carlos',
                'telefone' => '11999990000',
                'email' => null,
                'servico_ids' => [],
            ])
            ->assertCreated()
            ->assertJsonPath('nome', 'Carlos')
            ->assertJsonPath('servicos', []);

        $this->assertDatabaseHas('barbeiros', ['id' => $resposta->json('id'), 'barbearia_id' => $barbearia->id]);
    }

    public function test_jornada_pausas_e_ausencias_reduzem_os_horarios_disponiveis(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'agenda-semanal', 'nome' => 'Agenda Semanal', 'ativa' => true]);
        $data = CarbonImmutable::now($barbearia->fuso_horario)->addDay()->startOfDay();
        BarbeariaHorario::query()->create([
            'barbearia_id' => $barbearia->id,
            'dia_semana' => $data->dayOfWeek,
            'abre_as' => '09:00',
            'fecha_as' => '12:00',
        ]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 30, 'preco' => 40, 'ativo' => true]);
        $barbeiro->servicos()->attach($servico);
        $horarios = collect(range(0, 6))->map(fn (int $dia) => [
            'dia_semana' => $dia,
            'indisponivel' => $dia !== $data->dayOfWeek,
            'inicia_as' => $dia === $data->dayOfWeek ? '09:00' : null,
            'termina_as' => $dia === $data->dayOfWeek ? '12:00' : null,
            'pausa_inicio' => $dia === $data->dayOfWeek ? '10:00' : null,
            'pausa_fim' => $dia === $data->dayOfWeek ? '10:30' : null,
        ])->all();
        $token = app(JwtService::class)->criarPara($admin);

        $this->withToken($token)
            ->putJson("/api/v1/admin/barbearias/agenda-semanal/barbeiros/{$barbeiro->id}/jornada", ['horarios' => $horarios])
            ->assertOk()
            ->assertJsonPath('jornada.'.$data->dayOfWeek.'.pausa_inicio', '10:00');

        $this->withToken($token)
            ->postJson("/api/v1/admin/barbearias/agenda-semanal/barbeiros/{$barbeiro->id}/ausencias", [
                'inicio_em' => $data->format('Y-m-d').' 11:00',
                'fim_em' => $data->format('Y-m-d').' 11:30',
                'motivo' => 'Compromisso',
            ])
            ->assertCreated();

        $respostaAgenda = $this->getJson("/api/v1/barbearias/agenda-semanal/contexto-agendamento?servico_id={$servico->id}")->assertOk();
        $agendaCompleta = $respostaAgenda->json("agendaPorProfissional.{$barbeiro->id}");
        $agendaDoDia = collect($agendaCompleta)->firstWhere('data', $data->format('Y-m-d'));
        $slots = $agendaDoDia['horarios'];
        $horariosDoDia = collect($slots)->pluck('horario')->all();
        $this->assertContains('09:30', $horariosDoDia);
        $this->assertNotContains('10:00', $horariosDoDia);
        $this->assertContains('10:30', $horariosDoDia);
        $this->assertNotContains('11:00', $horariosDoDia);
        $this->assertContains('11:30', $horariosDoDia);
    }
}
