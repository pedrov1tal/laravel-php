# Normalização de Booleanos no PostgreSQL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Converter as nove colunas booleanas armazenadas incorretamente como `smallint` no Neon para booleanos PostgreSQL reais, preservando os dados existentes.

**Architecture:** Uma migration de reparo, ativa somente no driver `pgsql`, executará conversões explícitas e reversíveis por coluna. Ela será aplicada isoladamente pelo endpoint direct do Laravel 13 para não executar outras migrations pendentes.

**Tech Stack:** PHP 8.3+, Laravel 13.25, PostgreSQL/Neon, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-11-24-normalizacao-booleanos-postgresql-design.md`

## Global Constraints

- Não instalar bibliotecas.
- Não executar testes automatizados, lint ou build sem solicitação explícita.
- Não executar outras migrations pendentes.
- Não apagar tabelas ou registros.
- Não alterar Models, Controllers, rotas ou payloads.
- Preservar as mudanças existentes e não criar commit sem solicitação.

## Review Focus

- Valores `0` devem se tornar `false` e valores `1` devem se tornar `true`.
- Eventuais valores `NULL` devem receber o default correto antes de aplicar `NOT NULL`.
- Defaults PostgreSQL devem ser booleanos, não casts numéricos residuais.
- A migration deve ser no-op em SQLite e não quebrar o banco local padrão.
- Schemas PostgreSQL que já possuem booleanos devem permanecer inalterados.
- A aplicação por `--path` não pode executar a migration pendente de favoritos.

---

### Task 1: Criar e aplicar a migration de normalização

**Files:**
- Create: `back-end/database/migrations/2026_11_24_000001_normalize_boolean_columns_on_postgresql.php`

**Interfaces:**
- Consumes: nove colunas PostgreSQL `smallint` com valores restritos a `0/1` e a conexão direct configurada no Laravel.
- Produces: colunas legadas como `boolean NOT NULL`, com seus defaults originais; colunas já booleanas permanecem inalteradas e `down()` é no-op por segurança.

- [x] **Step 1: Confirmar a pré-condição no Neon**

Consultar `information_schema.columns` e a distribuição de valores das nove colunas. Esperado: tipo `smallint`, somente `0/1`, sem nulos ou valores fora do domínio.

- [x] **Step 2: Criar a migration PostgreSQL específica**

Criar a migration com um mapa fixo `tabela => [coluna => defaultBooleano]`. `up()` deve retornar imediatamente fora de `pgsql`; ignorar colunas já booleanas, rejeitar tipos inesperados e, para cada `smallint`, preencher nulos, remover o default, converter com `USING (coluna <> 0)`, aplicar default booleano e `NOT NULL`. `down()` deve ser no-op para não degradar schemas que já nasceram corretos.

- [x] **Step 3: Revisar estaticamente o SQL gerado**

Confirmar identificadores fixos e entre aspas, literals booleanos sem bindings em DDL, ausência de SQL derivado de entrada externa, guarda de tipo e justificativa do `down()` no-op.

- [x] **Step 4: Aplicar somente a migration corretiva**

Executar dentro de `back-end/`:

`php artisan migrate --path=database/migrations/2026_11_24_000001_normalize_boolean_columns_on_postgresql.php --force`

Esperado: exatamente essa migration marcada como `DONE`; a migration `2026_11_23_000001_create_cliente_barbearia_favorita_table` permanece `Pending`.

- [x] **Step 5: Verificar o schema resultante**

Consultar as nove colunas em `information_schema.columns`. Esperado: `data_type=boolean`, `is_nullable=NO` e defaults `true`/`false` correspondentes.

- [x] **Step 6: Reproduzir a consulta originalmente quebrada**

Executar uma consulta somente leitura equivalente a `Barbeiro::query()->where('barbearia_id', 2)->where('ativo', true)->get()`. Esperado: execução sem `SQLSTATE[22P02]`.

- [x] **Step 7: Confirmar isolamento da migration e revisar o diff**

Consultar `migrate:status` pela conexão direct e confirmar que a migration de favoritos permanece pendente. Revisar o diff para garantir que a tarefa criou somente a migration e os documentos de design/plano, além das mudanças já existentes no worktree.
