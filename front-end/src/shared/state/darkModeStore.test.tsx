import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { definirModoEscuro, useDarkModeStore } from './darkModeStore'

function TelaDeControle() {
  const modoEscuro = useDarkModeStore((estado) => estado.modoEscuro)

  return (
    <button onClick={() => definirModoEscuro(!modoEscuro)}>
      {modoEscuro ? 'Desativar modo escuro' : 'Ativar modo escuro'}
    </button>
  )
}

function TelaDistante() {
  const modoEscuro = useDarkModeStore((estado) => estado.modoEscuro)

  return <output>{modoEscuro ? 'Modo escuro ativo' : 'Modo claro ativo'}</output>
}

describe('darkModeStore', () => {
  afterEach(() => definirModoEscuro(false))

  it('sincroniza consumidores independentes e persiste a preferência', () => {
    render(
      <>
        <TelaDeControle />
        <TelaDistante />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }))

    expect(screen.getByText('Modo escuro ativo')).toBeTruthy()
    expect(localStorage.getItem('nexo:modo-escuro')).toBe('true')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})