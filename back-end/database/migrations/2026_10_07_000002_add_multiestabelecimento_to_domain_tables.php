<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $barbeariaLegadoId = DB::table('barbearias')->insertGetId([
            'slug' => 'barbearia-legado',
            'nome' => 'Barbearia Legado',
            'descricao' => 'Dados preservados da estrutura anterior à separação por barbearia.',
            'cor_primaria' => '#17231F',
            'cor_destaque' => '#BD704C',
            'fuso_horario' => 'America/Sao_Paulo',
            'antecedencia_cancelamento_minutos' => 120,
            'ativa' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('clientes', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();
            $table->unique('user_id');
        });

        Schema::table('barbeiros', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->foreignId('barbearia_id')
                ->nullable()
                ->after('id')
                ->constrained('barbearias')
                ->restrictOnDelete();
            $table->foreignId('user_id')
                ->nullable()
                ->after('barbearia_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->boolean('ativo')->default(true)->after('email');
            $table->unique(['barbearia_id', 'user_id']);
            $table->unique(['barbearia_id', 'email']);
        });

        Schema::table('servicos', function (Blueprint $table) {
            $table->foreignId('barbearia_id')
                ->nullable()
                ->after('id')
                ->constrained('barbearias')
                ->restrictOnDelete();
            $table->boolean('ativo')->default(true)->after('preco');
        });

        Schema::table('agendamentos', function (Blueprint $table) {
            $table->foreignId('barbearia_id')
                ->nullable()
                ->after('id')
                ->constrained('barbearias')
                ->restrictOnDelete();
            $table->foreignId('cancelado_por_user_id')
                ->nullable()
                ->after('status')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('cancelado_em')->nullable()->after('cancelado_por_user_id');
            $table->text('motivo_cancelamento')->nullable()->after('cancelado_em');
            $table->index(['barbearia_id', 'data_hora']);
        });

        DB::table('barbeiros')->update(['barbearia_id' => $barbeariaLegadoId]);
        DB::table('servicos')->update(['barbearia_id' => $barbeariaLegadoId]);
        DB::table('agendamentos')->update(['barbearia_id' => $barbeariaLegadoId]);

        Schema::table('barbeiros', function (Blueprint $table) {
            $table->foreignId('barbearia_id')->nullable(false)->change();
        });

        Schema::table('servicos', function (Blueprint $table) {
            $table->foreignId('barbearia_id')->nullable(false)->change();
        });

        Schema::table('agendamentos', function (Blueprint $table) {
            $table->foreignId('barbearia_id')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('agendamentos', function (Blueprint $table) {
            $table->dropIndex(['barbearia_id', 'data_hora']);
            $table->dropConstrainedForeignId('cancelado_por_user_id');
            $table->dropConstrainedForeignId('barbearia_id');
            $table->dropColumn(['cancelado_em', 'motivo_cancelamento']);
        });

        Schema::table('servicos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('barbearia_id');
            $table->dropColumn('ativo');
        });

        Schema::table('barbeiros', function (Blueprint $table) {
            $table->dropUnique(['barbearia_id', 'email']);
            $table->dropUnique(['barbearia_id', 'user_id']);
            $table->dropConstrainedForeignId('user_id');
            $table->dropConstrainedForeignId('barbearia_id');
            $table->dropColumn('ativo');
            $table->unique('email');
        });

        Schema::table('clientes', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
