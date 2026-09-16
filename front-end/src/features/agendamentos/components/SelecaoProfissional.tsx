import type { Profissional } from '../types/agendamento'
import { EstadoFeedback } from './EstadoFeedback'

interface SelecaoProfissionalProps {
  profissionais: Profissional[]
  selecionado: string | null
  onSelecionar: (profissionalId: string) => void
}

export function SelecaoProfissional({
  profissionais,
  selecionado,
  onSelecionar,
}: SelecaoProfissionalProps) {
  if (!profissionais.length) {
    return (
      <EstadoFeedback
        titulo="Nenhum profissional disponível para este serviço."
        descricao="Volte e escolha outro serviço para consultar novas opções."
      />
    )
  }

  return (
    <div className="booking-option-grid">
      {profissionais.map((profissional) => {
        const ativo = profissional.id === selecionado

        return (
          <button
            className={`booking-option booking-professional${ativo ? ' is-selected' : ''}`}
            type="button"
            key={profissional.id}
            aria-pressed={ativo}
            onClick={() => onSelecionar(profissional.id)}
          >
            <span className="booking-avatar" aria-hidden="true">
              {profissional.iniciais}
            </span>
            <strong>{profissional.nome}</strong>
            <span>{profissional.especialidade}</span>
          </button>
        )
      })}
    </div>
  )
}
