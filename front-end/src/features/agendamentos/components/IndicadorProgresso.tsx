import type { EtapaAgendamento } from '../types/agendamento'

const etapas = [
  ['servico', 'Serviço'],
  ['profissional', 'Profissional'],
  ['data-horario', 'Data e horário'],
  ['cliente', 'Sua conta'],
  ['revisao', 'Confirmar'],
] as const

interface IndicadorProgressoProps {
  etapaAtual: EtapaAgendamento
}

export function IndicadorProgresso({
  etapaAtual,
}: IndicadorProgressoProps) {
  const confirmacao = etapaAtual === 'confirmacao'
  const indiceAtual = etapas.findIndex(([etapa]) => etapa === etapaAtual)

  return (
    <nav className="booking-progress" aria-label="Progresso do agendamento">
      <p className="booking-progress-mobile">
        {confirmacao
          ? 'Agendamento concluído'
          : `Etapa ${indiceAtual + 1} de ${etapas.length}`}
      </p>
      <ol>
        {etapas.map(([etapa, rotulo], indice) => {
          const atual = etapa === etapaAtual
          const concluida = confirmacao || indice < indiceAtual

          return (
            <li
              key={etapa}
              className={`${atual ? 'is-current' : ''}${concluida ? ' is-complete' : ''}`}
              aria-current={atual ? 'step' : undefined}
            >
              <span>{String(indice + 1).padStart(2, '0')}</span>
              <span>{rotulo}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
