import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { cadastrarUsuario } from '../../autenticacao/session'
import { AgendarPage } from './AgendarPage'

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

function renderizarAgendamento() {
  return render(
    <MemoryRouter
      initialEntries={['/agendar?estabelecimento=estudio-central']}
    >
      <Routes>
        <Route path="/agendar" element={<AgendarPage />} />
        <Route path="/login" element={<h1>Entre para continuar</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AgendarPage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('usa os dados da sessão e conclui o agendamento', async () => {
    cadastrarUsuario({
      nome: 'Ana Souza',
      telefone: '(11) 99999-0000',
      email: 'ana@exemplo.com',
    })
    const user = userEvent.setup()
    renderizarAgendamento()

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

    await user.click(screen.getByRole('button', { name: 'Editar serviço' }))
    expect(
      screen.getByRole('button', { name: /Corte masculino/ }),
    ).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Continuar para revisão' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Confirmar agendamento' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Seu horário está marcado.',
      }),
    ).toBeInTheDocument()
  })

  it('envia ao login e preserva o rascunho quando não há sessão', async () => {
    const user = userEvent.setup()
    renderizarAgendamento()

    await selecionarAteHorario(user)
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(
      screen.getByRole('heading', { name: 'Entre para continuar' }),
    ).toBeInTheDocument()
    expect(sessionStorage.getItem('nexo:agendamento-pendente')).toContain(
      'servico-corte',
    )
  })

  it('mostra erro para um estabelecimento desconhecido', async () => {
    render(
      <MemoryRouter
        initialEntries={['/agendar?estabelecimento=inexistente']}
      >
        <AgendarPage />
      </MemoryRouter>,
    )

    await waitFor(() =>
      expect(
        screen.getByText('Estabelecimento não encontrado'),
      ).toBeInTheDocument(),
    )
  })
})
