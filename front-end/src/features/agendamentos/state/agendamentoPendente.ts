import type { EstadoAgendamento } from './agendamentoReducer'

const CHAVE_AGENDAMENTO_PENDENTE = 'nexo:agendamento-pendente'
const ETAPAS = new Set([
  'servico',
  'profissional',
  'data-horario',
  'cliente',
  'revisao',
  'confirmacao',
])

export function salvarAgendamentoPendente(estado: EstadoAgendamento) {
  sessionStorage.setItem(CHAVE_AGENDAMENTO_PENDENTE, JSON.stringify(estado))
}

export function consumirAgendamentoPendente(): EstadoAgendamento | null {
  const valor = sessionStorage.getItem(CHAVE_AGENDAMENTO_PENDENTE)
  sessionStorage.removeItem(CHAVE_AGENDAMENTO_PENDENTE)
  if (!valor) return null

  try {
    const estado = JSON.parse(valor) as EstadoAgendamento
    if (
      !estado ||
      !ETAPAS.has(estado.etapa) ||
      !estado.rascunho ||
      typeof estado.rascunho.cliente !== 'object'
    ) {
      return null
    }
    return estado
  } catch {
    return null
  }
}
