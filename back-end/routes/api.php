<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AgendamentoController;
use App\Http\Controllers\Api\V1\Admin\DashboardController;
use App\Http\Controllers\Api\V1\Admin\BarbeiroController;
use App\Http\Controllers\Api\V1\Admin\AgendamentoController as AdminAgendamentoController;
use App\Http\Controllers\Api\V1\Admin\ServicoController;
use App\Http\Controllers\Api\V1\Admin\ClienteController;
use App\Http\Controllers\Api\V1\Admin\ConfiguracaoController;
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
    Route::patch('/cliente/agendamentos/{agendamento}/cancelamento', [AgendamentoController::class, 'cancelarMeu'])->name('api.v1.cliente.agendamentos.cancelar');

    Route::prefix('/admin/barbearias/{barbearia}')->middleware('exigirAdministradorBarbearia')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'show'])->name('api.v1.admin.dashboard');
        Route::get('/configuracoes', [ConfiguracaoController::class, 'show'])->name('api.v1.admin.configuracoes.show');
        Route::patch('/configuracoes', [ConfiguracaoController::class, 'update'])->name('api.v1.admin.configuracoes.update');
        Route::put('/horarios-funcionamento', [ConfiguracaoController::class, 'horarios'])->name('api.v1.admin.horarios.update');
        Route::post('/barbeiros', [BarbeiroController::class, 'store'])->name('api.v1.admin.barbeiros.store');
        Route::get('/barbeiros', [BarbeiroController::class, 'index'])->name('api.v1.admin.barbeiros.index');
        Route::get('/barbeiros/{barbeiro}', [BarbeiroController::class, 'show'])->name('api.v1.admin.barbeiros.show');
        Route::put('/barbeiros/{barbeiro}', [BarbeiroController::class, 'update'])->name('api.v1.admin.barbeiros.update');
        Route::put('/barbeiros/{barbeiro}/jornada', [BarbeiroController::class, 'jornada'])->name('api.v1.admin.barbeiros.jornada.update');
        Route::post('/barbeiros/{barbeiro}/ausencias', [BarbeiroController::class, 'storeAusencia'])->name('api.v1.admin.barbeiros.ausencias.store');
        Route::delete('/barbeiros/{barbeiro}/ausencias/{ausencia}', [BarbeiroController::class, 'destroyAusencia'])->name('api.v1.admin.barbeiros.ausencias.destroy');
        Route::get('/agendamentos', [AdminAgendamentoController::class, 'index'])->name('api.v1.admin.agendamentos.index');
        Route::post('/agendamentos', [AdminAgendamentoController::class, 'store'])->name('api.v1.admin.agendamentos.store');
        Route::patch('/agendamentos/{agendamento}/confirmacao', [AdminAgendamentoController::class, 'confirmar'])->name('api.v1.admin.agendamentos.confirmar');
        Route::patch('/agendamentos/{agendamento}/cancelamento', [AdminAgendamentoController::class, 'cancelar'])->name('api.v1.admin.agendamentos.cancelar');
        Route::patch('/agendamentos/{agendamento}/conclusao', [AdminAgendamentoController::class, 'concluir'])->name('api.v1.admin.agendamentos.concluir');
        Route::patch('/agendamentos/{agendamento}/nao-comparecimento', [AdminAgendamentoController::class, 'registrarFalta'])->name('api.v1.admin.agendamentos.falta');
        Route::get('/servicos', [ServicoController::class, 'index'])->name('api.v1.admin.servicos.index');
        Route::post('/servicos', [ServicoController::class, 'store'])->name('api.v1.admin.servicos.store');
        Route::put('/servicos/{servico}', [ServicoController::class, 'update'])->name('api.v1.admin.servicos.update');
        Route::delete('/servicos/{servico}', [ServicoController::class, 'destroy'])->name('api.v1.admin.servicos.destroy');
        Route::get('/clientes', [ClienteController::class, 'index'])->name('api.v1.admin.clientes.index');
        Route::get('/clientes/{cliente}', [ClienteController::class, 'show'])->name('api.v1.admin.clientes.show');
        Route::patch('/clientes/{cliente}', [ClienteController::class, 'update'])->name('api.v1.admin.clientes.update');
    });
});
