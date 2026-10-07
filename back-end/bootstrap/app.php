<?php

use App\Http\Middleware\ExigirAdministradorBarbearia;
use App\Http\Middleware\ExigirBarbeiroBarbearia;
use App\Http\Middleware\ExigirLogin;
use App\Http\Middleware\ExigirSenhaAtualizada;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
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
    })->create();
