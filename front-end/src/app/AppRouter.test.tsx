import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  it('renderiza a Home em /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRouter />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Seu estilo/ }),
    ).toBeInTheDocument()
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
