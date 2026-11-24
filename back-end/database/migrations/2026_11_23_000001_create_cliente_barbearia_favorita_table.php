<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente_barbearia_favorita', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('barbearia_id')->constrained('barbearias')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['cliente_id', 'barbearia_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cliente_barbearia_favorita');
    }
};
