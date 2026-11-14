<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\StatusAgendamento;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateClienteRequest;
use App\Http\Resources\Api\V1\ClienteAdminResource;
use App\Models\Barbearia;
use App\Models\Cliente;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ClienteController extends Controller
{
    public function index(Request $request, Barbearia $barbearia): AnonymousResourceCollection
    {
        $termo = trim((string) $request->query('busca', ''));
        $clientes = $this->consultaPorBarbearia($barbearia)
            ->when($termo !== '', function (Builder $query) use ($termo): void {
                $query->where(function (Builder $consulta) use ($termo): void {
                    $consulta->where('clientes.nome', 'like', "%{$termo}%")
                        ->orWhere('clientes.telefone', 'like', "%{$termo}%")
                        ->orWhere('clientes.email', 'like', "%{$termo}%");
                });
            })
            ->orderByDesc('barbearia_cliente.created_at')
            ->paginate(20)
            ->withQueryString();

        return ClienteAdminResource::collection($clientes);
    }

    public function show(Barbearia $barbearia, Cliente $cliente): ClienteAdminResource
    {
        $cliente = $this->consultaPorBarbearia($barbearia)
            ->with(['agendamentos' => fn (Builder $query) => $query
                ->where('barbearia_id', $barbearia->id)
                ->with(['servico', 'barbeiro'])
                ->latest('data_hora')])
            ->findOrFail($cliente->getKey());

        return new ClienteAdminResource($cliente);
    }

    public function update(UpdateClienteRequest $request, Barbearia $barbearia, Cliente $cliente): JsonResponse
    {
        abort_unless($barbearia->clientes()->whereKey($cliente->getKey())->exists(), 404);
        $barbearia->clientes()->updateExistingPivot($cliente->getKey(), $request->validated());

        $atualizado = $this->consultaPorBarbearia($barbearia)->findOrFail($cliente->getKey());

        return response()->json((new ClienteAdminResource($atualizado))->resolve($request));
    }

    private function consultaPorBarbearia(Barbearia $barbearia): BelongsToMany
    {
        return $barbearia->clientes()
            ->withCount([
                'agendamentos as atendimentos_count' => fn (Builder $query) => $query
                    ->where('barbearia_id', $barbearia->id)
                    ->where('status', StatusAgendamento::Concluido->value),
                'agendamentos as cancelamentos_count' => fn (Builder $query) => $query
                    ->where('barbearia_id', $barbearia->id)
                    ->where('status', StatusAgendamento::Cancelado->value)
                    ->where('nao_compareceu', false),
                'agendamentos as faltas_count' => fn (Builder $query) => $query
                    ->where('barbearia_id', $barbearia->id)
                    ->where('nao_compareceu', true),
            ])
            ->withMax([
                'agendamentos as ultima_visita_em' => fn (Builder $query) => $query
                    ->where('barbearia_id', $barbearia->id)
                    ->where('status', StatusAgendamento::Concluido->value),
            ], 'data_hora');
    }
}
