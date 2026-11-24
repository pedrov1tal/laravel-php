<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var array<string, array<string, bool>> */
    private const COLUNAS = [
        'barbearias' => ['ativa' => true],
        'barbearia_horarios' => ['fechado' => false],
        'barbeiro_horarios' => ['indisponivel' => false],
        'barbeiros' => ['ativo' => true],
        'servicos' => ['ativo' => true],
        'users' => [
            'deve_trocar_senha' => false,
            'is_superadmin' => false,
        ],
        'barbearia_cliente' => ['bloqueado' => false],
        'agendamentos' => ['nao_compareceu' => false],
    ];

    public function up(): void
    {
        $conexao = DB::connection();

        if ($conexao->getDriverName() !== 'pgsql') {
            return;
        }

        foreach (self::COLUNAS as $tabela => $colunas) {
            foreach ($colunas as $coluna => $padrao) {
                $tipoAtual = $conexao->table('information_schema.columns')
                    ->whereRaw('table_schema = current_schema()')
                    ->where('table_name', $tabela)
                    ->where('column_name', $coluna)
                    ->value('data_type');

                if ($tipoAtual === 'boolean') {
                    continue;
                }

                if ($tipoAtual !== 'smallint') {
                    throw new RuntimeException(
                        "Tipo inesperado em {$tabela}.{$coluna}: ".($tipoAtual ?? 'coluna inexistente')
                    );
                }

                $tabelaSql = $this->identificador($tabela);
                $colunaSql = $this->identificador($coluna);
                $padraoNumerico = $padrao ? '1' : '0';
                $padraoBooleano = $padrao ? 'true' : 'false';

                $conexao->statement(
                    "UPDATE {$tabelaSql} SET {$colunaSql} = {$padraoNumerico} WHERE {$colunaSql} IS NULL"
                );
                $conexao->statement(
                    "ALTER TABLE {$tabelaSql} ALTER COLUMN {$colunaSql} DROP DEFAULT"
                );
                $conexao->statement(
                    "ALTER TABLE {$tabelaSql} ALTER COLUMN {$colunaSql} TYPE boolean USING ({$colunaSql} <> 0)"
                );
                $conexao->statement(
                    "ALTER TABLE {$tabelaSql} ALTER COLUMN {$colunaSql} SET DEFAULT {$padraoBooleano}"
                );
                $conexao->statement(
                    "ALTER TABLE {$tabelaSql} ALTER COLUMN {$colunaSql} SET NOT NULL"
                );
            }
        }
    }

    public function down(): void
    {
        // Reintroduzir smallint degradaria schemas PostgreSQL que já nasceram corretos.
    }

    private function identificador(string $valor): string
    {
        return '"'.str_replace('"', '""', $valor).'"';
    }
};
