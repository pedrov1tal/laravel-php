import { beforeEach, describe, expect, it } from 'vitest'
import { criarEstadoInicial } from './agendamentoReducer'
import {
  consumirAgendamentoPendente,
  salvarAgendamentoPendente,
} from './agendamentoPendente'

describe('agendamento pendente de login', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('salva e consome o rascunho uma única vez', () => {
    const estado = {
      ...criarEstadoInicial(),
      etapa: 'cliente' as const,
      rascunho: {
        ...criarEstadoInicial().rascunho,
        servicoId: 's1',
        profissionalId: 'p1',
        data: '2026-09-18',
        horario: '10:00',
      },
    }

    salvarAgendamentoPendente(estado)

    expect(consumirAgendamentoPendente()).toEqual(estado)
    expect(consumirAgendamentoPendente()).toBeNull()
  })

  it('ignora conteúdo inválido da sessão', () => {
    sessionStorage.setItem('nexo:agendamento-pendente', '{inválido')
    expect(consumirAgendamentoPendente()).toBeNull()
  })
})
