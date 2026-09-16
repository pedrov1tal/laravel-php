import { describe, expect, it } from 'vitest'
import {
  formatarDataLonga,
  formatarDiaMes,
  formatarDiaSemana,
  formatarDuracao,
  formatarPreco,
} from './formatters'

describe('formatters', () => {
  it('formata preço em reais', () => {
    expect(formatarPreco(6500).replace(/\u00a0/g, ' ')).toBe('R$ 65,00')
  })

  it.each([
    [30, '30 min'],
    [60, '1h'],
    [90, '1h 30 min'],
  ])('formata %i minutos como %s', (minutos, esperado) => {
    expect(formatarDuracao(minutos)).toBe(esperado)
  })

  it('formata uma data ISO sem deslocamento de fuso', () => {
    expect(formatarDataLonga('2026-09-18')).toBe('18 de setembro')
    expect(formatarDiaSemana('2026-09-18')).toBe('sex.')
    expect(formatarDiaMes('2026-09-18')).toBe('18')
  })
})
