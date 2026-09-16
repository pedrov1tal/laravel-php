# Fluxo Público de Agendamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar em `/agendar` um fluxo público, responsivo e inteiramente funcional com dados simulados para serviço, profissional, data, horário, cliente, revisão e confirmação.

**Architecture:** A Home permanece em `App.tsx`; `AppRouter.tsx` adiciona navegação declarativa com React Router. Toda a nova lógica fica em `src/features/agendamentos`, separando contratos, fonte de dados simulada, reducer do rascunho, componentes de etapa e composição da página para permitir que uma API futura substitua apenas a camada de dados.

**Tech Stack:** React 19, TypeScript 6, Vite 8, React Router DOM, CSS próprio, Vitest, Testing Library e jsdom.

**Spec:** `docs/superpowers/specs/2026-09-16-fluxo-agendamento-design.md`

## Global Constraints

- A rota pública do fluxo é `/agendar`; `/agendamentos` continua reservado à listagem prevista em `ROTAS.md`.
- A query `?estabelecimento=<slug>` seleciona o estabelecimento; sem query, a fonte usa o estabelecimento demonstrativo padrão.
- Esta entrega não altera Laravel, migrations ou banco de dados.
- Os nomes de domínio permanecem em português e os recursos permanecem no plural.
- Não adicionar dependências além de `react-router-dom` e das dependências de teste aprovadas.
- Nome e telefone do cliente são obrigatórios; e-mail é opcional.
- Não oferecer “Qualquer profissional”.
- Não criar hardcodes de Norte Barbearia dentro da feature.
- Não usar emojis como ícones.
- Reutilizar `--ink`, `--paper`, `--copper`, `--muted`, `--line` e `--green`.
- Manter suporte a desktop, tablet e celular sem overflow horizontal a partir de 320 px.
- Preservar o arquivo não rastreado `design-qa.md`; ele não pertence aos commits deste plano.

---

## Mapa de arquivos

**Criar**

- `front-end/src/test/setup.ts`: extensões de asserção do Testing Library.
- `front-end/src/lib/formatters.ts`: formatação de preço, duração e data em português.
- `front-end/src/lib/formatters.test.ts`: testes puros dos formatadores.
- `front-end/src/app/AppRouter.tsx`: rotas `/`, `/agendar` e fallback.
- `front-end/src/app/AppRouter.test.tsx`: teste das rotas públicas.
- `front-end/src/features/agendamentos/types/agendamento.ts`: contratos da feature.
- `front-end/src/features/agendamentos/data/agendamentosMock.ts`: estabelecimentos e adaptador assíncrono simulado.
- `front-end/src/features/agendamentos/data/agendamentosMock.test.ts`: resolução por slug, padrão, erro e filtros.
- `front-end/src/features/agendamentos/state/agendamentoReducer.ts`: transições e invalidações do rascunho.
- `front-end/src/features/agendamentos/state/agendamentoReducer.test.ts`: testes das dependências entre escolhas.
- `front-end/src/features/agendamentos/components/AgendamentoHeader.tsx`: cabeçalho contextual do estabelecimento.
- `front-end/src/features/agendamentos/components/IndicadorProgresso.tsx`: progresso desktop e mobile.
- `front-end/src/features/agendamentos/components/EstadoFeedback.tsx`: carregamento, erro e vazio.
- `front-end/src/features/agendamentos/components/SelecaoServico.tsx`: cartões semânticos de serviço.
- `front-end/src/features/agendamentos/components/SelecaoProfissional.tsx`: profissionais filtrados.
- `front-end/src/features/agendamentos/components/SelecaoDataHorario.tsx`: datas horizontais e grade de horários.
- `front-end/src/features/agendamentos/components/DadosClienteForm.tsx`: campos e validação local.
- `front-end/src/features/agendamentos/components/RevisaoAgendamento.tsx`: resumo e ações de edição.
- `front-end/src/features/agendamentos/components/ConfirmacaoAgendamento.tsx`: sucesso simulado.
- `front-end/src/features/agendamentos/components/etapas.test.tsx`: testes das etapas isoladas.
- `front-end/src/features/agendamentos/pages/AgendarPage.tsx`: orquestra carregamento, reducer e etapas.
- `front-end/src/features/agendamentos/pages/AgendarPage.test.tsx`: fluxo integrado e estados principais.
- `front-end/src/features/agendamentos/agendamento.css`: aparência editorial e responsiva.
- `front-end/src/features/agendamentos/index.ts`: exportação pública da feature.

**Modificar**

- `front-end/package.json`: dependências e script `test`.
- `front-end/package-lock.json`: lockfile gerado pelo npm.
- `front-end/vite.config.ts`: ambiente de testes jsdom.
- `front-end/tsconfig.app.json`: tipos de Vitest.
- `front-end/src/main.tsx`: `BrowserRouter` e `AppRouter`.
- `front-end/src/App.tsx`: preservar a Home e manter CTAs em `/agendar`.
- `ROTAS.md`: registrar `/agendar` como fluxo público.

---

### Task 1: Configurar testes e formatadores compartilhados

**Files:**
- Modify: `front-end/package.json`
- Modify: `front-end/package-lock.json`
- Modify: `front-end/vite.config.ts`
- Modify: `front-end/tsconfig.app.json`
- Create: `front-end/src/test/setup.ts`
- Create: `front-end/src/lib/formatters.ts`
- Test: `front-end/src/lib/formatters.test.ts`

**Interfaces:**
- Produces: `formatarPreco(precoCentavos: number): string`, `formatarDuracao(minutos: number): string`, `formatarDataLonga(dataIso: string): string`.
- Consumes: nenhum arquivo da feature.

- [ ] **Step 1: Instalar apenas as dependências aprovadas**

Run from `front-end/`:

```powershell
npm install react-router-dom
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Expected: `package.json` inclui React Router em `dependencies` e as cinco bibliotecas de teste em `devDependencies`.

- [ ] **Step 2: Adicionar o script e a configuração de teste**

Em `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "test": "vitest run",
  "preview": "vite preview"
}
```

Em `vite.config.ts`, adicionar dentro de `defineConfig`:

```ts
import { defineConfig } from 'vitest/config'

test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
  globals: true,
},
```

Em `tsconfig.app.json`, usar:

```json
"types": ["vite/client", "vitest/globals"]
```

Em `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Escrever testes que falham para os formatadores**

```ts
import { describe, expect, it } from 'vitest'
import { formatarDataLonga, formatarDuracao, formatarPreco } from './formatters'

describe('formatters', () => {
  it('formata preço em reais', () => {
    expect(formatarPreco(6500)).toBe('R$ 65,00')
  })

  it.each([[30, '30 min'], [60, '1h'], [90, '1h 30 min']])(
    'formata %i minutos como %s',
    (minutos, esperado) => expect(formatarDuracao(minutos)).toBe(esperado),
  )

  it('formata uma data ISO sem deslocamento de fuso', () => {
    expect(formatarDataLonga('2026-09-18')).toBe('18 de setembro')
  })
})
```

- [ ] **Step 4: Rodar os testes e confirmar a falha**

Run:

```powershell
npm run test -- src/lib/formatters.test.ts
```

Expected: FAIL porque `formatters.ts` ainda não existe.

- [ ] **Step 5: Implementar os formatadores mínimos**

```ts
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarPreco(precoCentavos: number) {
  return moeda.format(precoCentavos / 100)
}

export function formatarDuracao(minutos: number) {
  const horas = Math.floor(minutos / 60)
  const restante = minutos % 60
  if (!horas) return `${restante} min`
  return restante ? `${horas}h ${restante} min` : `${horas}h`
}

export function formatarDataLonga(dataIso: string) {
  const [ano, mes, dia] = dataIso.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
    .format(new Date(ano, mes - 1, dia))
}
```

Substituir o import existente de `defineConfig` vindo de `vite`; manter o import e o plugin React atuais. O import de `vitest/config` faz o TypeScript reconhecer a propriedade `test` sem coerção.

- [ ] **Step 6: Rodar o teste até passar**

Run: `npm run test -- src/lib/formatters.test.ts`

Expected: PASS com três casos de comportamento.

- [ ] **Step 7: Commit**

```powershell
git add front-end/package.json front-end/package-lock.json front-end/vite.config.ts front-end/tsconfig.app.json front-end/src/test/setup.ts front-end/src/lib/formatters.ts front-end/src/lib/formatters.test.ts
git commit -m "test(frontend): configurar vitest e formatadores"
```

---

### Task 2: Definir contratos e fonte de dados simulada

**Files:**
- Create: `front-end/src/features/agendamentos/types/agendamento.ts`
- Create: `front-end/src/features/agendamentos/data/agendamentosMock.ts`
- Test: `front-end/src/features/agendamentos/data/agendamentosMock.test.ts`

**Interfaces:**
- Produces: `carregarContextoAgendamento(slug?: string): Promise<ContextoAgendamento>`, `profissionaisParaServico(contexto, servicoId)`, `agendaParaProfissional(contexto, profissionalId)`.
- Produces types: `Estabelecimento`, `ServicoAgendamento`, `Profissional`, `DataDisponivel`, `HorarioDisponivel`, `DadosCliente`, `ContextoAgendamento`, `RascunhoAgendamento`.
- Consumes: nenhum componente React.

- [ ] **Step 1: Escrever os contratos TypeScript**

```ts
export type EtapaAgendamento = 'servico' | 'profissional' | 'data-horario' | 'cliente' | 'revisao' | 'confirmacao'

export interface Estabelecimento {
  id: string
  slug: string
  nome: string
  iniciais: string
  endereco: string
  telefone: string
}

export interface ServicoAgendamento {
  id: string
  nome: string
  descricao: string
  duracaoMinutos: number
  precoCentavos: number
}

export interface Profissional {
  id: string
  nome: string
  especialidade: string
  iniciais: string
  servicoIds: string[]
}

export interface HorarioDisponivel { horario: string; disponivel: boolean }
export interface DataDisponivel { data: string; disponivel: boolean; horarios: HorarioDisponivel[] }

export interface DadosCliente { nome: string; telefone: string; email: string }

export interface ContextoAgendamento {
  estabelecimento: Estabelecimento
  servicos: ServicoAgendamento[]
  profissionais: Profissional[]
  agendaPorProfissional: Record<string, DataDisponivel[]>
}

export interface RascunhoAgendamento {
  servicoId: string | null
  profissionalId: string | null
  data: string | null
  horario: string | null
  cliente: DadosCliente
}
```

- [ ] **Step 2: Escrever testes que falham para o adaptador**

```ts
import { describe, expect, it } from 'vitest'
import { agendaParaProfissional, carregarContextoAgendamento, profissionaisParaServico } from './agendamentosMock'

describe('agendamentosMock', () => {
  it('carrega o estabelecimento padrão sem slug', async () => {
    const contexto = await carregarContextoAgendamento()
    expect(contexto.estabelecimento.slug).toBe('estudio-central')
  })

  it('carrega outro estabelecimento pelo slug', async () => {
    const contexto = await carregarContextoAgendamento('barbearia-horizonte')
    expect(contexto.estabelecimento.nome).toBe('Barbearia Horizonte')
  })

  it('rejeita slug desconhecido', async () => {
    await expect(carregarContextoAgendamento('inexistente')).rejects.toThrow('Estabelecimento não encontrado')
  })

  it('filtra profissionais pelo serviço', async () => {
    const contexto = await carregarContextoAgendamento()
    expect(profissionaisParaServico(contexto, 'servico-corte').every((item) => item.servicoIds.includes('servico-corte'))).toBe(true)
  })

  it('retorna a agenda do profissional selecionado', async () => {
    const contexto = await carregarContextoAgendamento()
    expect(agendaParaProfissional(contexto, 'profissional-alex')).not.toHaveLength(0)
  })

  it('gera datas futuras para a agenda demonstrativa', async () => {
    const contexto = await carregarContextoAgendamento()
    const [primeiroDia] = agendaParaProfissional(contexto, 'profissional-alex')
    const hoje = new Date()
    const hojeIso = [hoje.getFullYear(), String(hoje.getMonth() + 1).padStart(2, '0'), String(hoje.getDate()).padStart(2, '0')].join('-')
    expect(primeiroDia.data > hojeIso).toBe(true)
  })
})
```

- [ ] **Step 3: Rodar o teste e confirmar a falha**

Run: `npm run test -- src/features/agendamentos/data/agendamentosMock.test.ts`

Expected: FAIL porque o adaptador ainda não existe.

- [ ] **Step 4: Implementar dois estabelecimentos e o adaptador**

Criar dados com estes requisitos exatos:

```ts
function criarContextos(): ContextoAgendamento[] {
  return [
  {
    estabelecimento: {
      id: 'estabelecimento-central',
      slug: 'estudio-central',
      nome: 'Estúdio Central',
      iniciais: 'EC',
      endereco: 'Rua das Flores, 120',
      telefone: '(11) 3333-1200',
    },
    servicos: [
      { id: 'servico-corte', nome: 'Corte masculino', descricao: 'Corte personalizado com acabamento.', duracaoMinutos: 45, precoCentavos: 4500 },
      { id: 'servico-barba', nome: 'Barba', descricao: 'Modelagem, toalha quente e acabamento.', duracaoMinutos: 30, precoCentavos: 3000 },
      { id: 'servico-completo', nome: 'Corte + barba', descricao: 'Experiência completa em uma única sessão.', duracaoMinutos: 60, precoCentavos: 6500 },
    ],
    profissionais: [
      { id: 'profissional-alex', nome: 'Alex Martins', especialidade: 'Cortes e acabamento', iniciais: 'AM', servicoIds: ['servico-corte', 'servico-completo'] },
      { id: 'profissional-bruno', nome: 'Bruno Lima', especialidade: 'Barba e visagismo', iniciais: 'BL', servicoIds: ['servico-barba', 'servico-completo'] },
    ],
    agendaPorProfissional: {
      'profissional-alex': criarAgenda('09:00', '10:30', '14:00'),
      'profissional-bruno': criarAgenda('09:30', '11:00', '15:30'),
    },
  },
  criarContextoHorizonte(),
  ]
}
```

Implementar `criarAgenda(...horarios)` gerando os próximos sete dias a partir da data local atual. Para cada dia, criar a data no horário local ao meio-dia com `new Date(ano, mes, dia + deslocamento, 12)` e montar o ISO com `getFullYear()`, `getMonth() + 1` e `getDate()`, sem `toISOString()`, evitando deslocamentos de fuso e transições de horário de verão. Manter ao menos um dia indisponível e um horário indisponível por profissional. O segundo estabelecimento deve ter ids próprios e pelo menos um serviço e um profissional para provar isolamento dos dados.

```ts
export async function carregarContextoAgendamento(slug?: string) {
  await Promise.resolve()
  const contextos = criarContextos()
  const contexto = slug ? contextos.find((item) => item.estabelecimento.slug === slug) : contextos[0]
  if (!contexto) throw new Error('Estabelecimento não encontrado')
  return contexto
}

export function profissionaisParaServico(contexto: ContextoAgendamento, servicoId: string) {
  return contexto.profissionais.filter((item) => item.servicoIds.includes(servicoId))
}

export function agendaParaProfissional(contexto: ContextoAgendamento, profissionalId: string) {
  return contexto.agendaPorProfissional[profissionalId] ?? []
}
```

- [ ] **Step 5: Rodar o teste até passar**

Run: `npm run test -- src/features/agendamentos/data/agendamentosMock.test.ts`

Expected: PASS com seis casos, inclusive datas futuras independentemente do dia em que a aplicação for executada.

- [ ] **Step 6: Commit**

```powershell
git add front-end/src/features/agendamentos/types/agendamento.ts front-end/src/features/agendamentos/data/agendamentosMock.ts front-end/src/features/agendamentos/data/agendamentosMock.test.ts
git commit -m "feat(agendamentos): adicionar contratos e dados simulados"
```

---

### Task 3: Implementar o estado do fluxo e suas invalidações

**Files:**
- Create: `front-end/src/features/agendamentos/state/agendamentoReducer.ts`
- Test: `front-end/src/features/agendamentos/state/agendamentoReducer.test.ts`

**Interfaces:**
- Consumes: `EtapaAgendamento`, `DadosCliente`, `RascunhoAgendamento`.
- Produces: `EstadoAgendamento`, `AcaoAgendamento`, `criarEstadoInicial()`, `agendamentoReducer(estado, acao)`, `validarDadosCliente(cliente)`.

- [ ] **Step 1: Escrever os testes de transição que falham**

```ts
import { describe, expect, it } from 'vitest'
import { agendamentoReducer, criarEstadoInicial, validarDadosCliente } from './agendamentoReducer'

describe('agendamentoReducer', () => {
  it('trocar serviço limpa profissional, data e horário', () => {
    const preenchido = {
      ...criarEstadoInicial(),
      rascunho: { servicoId: 'antigo', profissionalId: 'p1', data: '2026-09-18', horario: '10:00', cliente: { nome: '', telefone: '', email: '' } },
    }
    const resultado = agendamentoReducer(preenchido, { type: 'selecionar-servico', servicoId: 'novo' })
    expect(resultado.rascunho).toMatchObject({ servicoId: 'novo', profissionalId: null, data: null, horario: null })
  })

  it('trocar profissional limpa data e horário', () => {
    const estado = agendamentoReducer(criarEstadoInicial(), { type: 'selecionar-profissional', profissionalId: 'p2' })
    expect(estado.rascunho).toMatchObject({ profissionalId: 'p2', data: null, horario: null })
  })

  it('trocar data limpa somente horário', () => {
    const inicial = { ...criarEstadoInicial(), rascunho: { ...criarEstadoInicial().rascunho, horario: '09:00' } }
    const estado = agendamentoReducer(inicial, { type: 'selecionar-data', data: '2026-09-19' })
    expect(estado.rascunho.data).toBe('2026-09-19')
    expect(estado.rascunho.horario).toBeNull()
  })

  it('mantém escolhas ao apenas voltar de etapa', () => {
    const inicial = { ...criarEstadoInicial(), etapa: 'revisao' as const, rascunho: { ...criarEstadoInicial().rascunho, servicoId: 's1' } }
    const estado = agendamentoReducer(inicial, { type: 'ir-para-etapa', etapa: 'servico' })
    expect(estado.rascunho.servicoId).toBe('s1')
  })
})

describe('validarDadosCliente', () => {
  it('exige nome e telefone e aceita e-mail vazio', () => {
    expect(validarDadosCliente({ nome: '', telefone: '', email: '' })).toEqual({ nome: 'Informe seu nome.', telefone: 'Informe seu telefone.' })
    expect(validarDadosCliente({ nome: 'Ana Souza', telefone: '(11) 99999-0000', email: '' })).toEqual({})
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `npm run test -- src/features/agendamentos/state/agendamentoReducer.test.ts`

Expected: FAIL porque o reducer ainda não existe.

- [ ] **Step 3: Implementar reducer e validação**

```ts
export interface EstadoAgendamento {
  etapa: EtapaAgendamento
  rascunho: RascunhoAgendamento
}

export type AcaoAgendamento =
  | { type: 'selecionar-servico'; servicoId: string }
  | { type: 'selecionar-profissional'; profissionalId: string }
  | { type: 'selecionar-data'; data: string }
  | { type: 'selecionar-horario'; horario: string }
  | { type: 'atualizar-cliente'; cliente: DadosCliente }
  | { type: 'ir-para-etapa'; etapa: EtapaAgendamento }
  | { type: 'confirmar' }

export function criarEstadoInicial(): EstadoAgendamento {
  return {
    etapa: 'servico',
    rascunho: {
      servicoId: null,
      profissionalId: null,
      data: null,
      horario: null,
      cliente: { nome: '', telefone: '', email: '' },
    },
  }
}
```

Implementar cada ação conforme as regras globais, retornando novos objetos sem mutar o estado recebido. `confirmar` muda somente a etapa para `confirmacao`.

```ts
export function validarDadosCliente(cliente: DadosCliente) {
  const erros: Partial<Record<keyof DadosCliente, string>> = {}
  if (!cliente.nome.trim()) erros.nome = 'Informe seu nome.'
  if (!cliente.telefone.trim()) erros.telefone = 'Informe seu telefone.'
  if (cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) erros.email = 'Informe um e-mail válido.'
  return erros
}
```

- [ ] **Step 4: Rodar os testes até passar**

Run: `npm run test -- src/features/agendamentos/state/agendamentoReducer.test.ts`

Expected: PASS com as invalidações e validações cobertas.

- [ ] **Step 5: Commit**

```powershell
git add front-end/src/features/agendamentos/state/agendamentoReducer.ts front-end/src/features/agendamentos/state/agendamentoReducer.test.ts
git commit -m "feat(agendamentos): controlar estado progressivo do fluxo"
```

---

### Task 4: Criar seleção de serviço, profissional, data e horário

**Files:**
- Create: `front-end/src/features/agendamentos/components/EstadoFeedback.tsx`
- Create: `front-end/src/features/agendamentos/components/SelecaoServico.tsx`
- Create: `front-end/src/features/agendamentos/components/SelecaoProfissional.tsx`
- Create: `front-end/src/features/agendamentos/components/SelecaoDataHorario.tsx`
- Test: `front-end/src/features/agendamentos/components/etapas.test.tsx`

**Interfaces:**
- Consumes: tipos da Task 2 e formatadores da Task 1.
- Produces: componentes controlados por `selecionado` e callbacks `onSelecionar`.

- [ ] **Step 1: Escrever testes das seleções e estados vazios**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelecaoDataHorario } from './SelecaoDataHorario'
import { SelecaoProfissional } from './SelecaoProfissional'
import { SelecaoServico } from './SelecaoServico'

it('seleciona um serviço por um botão acessível', async () => {
  const onSelecionar = vi.fn()
  render(<SelecaoServico servicos={[{ id: 's1', nome: 'Corte', descricao: 'Acabamento', duracaoMinutos: 45, precoCentavos: 4500 }]} selecionado={null} onSelecionar={onSelecionar} />)
  await userEvent.click(screen.getByRole('button', { name: /Corte/ }))
  expect(onSelecionar).toHaveBeenCalledWith('s1')
})

it('informa quando nenhum profissional atende ao serviço', () => {
  render(<SelecaoProfissional profissionais={[]} selecionado={null} onSelecionar={vi.fn()} />)
  expect(screen.getByText('Nenhum profissional disponível para este serviço.')).toBeInTheDocument()
})

it('não permite selecionar horário indisponível', async () => {
  const onHorario = vi.fn()
  render(<SelecaoDataHorario datas={[{ data: '2026-09-18', disponivel: true, horarios: [{ horario: '09:00', disponivel: false }] }]} dataSelecionada="2026-09-18" horarioSelecionado={null} onSelecionarData={vi.fn()} onSelecionarHorario={onHorario} />)
  expect(screen.getByRole('button', { name: '09:00' })).toBeDisabled()
  expect(onHorario).not.toHaveBeenCalled()
})

it('explica quando não existem datas disponíveis', () => {
  render(<SelecaoDataHorario datas={[]} dataSelecionada={null} horarioSelecionado={null} onSelecionarData={vi.fn()} onSelecionarHorario={vi.fn()} />)
  expect(screen.getByText('Nenhuma data disponível no momento.')).toBeInTheDocument()
})

it('mantém a troca de data acessível quando um dia não possui horários', () => {
  render(<SelecaoDataHorario datas={[{ data: '2026-09-18', disponivel: true, horarios: [] }]} dataSelecionada="2026-09-18" horarioSelecionado={null} onSelecionarData={vi.fn()} onSelecionarHorario={vi.fn()} />)
  expect(screen.getByText('Nenhum horário disponível para esta data.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Selecionar 18 de setembro' })).toBeEnabled()
})
```

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `npm run test -- src/features/agendamentos/components/etapas.test.tsx`

Expected: FAIL porque os componentes ainda não existem.

- [ ] **Step 3: Implementar `EstadoFeedback`**

```tsx
interface EstadoFeedbackProps {
  titulo: string
  descricao: string
  acao?: { rotulo: string; onClick: () => void }
  carregando?: boolean
}

export function EstadoFeedback({ titulo, descricao, acao, carregando = false }: EstadoFeedbackProps) {
  return (
    <section className="booking-feedback" role={carregando ? 'status' : 'alert'} aria-live="polite">
      <p className="booking-kicker">{carregando ? 'Carregando' : 'Não foi possível continuar'}</p>
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      {acao && <button className="booking-text-action" type="button" onClick={acao.onClick}>{acao.rotulo}</button>}
    </section>
  )
}
```

- [ ] **Step 4: Implementar seleções semânticas**

`SelecaoServico` e `SelecaoProfissional` devem renderizar `button` para cada opção, usar `aria-pressed`, classe `is-selected` e uma mensagem com `EstadoFeedback` quando a lista estiver vazia.

`SelecaoDataHorario` deve:

```tsx
const dataAtiva = datas.find((item) => item.data === dataSelecionada)

return (
  <>
    <div className="booking-date-strip" aria-label="Datas disponíveis">
      {datas.map((item) => (
        <button
          type="button"
          key={item.data}
          disabled={!item.disponivel}
          aria-label={`Selecionar ${formatarDataLonga(item.data)}`}
          aria-pressed={item.data === dataSelecionada}
          onClick={() => onSelecionarData(item.data)}
        >
          <span>{formatarDiaSemana(item.data)}</span>
          <strong>{formatarDiaMes(item.data)}</strong>
        </button>
      ))}
    </div>
    {dataSelecionada && dataAtiva && (
      <div className="booking-time-grid" aria-label="Horários disponíveis">
        {dataAtiva.horarios.map((item) => (
          <button type="button" key={item.horario} disabled={!item.disponivel} aria-pressed={item.horario === horarioSelecionado} onClick={() => onSelecionarHorario(item.horario)}>
            {item.horario}
          </button>
        ))}
      </div>
    )}
  </>
)
```

Antes desse retorno, renderizar `EstadoFeedback` com “Nenhuma data disponível no momento.” quando `datas` estiver vazio. Quando `dataAtiva.horarios` estiver vazio, manter a faixa de datas e exibir “Nenhum horário disponível para esta data.” no lugar da grade.

Adicionar `formatarDiaSemana` e `formatarDiaMes` em `formatters.ts` com testes que comprovem saída `sex.` e `18` para `2026-09-18`.

- [ ] **Step 5: Rodar os testes até passar**

Run: `npm run test -- src/features/agendamentos/components/etapas.test.tsx src/lib/formatters.test.ts`

Expected: PASS para seleção, vazio e indisponibilidade.

- [ ] **Step 6: Commit**

```powershell
git add front-end/src/lib/formatters.ts front-end/src/lib/formatters.test.ts front-end/src/features/agendamentos/components/EstadoFeedback.tsx front-end/src/features/agendamentos/components/SelecaoServico.tsx front-end/src/features/agendamentos/components/SelecaoProfissional.tsx front-end/src/features/agendamentos/components/SelecaoDataHorario.tsx front-end/src/features/agendamentos/components/etapas.test.tsx
git commit -m "feat(agendamentos): adicionar etapas de seleção"
```

---

### Task 5: Criar dados do cliente, revisão e confirmação

**Files:**
- Create: `front-end/src/features/agendamentos/components/DadosClienteForm.tsx`
- Create: `front-end/src/features/agendamentos/components/RevisaoAgendamento.tsx`
- Create: `front-end/src/features/agendamentos/components/ConfirmacaoAgendamento.tsx`
- Modify: `front-end/src/features/agendamentos/components/etapas.test.tsx`

**Interfaces:**
- Consumes: `DadosCliente`, `Estabelecimento`, `ServicoAgendamento`, `Profissional`, formatadores e `validarDadosCliente`.
- Produces: formulário controlado, revisão com `onEditar(etapa)` e confirmação com resumo final.

- [ ] **Step 1: Acrescentar testes que falham**

```tsx
it('mostra erros de nome e telefone e aceita e-mail opcional', async () => {
  const onContinuar = vi.fn()
  render(<DadosClienteForm valor={{ nome: '', telefone: '', email: '' }} onChange={vi.fn()} onContinuar={onContinuar} />)
  await userEvent.click(screen.getByRole('button', { name: 'Continuar para revisão' }))
  expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
  expect(screen.getByText('Informe seu telefone.')).toBeInTheDocument()
  expect(onContinuar).not.toHaveBeenCalled()
})

it('permite editar a etapa de serviço pela revisão', async () => {
  const onEditar = vi.fn()
  render(<RevisaoAgendamento estabelecimento={estabelecimento} servico={servico} profissional={profissional} data="2026-09-18" horario="14:30" cliente={cliente} onEditar={onEditar} onConfirmar={vi.fn()} />)
  await userEvent.click(screen.getByRole('button', { name: 'Editar serviço' }))
  expect(onEditar).toHaveBeenCalledWith('servico')
})

it('mostra os dados essenciais na confirmação', () => {
  render(<ConfirmacaoAgendamento estabelecimento={estabelecimento} servico={servico} profissional={profissional} data="2026-09-18" horario="14:30" />)
  expect(screen.getByRole('heading', { name: 'Seu horário está marcado.' })).toBeInTheDocument()
  expect(screen.getByText('14:30')).toBeInTheDocument()
})
```

Definir os objetos de teste no topo do arquivo com ids e valores completos dos contratos da Task 2.

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `npm run test -- src/features/agendamentos/components/etapas.test.tsx`

Expected: FAIL porque os três componentes ainda não existem.

- [ ] **Step 3: Implementar `DadosClienteForm`**

Usar inputs controlados com `label`, `id`, `autoComplete`, `aria-invalid` e `aria-describedby`. No submit, chamar `validarDadosCliente`; somente chamar `onContinuar()` quando não houver erros.

```tsx
<form onSubmit={handleSubmit} noValidate>
  <label htmlFor="cliente-nome">Nome</label>
  <input id="cliente-nome" autoComplete="name" value={valor.nome} onChange={(event) => atualizar('nome', event.target.value)} />
  {erros.nome && <p id="erro-nome" className="booking-field-error">{erros.nome}</p>}
  <label htmlFor="cliente-telefone">Telefone</label>
  <input id="cliente-telefone" autoComplete="tel" inputMode="tel" value={valor.telefone} onChange={(event) => atualizar('telefone', event.target.value)} />
  <label htmlFor="cliente-email">E-mail <span>opcional</span></label>
  <input id="cliente-email" type="email" autoComplete="email" value={valor.email} onChange={(event) => atualizar('email', event.target.value)} />
  <button className="booking-primary-action" type="submit">Continuar para revisão</button>
</form>
```

- [ ] **Step 4: Implementar revisão e confirmação**

`RevisaoAgendamento` deve renderizar grupos para serviço, profissional, data e horário, dados pessoais e valor. Cada botão deve ter nome acessível `Editar serviço`, `Editar profissional`, `Editar data e horário` ou `Editar seus dados`.

`ConfirmacaoAgendamento` deve usar `role="status"`, título “Seu horário está marcado.” e somente os dados confirmados. A ação disponível será “Voltar para o início”, apontando para `/`.

- [ ] **Step 5: Rodar os testes até passar**

Run: `npm run test -- src/features/agendamentos/components/etapas.test.tsx`

Expected: PASS para validação, edição e confirmação.

- [ ] **Step 6: Commit**

```powershell
git add front-end/src/features/agendamentos/components/DadosClienteForm.tsx front-end/src/features/agendamentos/components/RevisaoAgendamento.tsx front-end/src/features/agendamentos/components/ConfirmacaoAgendamento.tsx front-end/src/features/agendamentos/components/etapas.test.tsx
git commit -m "feat(agendamentos): adicionar dados revisao e confirmacao"
```

---

### Task 6: Compor a página progressiva e os estados de carregamento

**Files:**
- Create: `front-end/src/features/agendamentos/components/AgendamentoHeader.tsx`
- Create: `front-end/src/features/agendamentos/components/IndicadorProgresso.tsx`
- Create: `front-end/src/features/agendamentos/pages/AgendarPage.tsx`
- Create: `front-end/src/features/agendamentos/pages/AgendarPage.test.tsx`
- Create: `front-end/src/features/agendamentos/index.ts`

**Interfaces:**
- Consumes: adaptador da Task 2, reducer da Task 3 e todos os componentes das Tasks 4 e 5.
- Produces: `AgendarPage` exportada por `features/agendamentos/index.ts`.

- [ ] **Step 1: Escrever teste integrado do fluxo que falha**

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AgendarPage } from './AgendarPage'

it('conclui um agendamento simulado e preserva dados ao voltar', async () => {
  const user = userEvent.setup()
  render(<MemoryRouter initialEntries={['/agendar?estabelecimento=estudio-central']}><AgendarPage /></MemoryRouter>)

  await screen.findByRole('heading', { name: 'Escolha o serviço' })
  await user.click(screen.getByRole('button', { name: /Corte masculino/ }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('button', { name: /Alex Martins/ }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  const primeiraDataDisponivel = screen.getAllByRole('button', { name: /^Selecionar / }).find((button) => !button.hasAttribute('disabled'))
  expect(primeiraDataDisponivel).toBeDefined()
  await user.click(primeiraDataDisponivel!)
  await user.click(screen.getByRole('button', { name: '14:00' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
  await user.type(screen.getByLabelText('Telefone'), '(11) 99999-0000')
  await user.click(screen.getByRole('button', { name: 'Continuar para revisão' }))

  await user.click(screen.getByRole('button', { name: 'Editar serviço' }))
  expect(screen.getByRole('button', { name: /Corte masculino/ })).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza')
  await user.click(screen.getByRole('button', { name: 'Continuar para revisão' }))
  await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }))
  expect(await screen.findByRole('heading', { name: 'Seu horário está marcado.' })).toBeInTheDocument()
})

it('mostra erro para um estabelecimento desconhecido', async () => {
  render(<MemoryRouter initialEntries={['/agendar?estabelecimento=inexistente']}><AgendarPage /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText('Estabelecimento não encontrado')).toBeInTheDocument())
})
```

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `npm run test -- src/features/agendamentos/pages/AgendarPage.test.tsx`

Expected: FAIL porque a página ainda não existe.

- [ ] **Step 3: Implementar cabeçalho e progresso**

`AgendamentoHeader` mostra iniciais, nome e link “Voltar para o início”. O nome e as iniciais vêm de `Estabelecimento`.

`IndicadorProgresso` recebe `etapaAtual` e usa esta ordem:

```ts
const etapas = [
  ['servico', 'Serviço'],
  ['profissional', 'Profissional'],
  ['data-horario', 'Data e horário'],
  ['cliente', 'Seus dados'],
  ['revisao', 'Confirmar'],
] as const
```

Renderizar uma lista ordenada no desktop e `Etapa {indice + 1} de 5` no elemento mobile. Em confirmação, marcar todas as etapas como concluídas.

- [ ] **Step 4: Implementar carregamento e composição da página**

`AgendarPage` deve:

1. ler `estabelecimento` com `useSearchParams`;
2. carregar `ContextoAgendamento` em `useEffect`;
3. usar `useReducer(agendamentoReducer, undefined, criarEstadoInicial)`;
4. expor carregamento e erro por `EstadoFeedback`;
5. derivar serviço, profissional e agenda com `useMemo`;
6. renderizar uma única etapa por vez;
7. mudar `document.title` para `Agendar | {estabelecimento.nome}` e restaurar ao desmontar;
8. rolar para o início do conteúdo ao trocar de etapa;
9. impedir avanço quando a escolha obrigatória da etapa estiver ausente.

Usar este mapa para o conteúdo principal:

```tsx
switch (estado.etapa) {
  case 'servico': return <SelecaoServico ... />
  case 'profissional': return <SelecaoProfissional ... />
  case 'data-horario': return <SelecaoDataHorario ... />
  case 'cliente': return <DadosClienteForm ... />
  case 'revisao': return <RevisaoAgendamento ... />
  case 'confirmacao': return <ConfirmacaoAgendamento ... />
}
```

Os botões gerais usam “Voltar” e “Continuar”. Na revisão, usar “Confirmar agendamento”.

- [ ] **Step 5: Rodar os testes até passar**

Run: `npm run test -- src/features/agendamentos/pages/AgendarPage.test.tsx`

Expected: PASS para fluxo completo, preservação e erro.

- [ ] **Step 6: Commit**

```powershell
git add front-end/src/features/agendamentos/components/AgendamentoHeader.tsx front-end/src/features/agendamentos/components/IndicadorProgresso.tsx front-end/src/features/agendamentos/pages/AgendarPage.tsx front-end/src/features/agendamentos/pages/AgendarPage.test.tsx front-end/src/features/agendamentos/index.ts
git commit -m "feat(agendamentos): compor fluxo progressivo"
```

---

### Task 7: Adicionar roteamento público

**Files:**
- Create: `front-end/src/app/AppRouter.tsx`
- Create: `front-end/src/app/AppRouter.test.tsx`
- Modify: `front-end/src/main.tsx`
- Verify: `front-end/src/App.tsx`

**Interfaces:**
- Consumes: `App` e `AgendarPage`.
- Produces: `AppRouter` renderizado dentro de `BrowserRouter`.

- [ ] **Step 1: Escrever testes de rota que falham**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRouter } from './AppRouter'

it('renderiza a Home em /', () => {
  render(<MemoryRouter initialEntries={['/']}><AppRouter /></MemoryRouter>)
  expect(screen.getByRole('heading', { name: /Seu estilo/ })).toBeInTheDocument()
})

it('renderiza o agendamento em /agendar', async () => {
  render(<MemoryRouter initialEntries={['/agendar']}><AppRouter /></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: 'Escolha o serviço' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `npm run test -- src/app/AppRouter.test.tsx`

Expected: FAIL porque `AppRouter` ainda não existe.

- [ ] **Step 3: Implementar as rotas**

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import App from '../App'
import { AgendarPage } from '../features/agendamentos'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/agendar" element={<AgendarPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

Em `main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app/AppRouter'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
)
```

Confirmar que todos os CTAs existentes em `App.tsx` continuam usando `/agendar`.

- [ ] **Step 4: Rodar testes de rota e fluxo**

Run: `npm run test -- src/app/AppRouter.test.tsx src/features/agendamentos/pages/AgendarPage.test.tsx`

Expected: PASS para Home, agendamento e fluxo integrado.

- [ ] **Step 5: Commit**

```powershell
git add front-end/src/app/AppRouter.tsx front-end/src/app/AppRouter.test.tsx front-end/src/main.tsx
git commit -m "feat(frontend): adicionar rota publica de agendamento"
```

---

### Task 8: Aplicar identidade visual e responsividade

**Files:**
- Create: `front-end/src/features/agendamentos/agendamento.css`
- Modify: `front-end/src/features/agendamentos/pages/AgendarPage.tsx`
- Modify: `front-end/src/features/agendamentos/components/AgendamentoHeader.tsx`
- Modify: `front-end/src/features/agendamentos/components/IndicadorProgresso.tsx`
- Modify: `front-end/src/features/agendamentos/index.ts`

**Interfaces:**
- Consumes: classes emitidas pelos componentes das Tasks 4 a 7.
- Produces: layout editorial responsivo sem mudar a API pública dos componentes.

- [ ] **Step 1: Importar o CSS da feature em `index.ts`**

```ts
import './agendamento.css'
export { AgendarPage } from './pages/AgendarPage'
```

- [ ] **Step 2: Implementar os tokens e a composição desktop**

O CSS deve usar valores concretos:

```css
.booking-shell { min-height: 100vh; background: var(--paper); color: var(--ink); }
.booking-header, .booking-layout { width: min(1180px, calc(100% - 80px)); margin: 0 auto; }
.booking-header { min-height: 96px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
.booking-layout { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: clamp(48px, 8vw, 120px); padding: 72px 0 110px; }
.booking-progress { border-top: 1px solid var(--line); }
.booking-progress li { display: grid; grid-template-columns: 34px 1fr; gap: 14px; padding: 18px 0; border-bottom: 1px solid var(--line); color: var(--muted); }
.booking-progress li.is-current { color: var(--ink); }
.booking-progress li.is-current span:first-child { color: var(--copper); }
.booking-panel > h1 { max-width: 760px; margin: 18px 0 48px; font: 500 clamp(48px, 6vw, 78px)/.98 'Playfair Display', Georgia, serif; letter-spacing: -.045em; }
.booking-option-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--line); }
.booking-option { min-height: 180px; padding: 26px; color: inherit; background: transparent; border: 0; border-bottom: 1px solid var(--line); text-align: left; cursor: pointer; }
.booking-option:nth-child(even) { border-left: 1px solid var(--line); }
.booking-option.is-selected { background: #f0ece3; box-shadow: inset 3px 0 0 var(--copper); }
.booking-date-strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(92px, 1fr); overflow-x: auto; border: 1px solid var(--line); }
.booking-time-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 30px; }
.booking-time-grid button { min-height: 48px; border: 1px solid var(--line); background: transparent; color: var(--ink); }
.booking-time-grid button[aria-pressed='true'] { color: var(--paper); background: var(--green); border-color: var(--green); }
.booking-primary-action { min-height: 48px; padding: 14px 22px; color: var(--paper); background: var(--ink); border: 0; font: 700 11px 'Manrope', sans-serif; }
.booking-secondary-action { min-height: 48px; padding: 14px 0; color: var(--ink); background: transparent; border: 0; border-bottom: 1px solid currentColor; }
```

- [ ] **Step 3: Implementar formulário, revisão, foco e estados**

Adicionar regras concretas para `.booking-form`, `.booking-field`, `.booking-field-error`, `.booking-review`, `.booking-feedback`, `.booking-confirmation` e `.booking-actions`. Inputs devem ter `min-height: 50px`, borda somente inferior e `font-size: 16px`. Todo `button`, `input` e `a` deve receber foco visível com `outline: 2px solid var(--copper); outline-offset: 3px`.

- [ ] **Step 4: Implementar tablet e mobile**

```css
@media (max-width: 900px) {
  .booking-layout { grid-template-columns: 1fr; gap: 42px; }
  .booking-progress ol { display: grid; grid-template-columns: repeat(5, 1fr); }
  .booking-progress li { display: block; padding: 12px 8px; }
}

@media (max-width: 600px) {
  .booking-header, .booking-layout { width: min(100% - 40px, 560px); }
  .booking-header { min-height: 82px; }
  .booking-layout { padding: 44px 0 80px; }
  .booking-progress ol { display: none; }
  .booking-progress-mobile { display: block; color: var(--copper); font: 10px 'DM Mono', monospace; }
  .booking-panel > h1 { font-size: clamp(48px, 14vw, 68px); margin-bottom: 36px; }
  .booking-option-grid { grid-template-columns: 1fr; }
  .booking-option:nth-child(even) { border-left: 0; }
  .booking-time-grid { grid-template-columns: repeat(3, 1fr); }
  .booking-actions { position: sticky; bottom: 0; padding: 14px 0; background: color-mix(in srgb, var(--paper) 94%, transparent); }
}

@media (max-width: 360px) {
  .booking-time-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (prefers-reduced-motion: reduce) {
  .booking-shell * { scroll-behavior: auto; transition-duration: .01ms; animation-duration: .01ms; }
}
```

- [ ] **Step 5: Rodar testes de componente para detectar regressões estruturais**

Run: `npm run test -- src/features/agendamentos/components/etapas.test.tsx src/features/agendamentos/pages/AgendarPage.test.tsx`

Expected: PASS; CSS não altera nomes acessíveis ou comportamento.

- [ ] **Step 6: Commit**

```powershell
git add front-end/src/features/agendamentos/agendamento.css front-end/src/features/agendamentos/pages/AgendarPage.tsx front-end/src/features/agendamentos/components/AgendamentoHeader.tsx front-end/src/features/agendamentos/components/IndicadorProgresso.tsx front-end/src/features/agendamentos/index.ts
git commit -m "style(agendamentos): aplicar experiencia editorial responsiva"
```

---

### Task 9: Atualizar documentação e executar verificação final

**Files:**
- Modify: `ROTAS.md`
- Create: `design-qa-agendamento.md`

**Interfaces:**
- Consumes: a feature completa.
- Produces: documentação de rota e evidência de qualidade visual.

- [ ] **Step 1: Atualizar `ROTAS.md`**

Adicionar sem alterar as linhas existentes:

```markdown
| /agendar            | Novo agendamento | estabelecimento (query, opcional) | não |
```

- [ ] **Step 2: Rodar todos os testes automatizados**

Run from `front-end/`:

```powershell
npm run test
```

Expected: todos os testes PASS, sem testes ignorados.

- [ ] **Step 3: Rodar lint e build**

Run:

```powershell
npm run lint
npm run build
```

Expected: ambos terminam com exit code 0.

- [ ] **Step 4: Verificar o fluxo no navegador**

Iniciar o frontend e conferir:

1. `/` mantém a Home e seus CTAs abrem `/agendar`.
2. `/agendar` usa Estúdio Central como demonstração.
3. `/agendar?estabelecimento=barbearia-horizonte` troca nome, serviços e profissionais.
4. `/agendar?estabelecimento=inexistente` mostra erro com retorno à Home.
5. serviço → profissional → data/horário → cliente → revisão → confirmação funciona.
6. voltar preserva escolhas; mudar escolhas invalida somente dependências.
7. horários desabilitados não respondem ao clique.
8. formulário bloqueia nome/telefone vazios e aceita e-mail vazio.
9. não há erros ou avisos no console.

- [ ] **Step 5: Executar QA visual responsivo**

Capturar e comparar com a Home nos viewports:

- desktop: `1280 x 800`;
- tablet: `768 x 1024`;
- celular: `390 x 844`;
- celular mínimo: `320 x 720`.

Registrar em `design-qa-agendamento.md`:

- fonte visual: Home atual e `design-qa.md`;
- screenshots da implementação;
- tipografia, espaçamento, cores, imagens e copy;
- interação testada e console;
- correções de P0/P1/P2 e nova evidência após cada correção;
- linha final exata `final result: passed` somente quando não restarem problemas P0/P1/P2.

- [ ] **Step 6: Conferir alterações e preservar arquivo não relacionado**

Run:

```powershell
git diff --check
git status --short
```

Expected: somente `ROTAS.md` e `design-qa-agendamento.md` ficam pendentes nesta tarefa; o `design-qa.md` já existente continua fora do commit.

- [ ] **Step 7: Commit**

```powershell
git add ROTAS.md design-qa-agendamento.md
git commit -m "docs: registrar fluxo publico de agendamento"
```

---

## Verificação de cobertura da especificação

- Rota e estabelecimento por slug: Tasks 2, 6 e 7.
- Serviço e profissional filtrado: Tasks 2 e 4.
- Data, horário e indisponibilidade: Tasks 2 e 4.
- Dados mínimos do cliente: Tasks 3 e 5.
- Revisão editável e confirmação: Tasks 3, 5 e 6.
- Preservação e invalidação de estado: Tasks 3 e 6.
- Carregamento, erro e vazios: Tasks 4 e 6.
- Identidade editorial e responsividade: Task 8.
- Documentação, testes e QA visual: Task 9.
- Ausência de mudanças no backend: restrição global aplicada a todas as tarefas.
