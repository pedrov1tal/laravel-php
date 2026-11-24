<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AtribuirIdentificadorRequisicao
{
    public function handle(Request $request, Closure $next): Response
    {
        $identificador = $request->headers->get('X-Request-ID');

        if (! \is_string($identificador) || preg_match('/\A[A-Za-z0-9._-]{1,64}\z/', $identificador) !== 1) {
            $identificador = (string) Str::uuid();
        }

        $request->attributes->set('request_id', $identificador);
        $response = $next($request);
        $response->headers->set('X-Request-ID', $identificador);

        return $response;
    }
}
