<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreServicoRequest;
use App\Http\Resources\Api\V1\ServicoResource;
use App\Models\Barbearia;
use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServicoController extends Controller
{
    public function index(Barbearia $barbearia): AnonymousResourceCollection
    {
        return ServicoResource::collection($barbearia->servicos()->orderBy('nome')->paginate(20));
    }

    public function store(StoreServicoRequest $request, Barbearia $barbearia): JsonResponse
    {
        $servico = $barbearia->servicos()->create($request->validated());

        return response()->json((new ServicoResource($servico))->resolve($request), 201);
    }

    public function update(StoreServicoRequest $request, Barbearia $barbearia, Servico $servico): JsonResponse
    {
        abort_unless($servico->barbearia_id === $barbearia->id, 404);
        $servico->update($request->validated());

        return response()->json((new ServicoResource($servico->refresh()))->resolve($request));
    }

    public function destroy(Barbearia $barbearia, Servico $servico): JsonResponse
    {
        abort_unless($servico->barbearia_id === $barbearia->id, 404);
        if ($servico->agendamentos()->exists()) {
            return response()->json([
                'message' => 'Este serviço possui agendamentos no histórico. Desative-o para impedir novas reservas.',
            ], 409);
        }

        $servico->delete();

        return response()->json(['message' => 'Serviço removido com sucesso.']);
    }
}
