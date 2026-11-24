# Logos por Tema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir as logos oficiais do Corte Rápido em todas as áreas do frontend, usando a versão escura no tema claro e a clara no tema escuro.

**Architecture:** Um componente compartilhado `BrandLogo` renderizará as duas imagens públicas em uma única área proporcional. O CSS selecionará a imagem visível por `:root[data-theme]`, reutilizando o estado de tema existente e permitindo ajustes de tamanho e contraste por contexto sem duplicar lógica React.

**Tech Stack:** React 19, TypeScript, CSS e Vite 8.

**Spec:** `docs/superpowers/specs/2026-11-24-logos-por-tema-design.md`

## Global Constraints

- Não instalar dependências.
- Não alterar backend, banco de dados, rotas ou `ROTAS.md`.
- Não redesenhar, recolorir nem recortar as imagens fornecidas.
- Preservar os destinos e rótulos acessíveis dos links de marca.
- Não executar testes, lint ou build sem solicitação explícita.
- Não criar commit sem solicitação.

## Review Focus

- Tema inicial claro: somente a logo escura deve permanecer visível.
- Tema inicial escuro e troca em tempo de execução: somente a logo clara deve permanecer visível após `data-theme='dark'`.
- Sidebar administrativa em ambos os temas: a logo clara deve permanecer fixa e legível sobre o fundo escuro.
- Cabeçalhos estreitos e mobile administrativo: a proporção 3:1 não deve causar sobreposição com navegação, contexto ou botão de menu.
- Falha de carregamento ou leitura assistiva: cada link deve continuar com `aria-label` significativo e imagens decorativas não devem duplicar o nome.

---

### Task 1: Criar o componente e os assets oficiais

**Files:**
- Create: `front-end/public/images/corte-rapido-logo-escura.png`
- Create: `front-end/public/images/corte-rapido-logo-clara.png`
- Create: `front-end/src/shared/components/BrandLogo.tsx`
- Create: `front-end/src/shared/components/brand-logo.css`

**Interfaces:**
- Consumes: `data-theme='light' | 'dark'` aplicado ao elemento raiz pelo `darkModeStore`.
- Produces: `BrandLogo({ className?: string }): JSX.Element`, com classes base `brand-logo`, `brand-logo__image--escura` e `brand-logo__image--clara`.

- [x] **Step 1: Adicionar os arquivos de imagem sem transformação**

Copiar `C:\Users\henri\Downloads\logo-escura.png` e `C:\Users\henri\Downloads\logo-clara.png` para os caminhos públicos definidos acima, preservando os arquivos binários originais.

- [x] **Step 2: Criar `BrandLogo({ className?: string })`**

Renderizar um `span` decorativo com as duas imagens, `alt=""` e `aria-hidden="true"`. Combinar `brand-logo` com a classe opcional sem adicionar biblioteca.

- [x] **Step 3: Implementar a troca visual por tema**

Em `brand-logo.css`, sobrepor as imagens na mesma célula, usar `width: 100%`, `height: 100%` e `object-fit: contain`, exibir somente `--escura` por padrão e somente `--clara` quando `:root[data-theme='dark']` estiver ativo.

- [x] **Step 4: Revisar o contrato do componente**

Confirmar estaticamente que nenhuma leitura duplicada do store foi criada, ambas as URLs começam em `/images/` e as imagens não produzem anúncio redundante para tecnologia assistiva.

---

### Task 2: Substituir as marcas existentes em todos os contextos

**Files:**
- Modify: `front-end/src/App.tsx`
- Modify: `front-end/src/App.css`
- Modify: `front-end/src/features/home/ClienteHomePage.tsx`
- Modify: `front-end/src/features/autenticacao/ContaPage.tsx`
- Modify: `front-end/src/features/agendamentos/components/AgendamentoHeader.tsx`
- Modify: `front-end/src/features/agendamentos/agendamento.css`
- Modify: `front-end/src/features/admin/AdminSidebar.tsx`
- Modify: `front-end/src/features/admin/admin-sidebar.css`

**Interfaces:**
- Consumes: `BrandLogo({ className?: string }): JSX.Element` da Task 1.
- Produces: uso consistente da marca oficial na home, autenticação, conta, agendamento, rodapé, sidebar e cabeçalho mobile administrativo.

- [x] **Step 1: Atualizar as marcas públicas e autenticadas**

Importar `BrandLogo` em `App.tsx`, `ClienteHomePage.tsx`, `ContaPage.tsx` e `AgendamentoHeader.tsx`. Substituir os lockups textuais e os links vazios por `<BrandLogo />`, mantendo os `href` atuais e normalizando os rótulos antigos de “Nexo Agenda” para “Corte Rápido”.

- [x] **Step 2: Adaptar o dimensionamento global da marca**

Em `App.css`, remover `.brand::before` e o recorte visual dos filhos, manter `.brand` como contêiner do link e dimensionar `.brand-logo` em proporção 3:1 com limites responsivos que caibam nos cabeçalhos e no rodapé.

- [x] **Step 3: Ajustar o cabeçalho de agendamento**

Em `agendamento.css`, manter as larguras específicas de `.booking-brand`, retirar regras obsoletas voltadas ao lockup textual e fazer o `BrandLogo` ocupar o espaço disponível sem distorção.

- [x] **Step 4: Atualizar as marcas administrativas**

Importar `BrandLogo` em `AdminSidebar.tsx` e substituir os conteúdos de `.admin-brand` e `.admin-mobile-brand`. Manter os links para o dashboard e adicionar `aria-label="Abrir dashboard"` ao link desktop.

- [x] **Step 5: Garantir contraste e responsividade no painel**

Em `admin-sidebar.css`, remover estilos do monograma/texto antigos e manter a logo clara fixa sobre o fundo escuro da sidebar nos dois temas, sem base adicional. Definir tamanhos distintos para sidebar desktop e cabeçalho mobile sem alterar a estrutura da navegação.

- [x] **Step 6: Revisar escopo e integridade**

Usar `rg` para confirmar que não restaram lockups de marca antigos em TSX, verificar os dois arquivos PNG por tamanho/hash contra as origens e revisar `git diff --check`. Não executar testes, lint ou build.
