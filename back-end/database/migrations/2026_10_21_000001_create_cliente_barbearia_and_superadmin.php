<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbearia_cliente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barbearia_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['barbearia_id', 'cliente_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_superadmin')->default(false)->after('deve_trocar_senha');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('is_superadmin'));
        Schema::dropIfExists('barbearia_cliente');
    }
};
