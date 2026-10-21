<?php

namespace Tests\Feature;

use App\Models\Barbearia;
use App\Models\BarbeariaHorario;
use App\Models\Barbeiro;
use App\Models\BarbeiroHorario;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\User;
use App\Services\JwtService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendamentoTenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_cliente_cria_agendamento_apenas_com_dados_do_tenant_e_nao_duplica_horario(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'corte-rapido', 'nome' => 'Corte Rápido']);
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
        $token = app(JwtService::class)->criarPara($usuario);
        $payload = ['barbeiro_id' => $barbeiro->id, 'servico_id' => $servico->id, 'data_hora' => $data->format('Y-m-d').' 10:00'];

        $this->withToken($token)->postJson('/api/v1/barbearias/corte-rapido/agendamentos', $payload)->assertCreated();
        $this->withToken($token)->postJson('/api/v1/barbearias/corte-rapido/agendamentos', $payload)->assertUnprocessable();
        $this->withToken($token)->postJson('/api/v1/barbearias/corte-rapido/agendamentos', [...$payload, 'servico_id' => $servicoDeOutroTenant->id])->assertUnprocessable();
    }
}
