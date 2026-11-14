<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteAdminResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'telefone' => $this->telefone,
            'email' => $this->email,
            'agendamentos_concluidos' => (int) ($this->atendimentos_count ?? 0),
            'cancelamentos' => (int) ($this->cancelamentos_count ?? 0),
            'faltas' => (int) ($this->faltas_count ?? 0),
            'ultima_visita' => $this->ultima_visita_em,
            'bloqueado' => (bool) ($this->pivot?->bloqueado ?? false),
            'observacoes_internas' => $this->pivot?->observacoes_internas,
            'agendamentos' => $this->whenLoaded('agendamentos', fn () => AgendamentoResource::collection($this->agendamentos)),
        ];
    }
}
