import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage, RegisterPage } from '../../App'
import {
  obterUsuarioAutenticado,
} from './session'

function renderizarRota(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/agendar" element={<DestinoAgendamento />} />
      </Routes>
    </MemoryRouter>,
  )
}

function DestinoAgendamento() {
  const location = useLocation()

  return (
    <>
      <h1>Agendamento retomado</h1>
      <p>{location.search}</p>
    </>
  )
}

function respostaJson(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('páginas de autenticação', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('autentica a nova conta e preserva a barbearia ao retornar ao agendamento', async () => {
    vi.stubGlobal('fetch', vi.fn(async (entrada: RequestInfo | URL) => {
      const url = String(entrada)
      if (url.endsWith('/auth/registro')) {
        return respostaJson({
          usuario: { id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com' },
          cliente: { id: 1, nome: 'Ana Souza', telefone: '(11) 99999-0000', email: 'ana@exemplo.com' },
        }, 201)
      }
      if (url.endsWith('/auth/login')) {
        return respostaJson({
          token: 'token-de-teste',
          usuario: { id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com' },
        })
      }
      if (url.endsWith('/auth/me')) {
        return respostaJson({
          cliente: { id: 1, telefone: '(11) 99999-0000' },
          barbearias: [],
        })
      }
      return respostaJson({}, 404)
    }))
    const user = userEvent.setup()
    renderizarRota('/cadastro?retorno=%2Fagendar%3Festabelecimento%3Destudio-central')

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-0000')
    await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await user.type(screen.getByLabelText('Crie uma senha'), 'senha-segura')
    await user.click(screen.getByRole('button', { name: /Criar minha conta/ }))

    expect(
      await screen.findByRole('heading', { name: 'Agendamento retomado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('?estabelecimento=estudio-central')).toBeInTheDocument()
    expect(obterUsuarioAutenticado()).toMatchObject({
      nome: 'Ana Souza',
      telefone: '(11) 99999-0000',
      email: 'ana@exemplo.com',
    })
  })

  it('entra com perfil cadastrado e respeita o retorno', async () => {
    vi.stubGlobal('fetch', vi.fn(async (entrada: RequestInfo | URL) => {
      const url = String(entrada)
      if (url.endsWith('/auth/login')) {
        return respostaJson({
          token: 'token-de-teste',
          usuario: { id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com' },
        })
      }
      if (url.endsWith('/auth/me')) {
        return respostaJson({
          cliente: { id: 1, telefone: '(11) 99999-0000' },
          barbearias: [],
        })
      }
      return respostaJson({}, 404)
    }))
    const user = userEvent.setup()
    renderizarRota('/login?retorno=%2Fagendar')

    await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-segura')
    await user.click(
      screen.getByRole('button', { name: /Entrar na minha conta/ }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Agendamento retomado' }),
    ).toBeInTheDocument()
  })

  it('orienta criar conta quando o e-mail não possui perfil local', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respostaJson({
      message: 'Conta não encontrada. Crie seu cadastro para continuar.',
    }, 401)))
    const user = userEvent.setup()
    renderizarRota('/login')

    await user.type(screen.getByLabelText('E-mail'), 'novo@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-segura')
    await user.click(
      screen.getByRole('button', { name: /Entrar na minha conta/ }),
    )

    expect(
      await screen.findByText('Conta não encontrada. Crie seu cadastro para continuar.'),
    ).toBeInTheDocument()
  })
})
