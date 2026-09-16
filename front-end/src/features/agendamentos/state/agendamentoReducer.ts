import type {
  DadosCliente,
  EtapaAgendamento,
  RascunhoAgendamento,
} from '../types/agendamento'

export interface EstadoAgendamento {
  etapa: EtapaAgendamento
  rascunho: RascunhoAgendamento
}

export type AcaoAgendamento =
  | { type: 'selecionar-servico'; servicoId: string }
  | { type: 'selecionar-profissional'; profissionalId: string }
  | { type: 'selecionar-data'; data: string }
  | { type: 'selecionar-horario'; horario: string }
  | { type: 'atualizar-cliente'; cliente: DadosCliente }
  | { type: 'ir-para-etapa'; etapa: EtapaAgendamento }
  | { type: 'confirmar' }
  | { type: 'reiniciar' }

export function criarEstadoInicial(): EstadoAgendamento {
  return {
    etapa: 'servico',
    rascunho: {
      servicoId: null,
      profissionalId: null,
      data: null,
      horario: null,
      cliente: { nome: '', telefone: '', email: '' },
    },
  }
}

export function agendamentoReducer(
  estado: EstadoAgendamento,
  acao: AcaoAgendamento,
): EstadoAgendamento {
  switch (acao.type) {
    case 'selecionar-servico':
      if (acao.servicoId === estado.rascunho.servicoId) return estado
      return {
        ...estado,
        rascunho: {
          ...estado.rascunho,
          servicoId: acao.servicoId,
          profissionalId: null,
          data: null,
          horario: null,
        },
      }
    case 'selecionar-profissional':
      if (acao.profissionalId === estado.rascunho.profissionalId) return estado
      return {
        ...estado,
        rascunho: {
          ...estado.rascunho,
          profissionalId: acao.profissionalId,
          data: null,
          horario: null,
        },
      }
    case 'selecionar-data':
      if (acao.data === estado.rascunho.data) return estado
      return {
        ...estado,
        rascunho: {
          ...estado.rascunho,
          data: acao.data,
          horario: null,
        },
      }
    case 'selecionar-horario':
      return {
        ...estado,
        rascunho: { ...estado.rascunho, horario: acao.horario },
      }
    case 'atualizar-cliente':
      return {
        ...estado,
        rascunho: { ...estado.rascunho, cliente: acao.cliente },
      }
    case 'ir-para-etapa':
      return { ...estado, etapa: acao.etapa }
    case 'confirmar':
      return { ...estado, etapa: 'confirmacao' }
    case 'reiniciar':
      return criarEstadoInicial()
  }
}
