import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AgendarPage } from './AgendarPage'

const barbearia = {
  id: '7',
  slug: 'estúdio são',
  nome: 'Estúdio São',
  descricao: 'Cortes clássicos e contemporâneos.',
  endereco: 'Rua Central, 25',
  telefone: '11999990000',
}

const contexto = {
  estabelecimento: {
    ...barbearia,
    iniciais: 'ES',
  },
  servicos: [
    {
      id: 's1',
      nome: 'Corte masculino',
      descricao: 'Corte personalizado.',
      duracaoMinutos: 45,
      precoCentavos: 4500,
    },
  ],
  profissionais: [
    {
      id: 'p1',
      nome: 'Alex Martins',
      especialidade: 'Cortes e acabamento',
      iniciais: 'AM',
      servicoIds: ['s1'],
    },
  ],
  agendaPorProfissional: {
    p1: [
      {
        data: '2026-11-24',
        disponivel: true,
        horarios: [{ horario: '14:00', disponivel: true }],
      },
    ],
  },
}

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderizarAgendamento(entrada = '/agendar') {
  return render(
    <MemoryRouter initialEntries={[entrada]}>
      <Routes>
        <Route path="/agendar" element={<AgendarPage />} />
        <Route path="/login" element={<h1>Entre para continuar</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

function simularApiDoFluxo() {
  vi.stubGlobal('fetch', vi.fn(async (entrada: RequestInfo | URL) => {
    const url = String(entrada)
    return url.includes('/contexto-agendamento')
      ? respostaJson(contexto)
      : respostaJson({}, 201)
  }))
}

function salvarSessaoCliente() {
  localStorage.setItem('nexo:sessao-cliente', JSON.stringify({
    token: 'token-de-teste',
    usuario: {
      id: '1',
      nome: 'Ana Souza',
      telefone: '(11) 99999-0000',
      email: 'ana@exemplo.com',
    },
    adminSlug: null,
    cliente: true,
    possuiPerfilOperacional: false,
  }))
}

async function selecionarAteHorario(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: 'Escolha o serviço' })
  await user.click(screen.getByRole('button', { name: /Corte masculino/ }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('button', { name: /Alex Martins/ }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))

  const primeiraDataDisponivel = screen
    .getAllByRole('button', { name: /^Selecionar / })
    .find((button) => !button.hasAttribute('disabled'))
  expect(primeiraDataDisponivel).toBeDefined()
  await user.click(primeiraDataDisponivel!)
  await user.click(screen.getByRole('button', { name: '14:00' }))
}

describe('AgendarPage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lista as barbearias e inicia o fluxo ao escolher uma opção', async () => {
    vi.stubGlobal('fetch', vi.fn(async (entrada: RequestInfo | URL) => {
      const url = String(entrada)
      if (url === '/api/v1/barbearias') {
        return respostaJson({ data: [barbearia] })
      }
      if (url === '/api/v1/barbearias/est%C3%BAdio%20s%C3%A3o/contexto-agendamento') {
        return respostaJson(contexto)
      }
      return respostaJson({}, 404)
    }))

    const user = userEvent.setup()
    renderizarAgendamento()

    expect(
      await screen.findByRole('heading', { name: 'Escolha uma barbearia' }),
    ).toBeInTheDocument()
    const opcao = screen.getByRole('link', { name: /Estúdio São/ })
    expect(opcao).toHaveAttribute(
      'href',
      '/agendar?estabelecimento=est%C3%BAdio%20s%C3%A3o',
    )

    await user.click(opcao)

    expect(
      await screen.findByRole('heading', { name: 'Escolha o serviço' }),
    ).toBeInTheDocument()
  })

  it('mostra um estado vazio quando não há barbearias ativas', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respostaJson({ data: [] })))

    renderizarAgendamento()

    expect(
      await screen.findByRole('heading', {
        name: 'Nenhuma barbearia disponível',
      }),
    ).toBeInTheDocument()
  })

  it('permite tentar novamente depois de uma falha na listagem', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(respostaJson({}, 500))
      .mockResolvedValueOnce(respostaJson({ data: [barbearia] }))
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderizarAgendamento()

    expect(
      await screen.findByRole('heading', {
        name: 'Não foi possível carregar as barbearias',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(
      await screen.findByRole('link', { name: /Estúdio São/ }),
    ).toBeInTheDocument()
  })

  it('preserva o fluxo direto quando o estabelecimento está na URL', async () => {
    vi.stubGlobal('fetch', vi.fn(async (entrada: RequestInfo | URL) => {
      const url = String(entrada)
      return url.includes('/contexto-agendamento')
        ? respostaJson(contexto)
        : respostaJson({}, 404)
    }))

    renderizarAgendamento('/agendar?estabelecimento=estúdio%20são')

    expect(
      await screen.findByRole('heading', { name: 'Escolha o serviço' }),
    ).toBeInTheDocument()
  })

  it('usa os dados da sessão e conclui o agendamento', async () => {
    salvarSessaoCliente()
    simularApiDoFluxo()
    const user = userEvent.setup()
    renderizarAgendamento('/agendar?estabelecimento=estudio-central')

    await selecionarAteHorario(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      screen.getByRole('heading', { name: 'Confirme sua conta' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nome')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Continuar para revisão' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar agendamento' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Seu horário está marcado.' }),
    ).toBeInTheDocument()
  })

  it('envia ao login e preserva o rascunho quando não há sessão', async () => {
    simularApiDoFluxo()
    const user = userEvent.setup()
    renderizarAgendamento('/agendar?estabelecimento=estudio-central')

    await selecionarAteHorario(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      screen.getByRole('heading', { name: 'Entre para continuar' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('nexo:agendamento-pendente')).toContain('s1')
  })

  it('mostra erro para uma barbearia desconhecida', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respostaJson({}, 404)))
    renderizarAgendamento('/agendar?estabelecimento=inexistente')

    expect(
      await screen.findByRole('heading', {
        name: 'Barbearia não encontrada ou indisponível.',
      }),
    ).toBeInTheDocument()
  })
})
