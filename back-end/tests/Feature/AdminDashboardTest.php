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

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_ve_indicadores_reais_apenas_da_propria_barbearia(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'corte-rapido', 'nome' => 'Corte Rápido']);
        $outra = Barbearia::query()->create(['slug' => 'outra', 'nome' => 'Outra']);
        $admin = User::factory()->create();
        $outroAdmin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $outra->administradores()->attach($outroAdmin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'João', 'ativo' => true]);
        $cliente = Cliente::query()->create(['nome' => 'Ana', 'telefone' => '11999999999']);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Corte', 'duracao_minutos' => 45, 'preco' => 45, 'ativo' => true]);
        Agendamento::query()->create(['barbearia_id' => $barbearia->id, 'cliente_id' => $cliente->id, 'barbeiro_id' => $barbeiro->id, 'servico_id' => $servico->id, 'data_hora' => now($barbearia->fuso_horario)->setTime(14, 0), 'status' => StatusAgendamento::Pendente]);

        $token = app(JwtService::class)->criarPara($admin);
        $this->withToken($token)->getJson('/api/v1/admin/barbearias/corte-rapido/dashboard')
            ->assertOk()
            ->assertJsonPath('indicadores.agendamentos_hoje', 1)
            ->assertJsonPath('indicadores.pendentes', 1)
            ->assertJsonPath('agenda.0.cliente.nome', 'Ana');

        $tokenDeOutroAdmin = app(JwtService::class)->criarPara($outroAdmin);
        $this->withToken($tokenDeOutroAdmin)->getJson('/api/v1/admin/barbearias/corte-rapido/dashboard')->assertNotFound();
    }
}
