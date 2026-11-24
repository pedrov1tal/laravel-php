# Normalização de booleanos no PostgreSQL

## Intenção

Alinhar o schema existente do Neon às migrations e aos Models Laravel. Nove colunas que deveriam ser booleanas estão armazenadas como `smallint`, provocando `SQLSTATE[22P02]` quando o PostgreSQL recebe valores `true` ou `false`.

## Evidências

- As migrations existentes declaram essas colunas com `$table->boolean(...)`.
- Os Models usam casts booleanos e as consultas enviam booleanos reais.
- O schema do Neon informa `smallint`, nullable e defaults numéricos para todas as nove colunas.
- A inspeção dos dados encontrou somente valores `0` e `1`, sem nulos ou valores fora desse domínio.

## Abordagens consideradas

- Adaptar a aplicação para usar `0/1`: rejeitada porque espalharia uma incompatibilidade do banco por Models, scopes, validações e Controllers.
- Normalizar o schema com uma migration: aprovada porque corrige a origem e preserva o contrato booleano já adotado pelo código.

## Colunas afetadas

- `barbearias.ativa` — padrão `true`.
- `barbearia_horarios.fechado` — padrão `false`.
- `barbeiro_horarios.indisponivel` — padrão `false`.
- `barbeiros.ativo` — padrão `true`.
- `servicos.ativo` — padrão `true`.
- `users.deve_trocar_senha` — padrão `false`.
- `users.is_superadmin` — padrão `false`.
- `barbearia_cliente.bloqueado` — padrão `false`.
- `agendamentos.nao_compareceu` — padrão `false`.

## Implementação

- Criar uma migration específica de reparo do schema PostgreSQL e segura para instalações cujo schema já esteja correto.
- Em `up()`, executar somente quando o driver for `pgsql`.
- Inspecionar o tipo atual de cada coluna: ignorar `boolean`, converter `smallint` e interromper diante de um tipo inesperado.
- Para cada coluna: preencher eventual `NULL` com o padrão, remover o default numérico, converter com `USING (coluna <> 0)`, restaurar o default booleano e aplicar `NOT NULL`.
- Manter `down()` como no-op: depois da execução não é possível distinguir uma coluna nativamente booleana de uma coluna reparada, e reintroduzir `smallint` degradaria instalações corretas.
- Em SQLite, `up()` e `down()` serão no-op, pois o SQLite representa booleanos como inteiros e esse formato não caracteriza a divergência observada.

## Aplicação no Neon

- Executar a migration pelo endpoint direto configurado no Laravel 13.
- Usar `php artisan migrate --path=<migration> --force` para aplicar somente esta correção.
- Não executar a migration pendente `2026_11_23_000001_create_cliente_barbearia_favorita_table.php` neste trabalho.

## Verificação

- Consultar `information_schema.columns` após a migration e confirmar `boolean`, `NOT NULL` e defaults booleanos nas nove colunas.
- Repetir a consulta de barbeiros ativos que originou o erro.
- Não executar a suíte automatizada, lint ou build sem solicitação explícita.

## Restrições

- Não apagar tabelas ou registros.
- Aceitar que esta reparação de schema não possui rollback automático; uma reversão extraordinária exigiria uma migration nova e explícita.
- Não alterar Models, Controllers, rotas ou payloads.
- Preservar as demais mudanças existentes no worktree.
