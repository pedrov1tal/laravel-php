<?php

namespace App\Services;

use App\Enums\StatusAgendamento;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\Barbeiro;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgendamentoService
{
    public function confirmar(Agendamento $agendamento, Barbearia $barbearia): Agendamento
    {
        return DB::transaction(function () use ($agendamento, $barbearia): Agendamento {
            $agendamento = Agendamento::query()->lockForUpdate()->findOrFail($agendamento->getKey());
            if ($agendamento->barbearia_id !== $barbearia->id) {
                abort(404);
            }
            if ($agendamento->status !== StatusAgendamento::Pendente) {
                throw ValidationException::withMessages(['agendamento' => ['Somente agendamentos pendentes podem ser confirmados.']]);
            }

            $agendamento->loadMissing(['servico', 'barbeiro']);
            $inicio = CarbonImmutable::parse($agendamento->getRawOriginal('data_hora'), $barbearia->fuso_horario);
            if ($inicio->lessThanOrEqualTo(CarbonImmutable::now($barbearia->fuso_horario))) {
                throw ValidationException::withMessages(['agendamento' => ['Não é possível confirmar um horário que já começou.']]);
            }
            $fim = $inicio->addMinutes($agendamento->servico->duracao_minutos);
            $this->validarHorario($barbearia, $agendamento->barbeiro, $inicio, $fim);
            $conflito = Agendamento::query()
                ->where('barbeiro_id', $agendamento->barbeiro_id)
                ->where('id', '<>', $agendamento->id)
                ->whereIn('status', [StatusAgendamento::Pendente->value, StatusAgendamento::Confirmado->value])
                ->where('data_hora', '<', $fim->format('Y-m-d H:i:s'))
                ->whereRaw("datetime(data_hora, '+' || (select duracao_minutos from servicos where servicos.id = agendamentos.servico_id) || ' minutes') > ?", [$inicio->format('Y-m-d H:i:s')])
                ->exists();
            if ($conflito) {
                throw ValidationException::withMessages(['agendamento' => ['O horário não está mais disponível para confirmação.']]);
            }

            $agendamento->forceFill(['status' => StatusAgendamento::Confirmado])->save();

            return $agendamento;
        });
    }

    public function cancelar(Agendamento $agendamento, User $usuario, string $motivo): Agendamento
    {
        return DB::transaction(function () use ($agendamento, $usuario, $motivo): Agendamento {
            $agendamento = Agendamento::query()->lockForUpdate()->findOrFail($agendamento->getKey());

            if (! in_array($agendamento->status, [StatusAgendamento::Pendente, StatusAgendamento::Confirmado], true)) {
                throw ValidationException::withMessages([
                    'agendamento' => ['Este horário já foi finalizado ou cancelado.'],
                ]);
            }

            $agendamento->forceFill([
                'status' => StatusAgendamento::Cancelado,
                'cancelado_por_user_id' => $usuario->getKey(),
                'cancelado_em' => now(),
                'motivo_cancelamento' => $motivo,
            ])->save();

            return $agendamento;
        });
    }

    public function concluir(Agendamento $agendamento, Barbearia $barbearia): Agendamento
    {
        return DB::transaction(function () use ($agendamento, $barbearia): Agendamento {
            $agendamento = Agendamento::query()->lockForUpdate()->findOrFail($agendamento->getKey());

            if ($agendamento->barbearia_id !== $barbearia->id) {
                abort(404);
            }

            if (! in_array($agendamento->status, [StatusAgendamento::Pendente, StatusAgendamento::Confirmado], true)) {
                throw ValidationException::withMessages([
                    'agendamento' => ['Este agendamento já foi finalizado ou cancelado.'],
                ]);
            }

            $agendamento->loadMissing('servico');
            $fimPrevisto = CarbonImmutable::parse($agendamento->getRawOriginal('data_hora'), $barbearia->fuso_horario)
                ->addMinutes($agendamento->servico->duracao_minutos);
            if ($fimPrevisto->isFuture()) {
                throw ValidationException::withMessages([
                    'agendamento' => ['Não é possível concluir antes do término previsto do atendimento.'],
                ]);
            }

            $agendamento->forceFill(['status' => StatusAgendamento::Concluido])->save();

            return $agendamento;
        });
    }

    public function cancelarPeloCliente(Agendamento $agendamento, User $usuario): Agendamento
    {
        return DB::transaction(function () use ($agendamento, $usuario): Agendamento {
            $agendamento = Agendamento::query()->lockForUpdate()->findOrFail($agendamento->getKey());
            $cliente = $usuario->cliente;
            if (! $cliente || $agendamento->cliente_id !== $cliente->id) {
                abort(404);
            }

            if (! in_array($agendamento->status, [StatusAgendamento::Pendente, StatusAgendamento::Confirmado], true)) {
                throw ValidationException::withMessages([
                    'agendamento' => ['Este agendamento já foi finalizado ou cancelado.'],
                ]);
            }

            $agendamento->loadMissing('barbearia');
            $fuso = $agendamento->barbearia->fuso_horario;
            $inicio = CarbonImmutable::parse($agendamento->getRawOriginal('data_hora'), $fuso);
            $limiteCancelamento = $inicio->subMinutes($agendamento->barbearia->antecedencia_cancelamento_minutos);
            if (CarbonImmutable::now($fuso)->greaterThanOrEqualTo($limiteCancelamento)) {
                throw ValidationException::withMessages([
                    'agendamento' => ['O prazo para cancelar este horário já terminou. Entre em contato com a barbearia.'],
                ]);
            }

            $agendamento->forceFill([
                'status' => StatusAgendamento::Cancelado,
                'cancelado_por_user_id' => $usuario->getKey(),
                'cancelado_em' => CarbonImmutable::now($fuso),
                'motivo_cancelamento' => 'Cancelado pelo cliente.',
            ])->save();

            return $agendamento;
        });
    }

    public function marcarNaoComparecimento(Agendamento $agendamento, Barbearia $barbearia, User $usuario): Agendamento
    {
        return DB::transaction(function () use ($agendamento, $barbearia, $usuario): Agendamento {
            $agendamento = Agendamento::query()->lockForUpdate()->findOrFail($agendamento->getKey());
            if ($agendamento->barbearia_id !== $barbearia->id) {
                abort(404);
            }

            if (! in_array($agendamento->status, [StatusAgendamento::Pendente, StatusAgendamento::Confirmado], true)) {
                throw ValidationException::withMessages(['agendamento' => ['Este atendimento já foi encerrado.']]);
            }

            $agendamento->loadMissing('servico');
            $fuso = $barbearia->fuso_horario;
            $fimPrevisto = CarbonImmutable::parse($agendamento->getRawOriginal('data_hora'), $fuso)
                ->addMinutes($agendamento->servico->duracao_minutos);
            if ($fimPrevisto->isFuture()) {
                throw ValidationException::withMessages(['agendamento' => ['Registre a falta após o horário previsto do atendimento.']]);
            }

            $agendamento->forceFill([
                'status' => StatusAgendamento::Cancelado,
                'nao_compareceu' => true,
                'cancelado_por_user_id' => $usuario->getKey(),
                'cancelado_em' => CarbonImmutable::now($fuso),
                'motivo_cancelamento' => 'Cliente não compareceu.',
            ])->save();

            return $agendamento;
        });
    }

    /** @param array{servico_id:int,barbeiro_id:int,data_hora:string,observacoes?:string|null} $dados */
    public function criar(Barbearia $barbearia, Cliente $cliente, array $dados, StatusAgendamento $status = StatusAgendamento::Pendente): Agendamento
    {
        return DB::transaction(function () use ($barbearia, $cliente, $dados, $status): Agendamento {
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
                'data_hora' => $inicio, 'status' => $status,
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
        $foraDaJornadaBarbeiro = $horarioBarbeiro && ($horarioBarbeiro->indisponivel || ! $horarioBarbeiro->inicia_as || ! $horarioBarbeiro->termina_as || $abertura < $horarioBarbeiro->inicia_as || $fechamento > $horarioBarbeiro->termina_as);
        $conflitoPausa = $horarioBarbeiro?->pausa_inicio && $horarioBarbeiro?->pausa_fim
            && $abertura < $horarioBarbeiro->pausa_fim && $fechamento > $horarioBarbeiro->pausa_inicio;
        $conflitoAusencia = $barbeiro->ausencias()
            ->where('inicio_em', '<', $fim->format('Y-m-d H:i:s'))
            ->where('fim_em', '>', $inicio->format('Y-m-d H:i:s'))
            ->exists();

        if (! $horarioBarbearia || $horarioBarbearia->fechado || ! $horarioBarbearia->abre_as || ! $horarioBarbearia->fecha_as || $abertura < $horarioBarbearia->abre_as || $fechamento > $horarioBarbearia->fecha_as || $foraDaJornadaBarbeiro || $conflitoPausa || $conflitoAusencia) {
            throw ValidationException::withMessages(['data_hora' => ['O horário está fora da disponibilidade do profissional.']]);
        }
    }
}
