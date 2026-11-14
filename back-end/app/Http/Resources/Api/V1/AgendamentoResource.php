<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgendamentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'barbearia_id' => $this->barbearia_id,
            'data_hora' => $this->data_hora?->format('Y-m-d H:i'),
            'status' => $this->status?->value,
            'nao_compareceu' => (bool) $this->nao_compareceu,
            'observacoes' => $this->observacoes,
            'barbearia' => $this->whenLoaded('barbearia', fn () => ['nome' => $this->barbearia->nome, 'slug' => $this->barbearia->slug]),
            'cliente' => $this->whenLoaded('cliente', fn () => ['id' => $this->cliente->id, 'nome' => $this->cliente->nome, 'telefone' => $this->cliente->telefone, 'email' => $this->cliente->email]),
            'servico' => $this->whenLoaded('servico', fn () => ['id' => $this->servico->id, 'nome' => $this->servico->nome, 'duracao_minutos' => $this->servico->duracao_minutos, 'preco' => $this->servico->preco]),
            'barbeiro' => $this->whenLoaded('barbeiro', fn () => ['id' => $this->barbeiro->id, 'nome' => $this->barbeiro->nome]),
        ];
    }
}
