<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExigirSenhaAtualizada
{
    private const ROTAS_PERMITIDAS = [
        'api.v1.health',
        'api.v1.auth.registro',
        'api.v1.auth.login',
        'api.v1.auth.me',
        'api.v1.auth.senha.update',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('OPTIONS') || $request->routeIs(...self::ROTAS_PERMITIDAS)) {
            return $next($request);
        }

        $usuario = $request->user();

        if (! $usuario instanceof User || ! $usuario->deve_trocar_senha) {
            return $next($request);
        }

        return $this->senhaDeveSerAlterada();
    }

    private function senhaDeveSerAlterada(): JsonResponse
    {
        return response()->json([
            'message' => 'Troque sua senha temporária para continuar.',
            'code' => 'troca_senha_obrigatoria',
        ], 403);
    }
}
