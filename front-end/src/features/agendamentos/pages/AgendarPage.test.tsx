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
  servicos: [],
  profissionais: [],
  agendaPorProfissional: {},
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
      </Routes>
    </MemoryRouter>,
  )
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
})
