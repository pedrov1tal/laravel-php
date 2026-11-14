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

class AdminServicoTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_gerencia_servicos_somente_na_propria_barbearia(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'minha-barbearia', 'nome' => 'Minha Barbearia', 'ativa' => true]);
        $outraBarbearia = Barbearia::query()->create(['slug' => 'outra-barbearia', 'nome' => 'Outra Barbearia', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $token = app(JwtService::class)->criarPara($admin);
        $payload = ['nome' => 'Corte clássico', 'descricao' => 'Corte tradicional', 'duracao_minutos' => 45, 'preco' => 50];

        $resposta = $this->withToken($token)
            ->postJson('/api/v1/admin/barbearias/minha-barbearia/servicos', $payload)
            ->assertCreated()
            ->assertJsonPath('nome', 'Corte clássico')
            ->assertJsonPath('duracao_minutos', 45);
        $servicoId = $resposta->json('id');

        $this->withToken($token)
            ->getJson('/api/v1/admin/barbearias/minha-barbearia/servicos')
            ->assertOk()
            ->assertJsonPath('data.0.nome', 'Corte clássico');
        $this->withToken($token)
            ->getJson("/api/v1/admin/barbearias/outra-barbearia/servicos")
            ->assertNotFound();
        $this->withToken($token)
            ->putJson("/api/v1/admin/barbearias/minha-barbearia/servicos/{$servicoId}", [...$payload, 'nome' => 'Corte atualizado'])
            ->assertOk()
            ->assertJsonPath('nome', 'Corte atualizado');

        $this->assertDatabaseHas('servicos', ['id' => $servicoId, 'barbearia_id' => $barbearia->id]);
        $this->assertDatabaseMissing('servicos', ['barbearia_id' => $outraBarbearia->id]);
    }

    public function test_servico_com_agendamento_historico_nao_pode_ser_excluido(): void
    {
        config()->set('jwt.secret', 'segredo-de-teste-com-tamanho-suficiente');
        $barbearia = Barbearia::query()->create(['slug' => 'agenda', 'nome' => 'Agenda', 'ativa' => true]);
        $admin = User::factory()->create();
        $barbearia->administradores()->attach($admin);
        $barbeiro = Barbeiro::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Rui', 'ativo' => true]);
        $cliente = Cliente::query()->create(['nome' => 'Nina', 'telefone' => '11999990000']);
        $servico = Servico::query()->create(['barbearia_id' => $barbearia->id, 'nome' => 'Barba', 'duracao_minutos' => 30, 'preco' => 30, 'ativo' => true]);
        Agendamento::query()->create([
            'barbearia_id' => $barbearia->id,
            'barbeiro_id' => $barbeiro->id,
            'cliente_id' => $cliente->id,
            'servico_id' => $servico->id,
            'data_hora' => now()->addDay(),
            'status' => StatusAgendamento::Cancelado,
        ]);

        $this->withToken(app(JwtService::class)->criarPara($admin))
            ->deleteJson("/api/v1/admin/barbearias/agenda/servicos/{$servico->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Este serviço possui agendamentos no histórico. Desative-o para impedir novas reservas.');

        $this->assertDatabaseHas('servicos', ['id' => $servico->id]);
    }
}
