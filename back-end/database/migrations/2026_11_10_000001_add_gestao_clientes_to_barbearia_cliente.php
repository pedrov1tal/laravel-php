<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbearia_cliente', function (Blueprint $table) {
            $table->text('observacoes_internas')->nullable();
            $table->boolean('bloqueado')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('barbearia_cliente', function (Blueprint $table) {
            $table->dropColumn(['observacoes_internas', 'bloqueado']);
        });
    }
};
