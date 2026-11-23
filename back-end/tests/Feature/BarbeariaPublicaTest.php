<?php

namespace Tests\Feature;

use App\Models\Barbearia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BarbeariaPublicaTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_somente_barbearias_ativas_ordenadas_por_nome_com_o_contrato_publico(): void
    {
        Barbearia::query()->update(['ativa' => false]);

        $zeta = Barbearia::query()->create([
            'slug' => 'zeta-cortes',
            'nome' => 'Zeta Cortes',
            'descricao' => 'Atendimento contemporâneo.',
            'endereco' => 'Rua Z, 90',
            'telefone' => '11999990000',
            'ativa' => true,
        ]);
        $alameda = Barbearia::query()->create([
            'slug' => 'alameda-barbearia',
            'nome' => 'Alameda Barbearia',
            'descricao' => 'Cortes clássicos.',
            'endereco' => 'Av. Alameda, 10',
            'telefone' => '11888880000',
            'ativa' => true,
        ]);
        Barbearia::query()->create([
            'slug' => 'barbearia-inativa',
            'nome' => 'Barbearia Inativa',
            'ativa' => false,
        ]);

        $this->getJson('/api/v1/barbearias')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    [
                        'id' => (string) $alameda->id,
                        'slug' => 'alameda-barbearia',
                        'nome' => 'Alameda Barbearia',
                        'descricao' => 'Cortes clássicos.',
                        'endereco' => 'Av. Alameda, 10',
                        'telefone' => '11888880000',
                    ],
                    [
                        'id' => (string) $zeta->id,
                        'slug' => 'zeta-cortes',
                        'nome' => 'Zeta Cortes',
                        'descricao' => 'Atendimento contemporâneo.',
                        'endereco' => 'Rua Z, 90',
                        'telefone' => '11999990000',
                    ],
                ],
            ]);
    }

    public function test_lista_vazia_mantem_o_envelope_de_colecao(): void
    {
        Barbearia::query()->update(['ativa' => false]);

        $this->getJson('/api/v1/barbearias')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }
}
