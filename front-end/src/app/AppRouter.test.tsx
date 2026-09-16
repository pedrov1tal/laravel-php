import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { cadastrarUsuario } from '../features/autenticacao/session'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  it('renderiza a Home em /', () => {
    localStorage.clear()
    const paginaSemSessao = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Sua agenda/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Login/ })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Agendar' })).toHaveAttribute('href', '/agendar')

    paginaSemSessao.unmount()
    cadastrarUsuario({ nome: 'Ana Souza', telefone: '11999999999', email: 'ana@exemplo.com' })

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /^Olá, Ana/ })).toBeInTheDocument()
  })

  it('renderiza o agendamento em /agendar', async () => {
    render(
      <MemoryRouter initialEntries={['/agendar']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Escolha o serviço' }),
    ).toBeInTheDocument()
  })
})
