<?php

namespace App\Providers;

use App\Models\Agendamento;
use App\Models\Barbearia;
use App\Models\Barbeiro;
use App\Models\Servico;
use App\Policies\AgendamentoPolicy;
use App\Policies\BarbeariaPolicy;
use App\Policies\BarbeiroPolicy;
use App\Policies\ServicoPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Barbearia::class, BarbeariaPolicy::class);
        Gate::policy(Barbeiro::class, BarbeiroPolicy::class);
        Gate::policy(Servico::class, ServicoPolicy::class);
        Gate::policy(Agendamento::class, AgendamentoPolicy::class);
    }
}
