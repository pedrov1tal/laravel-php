<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbearia_administradores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barbearia_id')
                ->constrained('barbearias')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['barbearia_id', 'user_id']);
        });

        Schema::create('barbearia_horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barbearia_id')
                ->constrained('barbearias')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana');
            $table->time('abre_as')->nullable();
            $table->time('fecha_as')->nullable();
            $table->boolean('fechado')->default(false);
            $table->timestamps();

            $table->unique(['barbearia_id', 'dia_semana']);
        });

        Schema::create('barbeiro_horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barbeiro_id')
                ->constrained('barbeiros')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('dia_semana');
            $table->time('inicia_as')->nullable();
            $table->time('termina_as')->nullable();
            $table->boolean('indisponivel')->default(false);
            $table->timestamps();

            $table->unique(['barbeiro_id', 'dia_semana']);
        });

        Schema::create('barbeiro_servico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barbeiro_id')
                ->constrained('barbeiros')
                ->cascadeOnDelete();
            $table->foreignId('servico_id')
                ->constrained('servicos')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['barbeiro_id', 'servico_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barbeiro_servico');
        Schema::dropIfExists('barbeiro_horarios');
        Schema::dropIfExists('barbearia_horarios');
        Schema::dropIfExists('barbearia_administradores');
    }
};
