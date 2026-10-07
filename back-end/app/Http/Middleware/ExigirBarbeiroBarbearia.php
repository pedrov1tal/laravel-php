<?php

namespace App\Http\Middleware;

use App\Http\Middleware\Concerns\ResolveBarbeariaDaRota;
use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExigirBarbeiroBarbearia
{
    use ResolveBarbeariaDaRota;

    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario instanceof User) {
            return $this->resposta('Não autenticado.', 401);
        }

        $barbearia = $this->resolverBarbearia($request);
        $atuaNaBarbearia = $usuario->perfisBarbeiro()
            ->where('barbearia_id', $barbearia->getKey())
            ->where('ativo', true)
            ->exists();

        if ($atuaNaBarbearia) {
            return $next($request);
        }

        if ($usuario->perfisBarbeiro()->where('ativo', true)->exists()) {
            abort(404, 'Barbearia não encontrada.');
        }

        return $this->resposta('Acesso restrito a barbeiros.', 403);
    }

    private function resposta(string $mensagem, int $status): JsonResponse
    {
        return response()->json(['message' => $mensagem], $status);
    }
}
