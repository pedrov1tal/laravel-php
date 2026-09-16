import {
  formatarDataLonga,
  formatarDiaMes,
  formatarDiaSemana,
} from '../../../lib/formatters'
import type { DataDisponivel } from '../types/agendamento'
import { EstadoFeedback } from './EstadoFeedback'

interface SelecaoDataHorarioProps {
  datas: DataDisponivel[]
  dataSelecionada: string | null
  horarioSelecionado: string | null
  onSelecionarData: (data: string) => void
  onSelecionarHorario: (horario: string) => void
}

export function SelecaoDataHorario({
  datas,
  dataSelecionada,
  horarioSelecionado,
  onSelecionarData,
  onSelecionarHorario,
}: SelecaoDataHorarioProps) {
  if (!datas.length) {
    return (
      <EstadoFeedback
        titulo="Nenhuma data disponível no momento."
        descricao="Escolha outro profissional ou tente novamente mais tarde."
      />
    )
  }

  const dataAtiva = datas.find((item) => item.data === dataSelecionada)

  return (
    <div className="booking-schedule">
      <div className="booking-date-strip" aria-label="Datas disponíveis">
        {datas.map((item) => {
          const ativo = item.data === dataSelecionada

          return (
            <button
              type="button"
              key={item.data}
              disabled={!item.disponivel}
              aria-label={`Selecionar ${formatarDataLonga(item.data)}`}
              aria-pressed={ativo}
              onClick={() => onSelecionarData(item.data)}
            >
              <span>{formatarDiaSemana(item.data)}</span>
              <strong>{formatarDiaMes(item.data)}</strong>
            </button>
          )
        })}
      </div>

      {dataAtiva && dataAtiva.horarios.length === 0 && (
        <p className="booking-empty-note">
          Nenhum horário disponível para esta data.
        </p>
      )}

      {dataAtiva && dataAtiva.horarios.length > 0 && (
        <div className="booking-time-grid" aria-label="Horários disponíveis">
          {dataAtiva.horarios.map((item) => (
            <button
              type="button"
              key={item.horario}
              disabled={!item.disponivel}
              aria-pressed={item.horario === horarioSelecionado}
              onClick={() => onSelecionarHorario(item.horario)}
            >
              {item.horario}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
