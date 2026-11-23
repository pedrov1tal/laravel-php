import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRouter } from './AppRouter'

function respostaJson(corpo: unknown) {
  return new Response(JSON.stringify(corpo), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('AppRouter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

    paginaSemSessao.unmount()
    localStorage.setItem('nexo:sessao-cliente', JSON.stringify({
      token: 'token-de-teste',
      usuario: { id: '1', nome: 'Ana Souza', telefone: '11999999999', email: 'ana@exemplo.com' },
      adminSlug: null,
      cliente: true,
      possuiPerfilOperacional: false,
    }))

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /^Olá, Ana/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Agendar' })).toHaveAttribute('href', '/agendar')
  })

  it('renderiza a seleção de barbearia em /agendar', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => respostaJson({ data: [] })))

    render(
      <MemoryRouter initialEntries={['/agendar']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma barbearia disponível' }),
    ).toBeInTheDocument()
  })
})
