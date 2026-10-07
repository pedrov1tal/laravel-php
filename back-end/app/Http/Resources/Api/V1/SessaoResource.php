<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Barbearia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessaoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<int, array{barbearia: Barbearia, papeis: array<string, true>}> $acessos */
        $acessos = [];

        foreach ($this->barbeariasAdministradas as $barbearia) {
            $acessos[$barbearia->id] = [
                'barbearia' => $barbearia,
                'papeis' => ['administrador' => true],
            ];
        }

        foreach ($this->perfisBarbeiro as $perfil) {
            $barbearia = $perfil->barbearia;

            if (! $barbearia || ! $barbearia->ativa) {
                continue;
            }

            $acessos[$barbearia->id] ??= [
                'barbearia' => $barbearia,
                'papeis' => [],
            ];
            $acessos[$barbearia->id]['papeis']['barbeiro'] = true;
        }

        $barbearias = collect($acessos)
            ->map(function (array $acesso): array {
                return [
                    'id' => $acesso['barbearia']->id,
                    'slug' => $acesso['barbearia']->slug,
                    'nome' => $acesso['barbearia']->nome,
                    'papeis' => array_keys($acesso['papeis']),
                ];
            })
            ->sortBy('nome', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->all();

        return [
            'usuario' => (new UserResource($this->resource))->resolve($request),
            'cliente' => $this->cliente
                ? (new ClienteResource($this->cliente))->resolve($request)
                : null,
            'barbearias' => $barbearias,
        ];
    }
}
