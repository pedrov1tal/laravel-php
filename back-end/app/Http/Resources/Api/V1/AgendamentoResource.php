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
            'observacoes' => $this->observacoes,
            'servico' => $this->whenLoaded('servico', fn () => ['id' => $this->servico->id, 'nome' => $this->servico->nome, 'duracao_minutos' => $this->servico->duracao_minutos, 'preco' => $this->servico->preco]),
            'barbeiro' => $this->whenLoaded('barbeiro', fn () => ['id' => $this->barbeiro->id, 'nome' => $this->barbeiro->nome]),
        ];
    }
}
