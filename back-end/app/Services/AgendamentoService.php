<?php

namespace App\Services;

use App\Enums\StatusAgendamento;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\Barbeiro;
use App\Models\Cliente;
use App\Models\Servico;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgendamentoService
{
    /** @param array{servico_id:int,barbeiro_id:int,data_hora:string,observacoes?:string|null} $dados */
    public function criar(Barbearia $barbearia, Cliente $cliente, array $dados): Agendamento
    {
        return DB::transaction(function () use ($barbearia, $cliente, $dados): Agendamento {
            $barbeiro = Barbeiro::query()->whereKey($dados['barbeiro_id'])->lockForUpdate()->firstOrFail();
            $servico = Servico::query()->findOrFail($dados['servico_id']);

            if ($barbeiro->barbearia_id !== $barbearia->id || ! $barbeiro->ativo) {
                throw ValidationException::withMessages(['barbeiro_id' => ['Profissional indisponível para esta barbearia.']]);
            }
            if ($servico->barbearia_id !== $barbearia->id || ! $servico->ativo || ! $barbeiro->servicos()->whereKey($servico->id)->exists()) {
                throw ValidationException::withMessages(['servico_id' => ['Serviço indisponível para o profissional selecionado.']]);
            }

            $inicio = CarbonImmutable::createFromFormat('Y-m-d H:i', $dados['data_hora'], $barbearia->fuso_horario);
            if (! $inicio || $inicio->lessThanOrEqualTo(now($barbearia->fuso_horario))) {
                throw ValidationException::withMessages(['data_hora' => ['Escolha um horário futuro.']]);
            }
            $fim = $inicio->addMinutes($servico->duracao_minutos);
            $this->validarHorario($barbearia, $barbeiro, $inicio, $fim);

            $conflito = Agendamento::query()->where('barbeiro_id', $barbeiro->id)
                ->whereIn('status', [StatusAgendamento::Pendente->value, StatusAgendamento::Confirmado->value])
                ->where('data_hora', '<', $fim->format('Y-m-d H:i:s'))
                ->whereRaw("datetime(data_hora, '+' || (select duracao_minutos from servicos where servicos.id = agendamentos.servico_id) || ' minutes') > ?", [$inicio->format('Y-m-d H:i:s')])
                ->exists();
            if ($conflito) {
                throw ValidationException::withMessages(['data_hora' => ['Este horário acabou de ser reservado. Escolha outro.']]);
            }

            return Agendamento::query()->create([
                'barbearia_id' => $barbearia->id, 'cliente_id' => $cliente->id,
                'barbeiro_id' => $barbeiro->id, 'servico_id' => $servico->id,
                'data_hora' => $inicio, 'status' => StatusAgendamento::Pendente,
                'observacoes' => $dados['observacoes'] ?? null,
            ])->load(['servico', 'barbeiro']);
        });
    }

    private function validarHorario(Barbearia $barbearia, Barbeiro $barbeiro, CarbonImmutable $inicio, CarbonImmutable $fim): void
    {
        $dia = $inicio->dayOfWeek;
        $horarioBarbearia = $barbearia->horariosFuncionamento()->where('dia_semana', $dia)->first();
        $horarioBarbeiro = $barbeiro->horariosTrabalho()->where('dia_semana', $dia)->first();
        $abertura = $inicio->format('H:i:s'); $fechamento = $fim->format('H:i:s');
        if (! $horarioBarbearia || $horarioBarbearia->fechado || ! $horarioBarbearia->abre_as || ! $horarioBarbearia->fecha_as || $abertura < $horarioBarbearia->abre_as || $fechamento > $horarioBarbearia->fecha_as || ($horarioBarbeiro && ($horarioBarbeiro->indisponivel || ! $horarioBarbeiro->inicia_as || $abertura < $horarioBarbeiro->inicia_as || $fechamento > $horarioBarbeiro->termina_as))) {
            throw ValidationException::withMessages(['data_hora' => ['O horário está fora da disponibilidade do profissional.']]);
        }
    }
}
