<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\CancelarAgendamentoRequest;
use App\Http\Resources\Api\V1\AgendamentoResource;
use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Services\AgendamentoService;
use Illuminate\Http\JsonResponse;

class AgendamentoController extends Controller
{
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
