<?php
require __DIR__.'/vendor/autoload.php';
$app=require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::transaction(function () {
        echo 'LOCK='.(App\Models\Barbeiro::whereKey(1)->lockForUpdate()->count()).PHP_EOL;
        echo 'STATUS='.DB::selectOne('select 1 as ok')->ok.PHP_EOL;
    });
} catch (Throwable $e) {
    echo get_class($e).'|'.$e->getMessage().PHP_EOL;
}
