<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StatusAgendamento;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\CancelarAgendamentoRequest;
use App\Http\Requests\Api\V1\Admin\IndexAgendamentosRequest;
use App\Http\Requests\Api\V1\Admin\StoreAgendamentoRequest;
use App\Http\Resources\Api\V1\AgendamentoResource;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Services\AgendamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AgendamentoController extends Controller
{
    public function confirmar(Request $request, Barbearia $barbearia, Agendamento $agendamento, AgendamentoService $service): JsonResponse
    {
        $agendamento = $service->confirmar($agendamento, $barbearia);

        return response()->json((new AgendamentoResource($agendamento->load(['cliente', 'barbeiro', 'servico'])))->resolve($request));
    }

    public function registrarFalta(Request $request, Barbearia $barbearia, Agendamento $agendamento, AgendamentoService $service): JsonResponse
    {
        $agendamento = $service->marcarNaoComparecimento($agendamento, $barbearia, $request->user());

        return response()->json((new AgendamentoResource($agendamento->load(['cliente', 'barbeiro', 'servico'])))->resolve($request));
    }

    public function store(StoreAgendamentoRequest $request, Barbearia $barbearia, AgendamentoService $service): JsonResponse
    {
        $dados = $request->validated();
        $cliente = $barbearia->clientes()->whereKey($dados['cliente_id'])->firstOrFail();
        if ($barbearia->clientes()->whereKey($cliente->id)->wherePivot('bloqueado', true)->exists()) {
            return response()->json(['message' => 'Este cliente está bloqueado para novos agendamentos nesta unidade.'], 422);
        }

        $status = StatusAgendamento::from($dados['status']);
        unset($dados['cliente_id'], $dados['status']);
        $agendamento = $service->criar($barbearia, $cliente, $dados, $status);

        return response()->json((new AgendamentoResource($agendamento->load(['cliente', 'barbeiro', 'servico'])))->resolve($request), 201);
    }

    public function index(IndexAgendamentosRequest $request, Barbearia $barbearia): AnonymousResourceCollection
    {
        $filtros = $request->validated();
        $consulta = $barbearia->agendamentos()->with(['cliente', 'barbeiro', 'servico']);
        if (! empty($filtros['data_inicio'])) {
            $consulta->where('data_hora', '>=', $filtros['data_inicio'].' 00:00:00');
        }
        if (! empty($filtros['data_fim'])) {
            $consulta->where('data_hora', '<=', $filtros['data_fim'].' 23:59:59');
        }
        $consulta
            ->when($filtros['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filtros['barbeiro_id'] ?? null, fn ($query, int $barbeiroId) => $query->where('barbeiro_id', $barbeiroId))
            ->when(trim($filtros['busca'] ?? '') !== '', function ($query) use ($filtros): void {
                $termo = trim($filtros['busca']);
                $query->whereHas('cliente', fn ($cliente) => $cliente
                    ->where('nome', 'like', "%{$termo}%")
                    ->orWhere('telefone', 'like', "%{$termo}%")
                    ->orWhere('email', 'like', "%{$termo}%"));
            });

        return AgendamentoResource::collection($consulta->orderBy('data_hora')->paginate(30)->withQueryString());
    }

    public function concluir(
        Request $request,
        Barbearia $barbearia,
        Agendamento $agendamento,
        AgendamentoService $service,
    ): JsonResponse {
        $agendamento = $service->concluir($agendamento, $barbearia);

        return response()->json((new AgendamentoResource($agendamento->load(['servico', 'barbeiro'])))->resolve($request));
    }

    public function cancelar(
        CancelarAgendamentoRequest $request,
        Barbearia $barbearia,
        Agendamento $agendamento,
        AgendamentoService $service,
    ): JsonResponse {
        abort_unless($agendamento->barbearia_id === $barbearia->id, 404);

        $agendamento = $service->cancelar(
            $agendamento,
            $request->user(),
            $request->validated('motivo'),
        );

        return response()->json((new AgendamentoResource($agendamento->load(['servico', 'barbeiro'])))->resolve($request));
    }
}
