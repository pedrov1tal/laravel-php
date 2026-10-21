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

class AgendamentoController extends Controller
{
    public function contexto(Barbearia $barbearia): JsonResponse
    {
        abort_unless($barbearia->ativa, 404);
        $servicos = $barbearia->servicos()->ativos()->get();
        $barbeiros = $barbearia->barbeiros()->ativos()->with(['servicos' => fn ($query) => $query->ativos()])->get();

        $agenda = $barbeiros->mapWithKeys(function ($barbeiro) use ($barbearia): array {
            $horarios = $barbeiro->horariosTrabalho()->get()->keyBy('dia_semana');
            $agenda = collect(range(1, 7))->map(function (int $deslocamento) use ($barbearia, $horarios): array {
                $data = CarbonImmutable::now($barbearia->fuso_horario)->startOfDay()->addDays($deslocamento);
                $funcionamento = $barbearia->horariosFuncionamento()->where('dia_semana', $data->dayOfWeek)->first();
                $trabalho = $horarios->get($data->dayOfWeek);
                $abre = $trabalho?->inicia_as ?? $funcionamento?->abre_as;
                $fecha = $trabalho?->termina_as ?? $funcionamento?->fecha_as;
                $indisponivel = ! $funcionamento || $funcionamento->fechado || ! $abre || ! $fecha || ($trabalho && $trabalho->indisponivel);
                $slots = [];
                if (! $indisponivel) {
                    for ($slot = CarbonImmutable::parse($data->format('Y-m-d').' '.$abre, $barbearia->fuso_horario); $slot->format('H:i:s') < $fecha; $slot = $slot->addMinutes(30)) {
                        $slots[] = ['horario' => $slot->format('H:i'), 'disponivel' => true];
                    }
                }
                return ['data' => $data->format('Y-m-d'), 'disponivel' => ! $indisponivel, 'horarios' => $slots];
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
        Gate::authorize('create', [Agendamento::class, $barbearia]);
        $cliente = $request->user()->cliente;
        abort_unless($cliente, 403, 'Perfil de cliente não encontrado.');
        $barbearia->clientes()->syncWithoutDetaching([$cliente->id]);
        return response()->json((new AgendamentoResource($service->criar($barbearia, $cliente, $request->validated())))->resolve($request), 201);
    }

    public function meus(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $cliente = $request->user()->cliente;
        abort_unless($cliente, 403, 'Perfil de cliente não encontrado.');
        return AgendamentoResource::collection(Agendamento::query()->where('cliente_id', $cliente->id)->with(['servico', 'barbeiro'])->latest('data_hora')->paginate());
    }
}
