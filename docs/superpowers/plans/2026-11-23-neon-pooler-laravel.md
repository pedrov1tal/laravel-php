# Neon Pooler no Laravel 13 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurar corretamente o pooler transacional do Neon e a conexão direta de schema no Laravel 13, eliminando a configuração que produz transações PostgreSQL abortadas.

**Architecture:** A conexão `pgsql` será declarada como pooled e receberá um bloco `direct`, usando o suporte nativo do Laravel 13. A aplicação continuará no endpoint pooled; migrations e ferramentas de schema serão automaticamente resolvidas para o endpoint direto.

**Tech Stack:** PHP 8.3+, Laravel 13.25, PostgreSQL, Neon PgBouncer, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-11-23-neon-pooler-laravel-design.md`

## Global Constraints

- Não instalar bibliotecas.
- Não executar testes, lint ou build sem solicitação explícita.
- Não executar migrations nem alterar dados do banco.
- Não incluir credenciais ou valores sensíveis em arquivos versionados.
- Preservar as mudanças existentes do usuário e não criar commit sem solicitação.

## Review Focus

- `DB_POOLED=false` ou ausente deve preservar o uso normal de PostgreSQL sem ativar comportamento de pooler.
- `DB_DIRECT_HOST` ausente deve deixar o bloco `direct` vazio, sem apontar silenciosamente para o host pooled.
- A conexão pooled deve usar `PDO::ATTR_EMULATE_PREPARES=true` por meio do suporte nativo do framework.
- A conexão direct deve herdar banco e credenciais principais quando não houver sobrescritas específicas.
- As variáveis documentadas não devem conter credenciais reais.

---

### Task 1: Configurar conexões pooled e direct do PostgreSQL

**Files:**
- Modify: `back-end/config/database.php:85-114`
- Modify: `back-end/.env.example:24-33`
- Modify: `back-end/.env.production.example:10-15`
- Modify: `README.md:162-168`
- Modify (não versionado): `back-end/.env`

**Interfaces:**
- Consumes: variáveis `DB_*` já utilizadas pelo Laravel e o endpoint pooled atual do Neon.
- Produces: `database.connections.pgsql.pooled` booleano e `database.connections.pgsql.direct` com os campos compatíveis com Laravel 13.

- [x] **Step 1: Atualizar a conexão `pgsql`**

Adicionar `pooled => env('DB_POOLED', false)` e um bloco `direct` filtrado com `DB_DIRECT_HOST`, `DB_DIRECT_PORT`, `DB_DIRECT_USERNAME`, `DB_DIRECT_PASSWORD` e `DB_DIRECT_SSLMODE`, condicionado a `DB_POOLED=true` e host direto preenchido. Remover a conexão redundante `pgsql_unpooled`.

- [x] **Step 2: Documentar as variáveis de ambiente**

Adicionar ao `.env.example` e `.env.production.example` exemplos sem segredos para `DB_POOLED` e `DB_DIRECT_*`, explicando que o host direct do Neon não contém o sufixo `-pooler`. Atualizar o README para usar a seleção automática da conexão direct do Laravel 13 nas migrations.

- [x] **Step 3: Ajustar somente os parâmetros necessários no `.env` local**

Definir `DB_POOLED=true` e `DB_DIRECT_HOST` com o endpoint direto correspondente ao host pooled atual. Não copiar ou modificar senha, usuário ou banco.

- [x] **Step 4: Verificar estaticamente a configuração resolvida no container**

Executar um comando PHP somente leitura no serviço `api` que carregue a aplicação e confirme: `pooled=true`, bloco `direct` presente, host principal classificado como pooled, host direct classificado como não pooled e `PDO::ATTR_EMULATE_PREPARES=true` na configuração efetiva da conexão principal. Não imprimir hosts completos nem credenciais.

- [x] **Step 5: Revisar o diff**

Confirmar que apenas `config/database.php`, `.env.example`, os dois documentos de planejamento e o `.env` ignorado foram alterados por esta tarefa; não executar testes nem migration.
