# Seleção de Barbearia no Agendamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer `/agendar` listar as barbearias ativas e iniciar o fluxo existente após o cliente escolher uma delas.

**Architecture:** A API Laravel ganha um índice público fino, serializado por `BarbeariaResource`. No React, `AgendarPage` decide entre uma nova tela de seleção quando não há `estabelecimento` e o fluxo atual quando há slug, preservando links diretos e autenticação somente na confirmação.

**Tech Stack:** PHP 8.3, Laravel 13, Eloquent, API Resources, React 19, TypeScript, React Router, Vitest e Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-23-selecao-barbearia-agendamento-design.md`

## Global Constraints

- Não instalar bibliotecas novas.
- Manter `/api/v1`, nomes de domínio em português e recursos no plural.
- Não executar testes, lint ou build sem autorização explícita do usuário.
- O frontend usa `VITE_API_URL` e não acessa o banco diretamente.
- Preservar `/agendar?estabelecimento=<slug>` e o login somente na confirmação.

## Review Focus

- Uma barbearia inativa nunca deve aparecer na seleção pública.
- A ordenação deve ser estável por nome, independentemente da ordem de inserção.
- Uma resposta vazia deve produzir um estado vazio, não carregamento infinito.
- Falha de rede/API deve produzir mensagem de erro e permitir nova tentativa.
- Slugs e textos exibidos devem ser escapados/encodados pelo React e `encodeURIComponent`.

---

### Task 1: Índice público de barbearias ativas

**Files:**
- Create: `back-end/app/Http/Controllers/Api/V1/BarbeariaController.php`
- Create: `back-end/app/Http/Resources/Api/V1/BarbeariaResource.php`
- Modify: `back-end/routes/api.php`
- Test: `back-end/tests/Feature/BarbeariaPublicaTest.php`

**Interfaces:**
- Consumes: `App\Models\Barbearia::ativas()`.
- Produces: `GET /api/v1/barbearias`, coleção JSON em `data[]` com `id`, `slug`, `nome`, `descricao`, `endereco` e `telefone`.

- [ ] **Step 1: Escrever o teste de contrato do índice público**

Criar `BarbeariaPublicaTest` cobrindo: somente ativas, ordenação por `nome`, formato dos seis campos e resposta vazia com `data: []`.

- [ ] **Step 2: Executar o teste para confirmar a falha, somente com autorização explícita**

Run: `cd back-end && php artisan test --filter=BarbeariaPublicaTest`
Expected: FAIL porque a rota ainda não existe.

- [ ] **Step 3: Implementar o Resource, Controller e rota**

Criar `BarbeariaResource::toArray(Request $request): array`; criar `BarbeariaController::index(): AnonymousResourceCollection` usando `Barbearia::query()->ativas()->orderBy('nome')->get()`; registrar `Route::get('/barbearias', ...)` antes das rotas com `{barbearia}`.

- [ ] **Step 4: Executar o teste específico, somente com autorização explícita**

Run: `cd back-end && php artisan test --filter=BarbeariaPublicaTest`
Expected: PASS.

### Task 2: Seleção de barbearia em `/agendar`

**Files:**
- Create: `front-end/src/features/agendamentos/components/SelecaoBarbearia.tsx`
- Create: `front-end/src/features/agendamentos/data/barbeariasApi.ts`
- Modify: `front-end/src/features/agendamentos/types/agendamento.ts`
- Modify: `front-end/src/features/agendamentos/pages/AgendarPage.tsx`
- Modify: `front-end/src/features/agendamentos/agendamento.css`
- Modify: `front-end/src/features/agendamentos/pages/AgendarPage.test.tsx`
- Modify: `front-end/src/app/AppRouter.test.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/barbearias` da Task 1.
- Produces: `carregarBarbearias(): Promise<BarbeariaDisponivel[]>` e `SelecaoBarbearia`, que navega para `/agendar?estabelecimento=<slug>`.

- [ ] **Step 1: Escrever os testes da tela de seleção**

Cobrir: `/agendar` mostra barbearias retornadas; clique gera a URL com slug codificado; lista vazia mostra estado vazio; falha mostra erro e ação de tentar novamente; `/agendar?estabelecimento=...` continua carregando o fluxo atual.

- [ ] **Step 2: Executar o teste para confirmar a falha, somente com autorização explícita**

Run: `cd front-end && npm run test -- src/features/agendamentos/pages/AgendarPage.test.tsx src/app/AppRouter.test.tsx`
Expected: FAIL porque `/agendar` ainda tenta carregar contexto sem slug.

- [ ] **Step 3: Implementar contrato e cliente da listagem**

Adicionar `BarbeariaDisponivel` em `types/agendamento.ts`; implementar `carregarBarbearias()` em `data/barbeariasApi.ts`, validando `response.ok` e retornando `corpo.data`.

- [ ] **Step 4: Implementar a seleção sem alterar o fluxo existente**

Fazer `AgendarPage` renderizar `SelecaoBarbearia` quando não houver slug e delegar ao fluxo atual quando houver; o componente gerencia carregamento, erro, vazio e repetição da requisição. Usar links React/âncoras com `encodeURIComponent(slug)`.

- [ ] **Step 5: Estilizar a seleção responsivamente**

Adicionar classes específicas em `agendamento.css`, reutilizando tokens e padrões visuais existentes, com foco visível e cartões legíveis em tela estreita.

- [ ] **Step 6: Executar os testes específicos, somente com autorização explícita**

Run: `cd front-end && npm run test -- src/features/agendamentos/pages/AgendarPage.test.tsx src/app/AppRouter.test.tsx`
Expected: PASS.

### Task 3: Documentar o fluxo de navegação

**Files:**
- Modify: `ROTAS.md`

**Interfaces:**
- Consumes: comportamento entregue nas Tasks 1 e 2.
- Produces: documentação de `/agendar` coerente com seleção pública e confirmação autenticada.

- [ ] **Step 1: Atualizar a descrição de `/agendar`**

Registrar que a rota lista barbearias ativas sem `estabelecimento`, aceita link direto por query string e exige login somente ao confirmar.

- [ ] **Step 2: Revisar estaticamente o contrato cruzado**

Conferir nomes dos campos no Resource, tipo TypeScript, cliente HTTP e componente sem executar testes/build.


