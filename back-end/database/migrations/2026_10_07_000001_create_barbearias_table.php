<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbearias', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('telefone')->nullable();
            $table->string('email')->nullable();
            $table->string('endereco')->nullable();
            $table->string('cor_primaria', 7)->default('#17231F');
            $table->string('cor_destaque', 7)->default('#BD704C');
            $table->string('fuso_horario')->default('America/Sao_Paulo');
            $table->unsignedInteger('antecedencia_cancelamento_minutos')->default(120);
            $table->boolean('ativa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barbearias');
    }
};
