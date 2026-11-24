<?php

use App\Http\Middleware\ExigirAdministradorBarbearia;
use App\Http\Middleware\ExigirBarbeiroBarbearia;
use App\Http\Middleware\ExigirLogin;
use App\Http\Middleware\ExigirSenhaAtualizada;
use App\Http\Middleware\AtribuirIdentificadorRequisicao;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/health',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(AtribuirIdentificadorRequisicao::class);

        $middleware->alias([
            'exigirLogin' => ExigirLogin::class,
            'exigirSenhaAtualizada' => ExigirSenhaAtualizada::class,
            'exigirAdministradorBarbearia' => ExigirAdministradorBarbearia::class,
            'exigirBarbeiroBarbearia' => ExigirBarbeiroBarbearia::class,
        ]);

        $middleware->appendToGroup('api', [
            ExigirLogin::class,
            ExigirSenhaAtualizada::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->context(function (Throwable $exception, array $context): array {
            $request = request();

            return array_merge($context, [
                'request_id' => $request->attributes->get('request_id'),
                'request_method' => $request->method(),
                'request_path' => $request->path(),
                'user_id' => $request->user()?->getAuthIdentifier(),
                'exception_class' => $exception::class,
            ]);
        });
        $exceptions->respond(function (Response $response): Response {
            $identificador = request()->attributes->get('request_id');

            if (is_string($identificador)) {
                $response->headers->set('X-Request-ID', $identificador);
            }

            return $response;
        });
    })->create();
