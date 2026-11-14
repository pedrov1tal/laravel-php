<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarbeiroResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'telefone' => $this->telefone,
            'email' => $this->email,
            'ativo' => (bool) $this->ativo,
            'servicos' => $this->whenLoaded('servicos', fn () => $this->servicos->map(fn ($servico) => [
                'id' => $servico->id,
                'nome' => $servico->nome,
            ])->values()),
            'jornada' => $this->whenLoaded('horariosTrabalho', fn () => $this->horariosTrabalho->map(fn ($horario) => [
                'dia_semana' => $horario->dia_semana,
                'indisponivel' => (bool) $horario->indisponivel,
                'inicia_as' => $horario->inicia_as,
                'termina_as' => $horario->termina_as,
                'pausa_inicio' => $horario->pausa_inicio,
                'pausa_fim' => $horario->pausa_fim,
            ])->values()),
            'ausencias' => $this->whenLoaded('ausencias', fn () => $this->ausencias->map(fn ($ausencia) => [
                'id' => $ausencia->id,
                'inicio_em' => $ausencia->getRawOriginal('inicio_em'),
                'fim_em' => $ausencia->getRawOriginal('fim_em'),
                'motivo' => $ausencia->motivo,
            ])->values()),
            'agendamentos' => $this->whenLoaded('agendamentos', fn () => $this->agendamentos->map(fn ($agendamento) => [
                'id' => $agendamento->id,
                'data_hora' => $agendamento->getRawOriginal('data_hora'),
                'status' => $agendamento->status->value,
                'cliente' => $agendamento->cliente?->nome,
                'servico' => $agendamento->servico?->nome,
            ])->values()),
        ];
    }
}
