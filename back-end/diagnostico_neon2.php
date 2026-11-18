<?php

require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::listen(fn ($q) => print('SQL:'.$q->sql.PHP_EOL));

    echo 'Barbeiro='.(App\Models\Barbeiro::find(1)?->nome ?? 'null').PHP_EOL;
    echo 'Servico='.(App\Models\Servico::find(1)?->nome ?? 'null').PHP_EOL;

    DB::transaction(function (): void {
        echo 'Dentro='.(App\Models\Barbeiro::query()->whereKey(1)->lockForUpdate()->firstOrFail()->nome).PHP_EOL;
        echo 'ServicoDentro='.(App\Models\Servico::find(1)?->nome ?? 'null').PHP_EOL;
    });
} catch (Throwable $e) {
    while ($e) {
        echo 'EXCECAO='.get_class($e).'|'.$e->getMessage().PHP_EOL;
        $e = $e->getPrevious();
    }
}
