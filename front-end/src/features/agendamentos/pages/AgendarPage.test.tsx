import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AgendarPage } from './AgendarPage'

describe('AgendarPage', () => {
  it('conclui um agendamento simulado e preserva dados ao voltar', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter
        initialEntries={['/agendar?estabelecimento=estudio-central']}
      >
        <AgendarPage />
      </MemoryRouter>,
    )

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
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.type(screen.getByLabelText('Nome'), 'Ana Souza')
    await user.type(screen.getByLabelText('Telefone'), '(11) 99999-0000')
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
    expect(screen.getByLabelText('Nome')).toHaveValue('Ana Souza')
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
