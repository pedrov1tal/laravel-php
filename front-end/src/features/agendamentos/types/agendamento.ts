export type EtapaAgendamento =
  | 'servico'
  | 'profissional'
  | 'data-horario'
  | 'cliente'
  | 'revisao'
  | 'confirmacao'

export interface Estabelecimento {
  id: string
  slug: string
  nome: string
  iniciais: string
  endereco: string
  telefone: string
}

export interface ServicoAgendamento {
  id: string
  nome: string
  descricao: string
  duracaoMinutos: number
  precoCentavos: number
}

export interface Profissional {
  id: string
  nome: string
  especialidade: string
  iniciais: string
  servicoIds: string[]
}

export interface HorarioDisponivel {
  horario: string
  disponivel: boolean
}

export interface DataDisponivel {
  data: string
  disponivel: boolean
  horarios: HorarioDisponivel[]
}

export interface DadosCliente {
  nome: string
  telefone: string
  email: string
}

export interface ContextoAgendamento {
  estabelecimento: Estabelecimento
  servicos: ServicoAgendamento[]
  profissionais: Profissional[]
  agendaPorProfissional: Record<string, DataDisponivel[]>
}

export interface RascunhoAgendamento {
  servicoId: string | null
  profissionalId: string | null
  data: string | null
  horario: string | null
  cliente: DadosCliente
}
