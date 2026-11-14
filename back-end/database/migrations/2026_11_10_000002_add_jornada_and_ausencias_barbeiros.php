<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbeiro_horarios', function (Blueprint $table) {
            $table->time('pausa_inicio')->nullable();
            $table->time('pausa_fim')->nullable();
        });

        Schema::create('barbeiro_ausencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barbeiro_id')->constrained()->cascadeOnDelete();
            $table->dateTime('inicio_em');
            $table->dateTime('fim_em');
            $table->string('motivo')->nullable();
            $table->timestamps();
            $table->index(['barbeiro_id', 'inicio_em', 'fim_em']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barbeiro_ausencias');
        Schema::table('barbeiro_horarios', function (Blueprint $table) {
            $table->dropColumn(['pausa_inicio', 'pausa_fim']);
        });
    }
};
