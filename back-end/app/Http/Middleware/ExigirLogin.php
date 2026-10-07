<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\JwtService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ExigirLogin
{
    private const ROTAS_PUBLICAS = [
        'api.v1.health',
        'api.v1.auth.registro',
        'api.v1.auth.login',
    ];

    public function __construct(private readonly JwtService $jwt) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->podeAcessarSemLogin($request)) {
            return $next($request);
        }

        $token = $request->bearerToken();

        if (! $token) {
            return $this->naoAutorizado();
        }

        try {
            $usuario = User::query()->find($this->jwt->obterUsuarioId($token));
        } catch (Throwable) {
            return $this->naoAutorizado();
        }

        if (! $usuario) {
            return $this->naoAutorizado();
        }

        $request->setUserResolver(fn () => $usuario);

        return $next($request);
    }

    private function podeAcessarSemLogin(Request $request): bool
    {
        if ($request->isMethod('OPTIONS')) {
            return true;
        }

        return $request->routeIs(...self::ROTAS_PUBLICAS);
    }

    private function naoAutorizado(): JsonResponse
    {
        return response()->json([
            'message' => 'Não autenticado.',
        ], 401);
    }
}
