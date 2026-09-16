import { formatarDuracao, formatarPreco } from '../../../lib/formatters'
import type { ServicoAgendamento } from '../types/agendamento'
import { EstadoFeedback } from './EstadoFeedback'

interface SelecaoServicoProps {
  servicos: ServicoAgendamento[]
  selecionado: string | null
  onSelecionar: (servicoId: string) => void
}

export function SelecaoServico({
  servicos,
  selecionado,
  onSelecionar,
}: SelecaoServicoProps) {
  if (!servicos.length) {
    return (
      <EstadoFeedback
        titulo="Nenhum serviço disponível"
        descricao="Este estabelecimento ainda não cadastrou serviços para agendamento."
      />
    )
  }

  return (
    <div className="booking-option-grid">
      {servicos.map((servico) => {
        const ativo = servico.id === selecionado

        return (
          <button
            className={`booking-option${ativo ? ' is-selected' : ''}`}
            type="button"
            key={servico.id}
            aria-pressed={ativo}
            onClick={() => onSelecionar(servico.id)}
          >
            <span className="booking-option-topline">
              {formatarDuracao(servico.duracaoMinutos)}
            </span>
            <strong>{servico.nome}</strong>
            <span>{servico.descricao}</span>
            <b>{formatarPreco(servico.precoCentavos)}</b>
          </button>
        )
      })}
    </div>
  )
}
