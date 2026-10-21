<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AgendamentoController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->scopeBindings()->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'message' => 'Backend conectado com sucesso.',
            'timestamp' => now()->toISOString(),
        ]);
    })->name('api.v1.health');

    Route::prefix('auth')->controller(AuthController::class)->group(function () {
        Route::post('/registro', 'registro')->name('api.v1.auth.registro');
        Route::post('/login', 'login')->name('api.v1.auth.login');
        Route::get('/me', 'me')->name('api.v1.auth.me');
        Route::put('/senha', 'alterarSenha')->name('api.v1.auth.senha.update');
    });

    Route::get('/barbearias/{barbearia}/contexto-agendamento', [AgendamentoController::class, 'contexto'])->name('api.v1.barbearias.contexto');
    Route::post('/barbearias/{barbearia}/agendamentos', [AgendamentoController::class, 'store'])->name('api.v1.barbearias.agendamentos.store');
    Route::get('/cliente/agendamentos', [AgendamentoController::class, 'meus'])->name('api.v1.cliente.agendamentos');

    Route::prefix('/admin/barbearias/{barbearia}')->middleware('exigirAdministradorBarbearia')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'show'])->name('api.v1.admin.dashboard');
    });
});
