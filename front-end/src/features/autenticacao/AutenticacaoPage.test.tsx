import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { LoginPage, RegisterPage } from '../../App'
import {
  cadastrarUsuario,
  encerrarSessao,
  obterUsuarioAutenticado,
} from './session'

function renderizarRota(rota: string) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/agendar" element={<h1>Agendamento retomado</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('páginas de autenticação', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cadastra o perfil completo e retorna ao agendamento', async () => {
    const user = userEvent.setup()
    renderizarRota('/cadastro?retorno=%2Fagendar')

    await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza')
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-0000')
    await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await user.type(screen.getByLabelText('Crie uma senha'), 'senha-segura')
    await user.click(screen.getByRole('button', { name: /Criar minha conta/ }))

    expect(
      screen.getByRole('heading', { name: 'Agendamento retomado' }),
    ).toBeInTheDocument()
    expect(obterUsuarioAutenticado()).toMatchObject({
      nome: 'Ana Souza',
      telefone: '(11) 99999-0000',
      email: 'ana@exemplo.com',
    })
  })

  it('entra com perfil cadastrado e respeita o retorno', async () => {
    cadastrarUsuario({
      nome: 'Ana Souza',
      telefone: '(11) 99999-0000',
      email: 'ana@exemplo.com',
    })
    encerrarSessao()
    const user = userEvent.setup()
    renderizarRota('/login?retorno=%2Fagendar')

    await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-segura')
    await user.click(
      screen.getByRole('button', { name: /Entrar na minha conta/ }),
    )

    expect(
      screen.getByRole('heading', { name: 'Agendamento retomado' }),
    ).toBeInTheDocument()
  })

  it('orienta criar conta quando o e-mail não possui perfil local', async () => {
    const user = userEvent.setup()
    renderizarRota('/login')

    await user.type(screen.getByLabelText('E-mail'), 'novo@exemplo.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-segura')
    await user.click(
      screen.getByRole('button', { name: /Entrar na minha conta/ }),
    )

    expect(
      screen.getByText('Conta não encontrada. Crie seu cadastro para continuar.'),
    ).toBeInTheDocument()
  })
})
