import { describe, expect, it } from 'vitest'
import {
  agendamentoReducer,
  criarEstadoInicial,
  validarDadosCliente,
} from './agendamentoReducer'

describe('agendamentoReducer', () => {
  it('trocar serviço limpa profissional, data e horário', () => {
    const preenchido = {
      ...criarEstadoInicial(),
      rascunho: {
        servicoId: 'antigo',
        profissionalId: 'p1',
        data: '2026-09-18',
        horario: '10:00',
        cliente: { nome: '', telefone: '', email: '' },
      },
    }
    const resultado = agendamentoReducer(preenchido, {
      type: 'selecionar-servico',
      servicoId: 'novo',
    })

    expect(resultado.rascunho).toMatchObject({
      servicoId: 'novo',
      profissionalId: null,
      data: null,
      horario: null,
    })
  })

  it('manter o mesmo serviço preserva as escolhas dependentes', () => {
    const preenchido = {
      ...criarEstadoInicial(),
      rascunho: {
        servicoId: 's1',
        profissionalId: 'p1',
        data: '2026-09-18',
        horario: '10:00',
        cliente: { nome: 'Ana', telefone: '11999990000', email: '' },
      },
    }

    const resultado = agendamentoReducer(preenchido, {
      type: 'selecionar-servico',
      servicoId: 's1',
    })

    expect(resultado.rascunho).toEqual(preenchido.rascunho)
  })

  it('trocar profissional limpa data e horário', () => {
    const inicial = {
      ...criarEstadoInicial(),
      rascunho: {
        ...criarEstadoInicial().rascunho,
        profissionalId: 'p1',
        data: '2026-09-18',
        horario: '09:00',
      },
    }
    const estado = agendamentoReducer(inicial, {
      type: 'selecionar-profissional',
      profissionalId: 'p2',
    })

    expect(estado.rascunho).toMatchObject({
      profissionalId: 'p2',
      data: null,
      horario: null,
    })
  })

  it('trocar data limpa somente horário', () => {
    const inicial = {
      ...criarEstadoInicial(),
      rascunho: {
        ...criarEstadoInicial().rascunho,
        data: '2026-09-18',
        horario: '09:00',
      },
    }
    const estado = agendamentoReducer(inicial, {
      type: 'selecionar-data',
      data: '2026-09-19',
    })

    expect(estado.rascunho.data).toBe('2026-09-19')
    expect(estado.rascunho.horario).toBeNull()
  })

  it('mantém escolhas ao apenas voltar de etapa', () => {
    const inicial = {
      ...criarEstadoInicial(),
      etapa: 'revisao' as const,
      rascunho: { ...criarEstadoInicial().rascunho, servicoId: 's1' },
    }
    const estado = agendamentoReducer(inicial, {
      type: 'ir-para-etapa',
      etapa: 'servico',
    })

    expect(estado.rascunho.servicoId).toBe('s1')
  })

  it('reinicia o fluxo ao trocar o contexto do estabelecimento', () => {
    const preenchido = {
      etapa: 'revisao' as const,
      rascunho: {
        servicoId: 's1',
        profissionalId: 'p1',
        data: '2026-09-18',
        horario: '10:00',
        cliente: { nome: 'Ana', telefone: '11999990000', email: '' },
      },
    }

    expect(
      agendamentoReducer(preenchido, { type: 'reiniciar' }),
    ).toEqual(criarEstadoInicial())
  })
})

describe('validarDadosCliente', () => {
  it('exige nome e telefone e aceita e-mail vazio', () => {
    expect(
      validarDadosCliente({ nome: '', telefone: '', email: '' }),
    ).toEqual({
      nome: 'Informe seu nome.',
      telefone: 'Informe seu telefone.',
    })
    expect(
      validarDadosCliente({
        nome: 'Ana Souza',
        telefone: '(11) 99999-0000',
        email: '',
      }),
    ).toEqual({})
  })

  it('rejeita e-mail preenchido em formato inválido', () => {
    expect(
      validarDadosCliente({
        nome: 'Ana Souza',
        telefone: '(11) 99999-0000',
        email: 'ana@',
      }),
    ).toEqual({ email: 'Informe um e-mail válido.' })
  })
})
