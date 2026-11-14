<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Agendamento\StoreAgendamentoRequest;
use App\Http\Resources\Api\V1\AgendamentoResource;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Services\AgendamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Carbon\CarbonImmutable;
use App\Enums\StatusAgendamento;

class AgendamentoController extends Controller
{
    public function contexto(Request $request, Barbearia $barbearia): JsonResponse
    {
        abort_unless($barbearia->ativa, 404);
        $servicos = $barbearia->servicos()->ativos()->get();
        $servicoSelecionado = null;
        if ($request->filled('servico_id')) {
            $servicoSelecionado = $barbearia->servicos()->ativos()->findOrFail($request->integer('servico_id'));
        }

        $barbeirosConsulta = $barbearia->barbeiros()->ativos()
            ->with(['servicos' => fn ($query) => $query->ativos()]);
        if ($servicoSelecionado) {
            $barbeirosConsulta->whereHas('servicos', fn ($query) => $query->whereKey($servicoSelecionado->id)->where('servicos.ativo', true));
        }
        $barbeiros = $barbeirosConsulta->get();

        $agenda = $barbeiros->mapWithKeys(function ($barbeiro) use ($barbearia, $servicoSelecionado): array {
            $horarios = $barbeiro->horariosTrabalho()->get()->keyBy('dia_semana');
            $primeiroDia = CarbonImmutable::now($barbearia->fuso_horario)->startOfDay()->addDay();
            $ultimoDia = $primeiroDia->addDays(6)->endOfDay();
            $agendamentosAtivos = $barbeiro->agendamentos()
                ->with('servico:id,duracao_minutos')
                ->whereIn('status', [StatusAgendamento::Pendente->value, StatusAgendamento::Confirmado->value])
                ->whereBetween('data_hora', [$primeiroDia->format('Y-m-d H:i:s'), $ultimoDia->format('Y-m-d H:i:s')])
                ->get();
            $ausencias = $barbeiro->ausencias()
                ->where('inicio_em', '<', $ultimoDia->format('Y-m-d H:i:s'))
                ->where('fim_em', '>', $primeiroDia->format('Y-m-d H:i:s'))
                ->get();
            $agenda = collect(range(0, 6))->map(function (int $deslocamento) use ($barbearia, $horarios, $primeiroDia, $servicoSelecionado, $agendamentosAtivos, $ausencias): array {
                $data = $primeiroDia->addDays($deslocamento);
                $funcionamento = $barbearia->horariosFuncionamento()->where('dia_semana', $data->dayOfWeek)->first();
                $trabalho = $horarios->get($data->dayOfWeek);
                $abre = $trabalho?->inicia_as ?? $funcionamento?->abre_as;
                $fecha = $trabalho?->termina_as ?? $funcionamento?->fecha_as;
                $indisponivel = ! $funcionamento || $funcionamento->fechado || ! $abre || ! $fecha || ($trabalho && $trabalho->indisponivel);
                $slots = [];
                if (! $indisponivel) {
                    $duracao = (int) ($servicoSelecionado?->duracao_minutos ?? 30);
                    $inicioExpediente = CarbonImmutable::parse($data->format('Y-m-d').' '.$abre, $barbearia->fuso_horario);
                    $fimExpediente = CarbonImmutable::parse($data->format('Y-m-d').' '.$fecha, $barbearia->fuso_horario);
                    for ($slot = $inicioExpediente; $slot->addMinutes($duracao)->lessThanOrEqualTo($fimExpediente); $slot = $slot->addMinutes(30)) {
                        if ($slot->lessThanOrEqualTo(CarbonImmutable::now($barbearia->fuso_horario))) {
                            continue;
                        }

                        $fimSlot = $slot->addMinutes($duracao);
                        $pausa = $trabalho && $trabalho->pausa_inicio && $trabalho->pausa_fim
                            ? [
                                CarbonImmutable::parse($data->format('Y-m-d').' '.$trabalho->pausa_inicio, $barbearia->fuso_horario),
                                CarbonImmutable::parse($data->format('Y-m-d').' '.$trabalho->pausa_fim, $barbearia->fuso_horario),
                            ]
                            : null;
                        $conflitoPausa = $pausa && $slot->lessThan($pausa[1]) && $fimSlot->greaterThan($pausa[0]);
                        $conflitoAusencia = $ausencias->contains(function ($ausencia) use ($slot, $fimSlot, $barbearia): bool {
                            $inicioAusencia = CarbonImmutable::parse($ausencia->getRawOriginal('inicio_em'), $barbearia->fuso_horario);
                            $fimAusencia = CarbonImmutable::parse($ausencia->getRawOriginal('fim_em'), $barbearia->fuso_horario);

                            return $slot->lessThan($fimAusencia) && $fimSlot->greaterThan($inicioAusencia);
                        });
                        $conflito = $agendamentosAtivos->contains(function ($agendamento) use ($slot, $fimSlot, $barbearia): bool {
                            $inicioAgendado = CarbonImmutable::parse($agendamento->getRawOriginal('data_hora'), $barbearia->fuso_horario);
                            $fimAgendado = $inicioAgendado->addMinutes((int) $agendamento->servico->duracao_minutos);

                            return $slot->lessThan($fimAgendado) && $fimSlot->greaterThan($inicioAgendado);
                        });
                        if (! $conflito && ! $conflitoPausa && ! $conflitoAusencia) {
                            $slots[] = ['horario' => $slot->format('H:i'), 'disponivel' => true];
                        }
                    }
                }
                return ['data' => $data->format('Y-m-d'), 'disponivel' => $slots !== [], 'horarios' => $slots];
            })->all();
            return [(string) $barbeiro->id => $agenda];
        });

        return response()->json([
            'estabelecimento' => ['id' => (string) $barbearia->id, 'slug' => $barbearia->slug, 'nome' => $barbearia->nome, 'iniciais' => mb_strtoupper(mb_substr($barbearia->nome, 0, 2)), 'endereco' => $barbearia->endereco ?? '', 'telefone' => $barbearia->telefone ?? ''],
            'servicos' => $servicos->map(fn ($servico) => ['id' => (string) $servico->id, 'nome' => $servico->nome, 'descricao' => $servico->descricao ?? '', 'duracaoMinutos' => $servico->duracao_minutos, 'precoCentavos' => (int) round($servico->preco * 100)])->values(),
            'profissionais' => $barbeiros->map(fn ($barbeiro) => ['id' => (string) $barbeiro->id, 'nome' => $barbeiro->nome, 'especialidade' => '', 'iniciais' => mb_strtoupper(mb_substr($barbeiro->nome, 0, 2)), 'servicoIds' => $barbeiro->servicos->pluck('id')->map(fn ($id) => (string) $id)->values()])->values(),
            'agendaPorProfissional' => $agenda,
        ]);
    }

    public function store(StoreAgendamentoRequest $request, Barbearia $barbearia, AgendamentoService $service): JsonResponse
    {
        Gate::forUser($request->user())->authorize('create', [Agendamento::class, $barbearia]);
        $cliente = $request->user()->cliente;
        abort_unless($cliente, 403, 'Perfil de cliente não encontrado.');
        abort_unless(
            ! $barbearia->clientes()->whereKey($cliente->getKey())->wherePivot('bloqueado', true)->exists(),
            403,
            'Esta conta nao pode realizar novos agendamentos nesta barbearia.',
        );
        $barbearia->clientes()->syncWithoutDetaching([$cliente->id]);
        return response()->json((new AgendamentoResource($service->criar($barbearia, $cliente, $request->validated())))->resolve($request), 201);
    }

    public function meus(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        abort_unless($request->user(), 401);
        $cliente = $request->user()->cliente;
        abort_unless($cliente, 403, 'Perfil de cliente não encontrado.');
        return AgendamentoResource::collection(Agendamento::query()->where('cliente_id', $cliente->id)->with(['barbearia:id,nome,slug', 'servico', 'barbeiro'])->latest('data_hora')->paginate());
    }

    public function cancelarMeu(Request $request, Agendamento $agendamento, AgendamentoService $service): JsonResponse
    {
        abort_unless($request->user(), 401);
        $agendamento = $service->cancelarPeloCliente($agendamento, $request->user());

        return response()->json((new AgendamentoResource($agendamento->load(['barbearia:id,nome,slug', 'servico', 'barbeiro'])))->resolve($request));
    }
}
