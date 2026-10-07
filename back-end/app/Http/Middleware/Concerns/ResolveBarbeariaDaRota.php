<?php

namespace App\Http\Middleware\Concerns;

use App\Models\Barbearia;
use Illuminate\Http\Request;

trait ResolveBarbeariaDaRota
{
    private function resolverBarbearia(Request $request): Barbearia
    {
        $parametro = $request->route('barbearia');

        if ($parametro instanceof Barbearia) {
            return $parametro;
        }

        if (! is_string($parametro) && ! is_int($parametro)) {
            abort(404, 'Barbearia não encontrada.');
        }

        $barbearia = Barbearia::query()
            ->where((new Barbearia)->getRouteKeyName(), $parametro)
            ->firstOrFail();

        $request->route()?->setParameter('barbearia', $barbearia);

        return $barbearia;
    }
}
