<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdentificadorRequisicaoTest extends TestCase
{
    use RefreshDatabase;

    public function test_preserva_identificador_de_requisicao_valido_na_resposta(): void
    {
        $this->withHeader('X-Request-ID', 'frontend-request-123')
            ->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('X-Request-ID', 'frontend-request-123');
    }

    public function test_gera_identificador_para_cabecalho_invalido_e_o_inclui_em_erros(): void
    {
        $resposta = $this->withHeader('X-Request-ID', 'not a valid id')
            ->getJson('/api/v1/rota-inexistente')
            ->assertNotFound();

        $identificador = $resposta->headers->get('X-Request-ID');

        $this->assertIsString($identificador);
        $this->assertMatchesRegularExpression(
            '/\A[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\z/i',
            $identificador,
        );
    }
}
