<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'message' => 'Backend conectado com sucesso.',
            'timestamp' => now()->toISOString(),
        ]);
    });

    Route::prefix('auth')->controller(AuthController::class)->group(function () {
        Route::post('/registro', 'registro')->name('api.v1.auth.registro');
        Route::post('/login', 'login')->name('api.v1.auth.login');
        Route::get('/me', 'me')->name('api.v1.auth.me');
    });
});
