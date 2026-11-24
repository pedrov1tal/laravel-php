<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BarbeariaResource;
use App\Models\Barbearia;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClienteBarbeariaFavoritaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return BarbeariaResource::collection(
            $this->clienteAutenticado($request)
                ->barbeariasFavoritas()
                ->where('barbearias.ativa', true)
                ->orderBy('nome')
                ->get(),
        );
    }

    public function store(Request $request, Barbearia $barbearia): JsonResponse
    {
        abort_unless($barbearia->ativa, 404);

        $this->clienteAutenticado($request)
            ->barbeariasFavoritas()
            ->syncWithoutDetaching([$barbearia->getKey()]);

        $recurso = new BarbeariaResource($barbearia);

        return response()->json($recurso->resolve($request));
    }

    public function destroy(Request $request, Barbearia $barbearia): JsonResponse
    {
        $this->clienteAutenticado($request)
            ->barbeariasFavoritas()
            ->detach($barbearia->getKey());

        return response()->json(['message' => 'Barbearia removida dos favoritos.']);
    }

    private function clienteAutenticado(Request $request): Cliente
    {
        $cliente = $request->user()?->cliente;

        abort_unless($cliente instanceof Cliente, 403, 'Perfil de cliente não encontrado.');

        return $cliente;
    }
}
