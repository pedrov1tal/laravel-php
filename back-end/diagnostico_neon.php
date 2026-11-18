<?php

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::listen(function ($query): void {
        echo 'SQL:'.$query->sql.PHP_EOL;
    });

    $barbearia = App\Models\Barbearia::findOrFail(2);
    $cliente = App\Models\Cliente::findOrFail(1);
    $agendamento = app(App\Services\AgendamentoService::class)->criar(
        $barbearia,
        $cliente,
        [
            'servico_id' => 1,
            'barbeiro_id' => 1,
            'data_hora' => '2026-12-18 15:30',
            'observacoes' => 'Teste Neon',
        ],
    );

    echo 'CRIADO:'.$agendamento->id.PHP_EOL;
} catch (Throwable $e) {
    while ($e) {
        echo 'EXCECAO:'.get_class($e).'|'.$e->getMessage().PHP_EOL;
        $e = $e->getPrevious();
    }
}
