import { formatarDataLonga } from '../../../lib/formatters'
import type {
  Estabelecimento,
  Profissional,
  ServicoAgendamento,
} from '../types/agendamento'

interface ConfirmacaoAgendamentoProps {
  estabelecimento: Estabelecimento
  servico: ServicoAgendamento
  profissional: Profissional
  data: string
  horario: string
}

export function ConfirmacaoAgendamento({
  estabelecimento,
  servico,
  profissional,
  data,
  horario,
}: ConfirmacaoAgendamentoProps) {
  return (
    <section className="booking-confirmation" role="status">
      <span className="booking-confirmation-mark" aria-hidden="true">
        ✓
      </span>
      <p className="booking-kicker">Agendamento confirmado</p>
      <h1>Seu horário está marcado.</h1>
      <p>
        {formatarDataLonga(data)}, às <strong>{horario}</strong>
      </p>
      <dl>
        <div>
          <dt>Estabelecimento</dt>
          <dd>{estabelecimento.nome}</dd>
        </div>
        <div>
          <dt>Serviço</dt>
          <dd>{servico.nome}</dd>
        </div>
        <div>
          <dt>Profissional</dt>
          <dd>{profissional.nome}</dd>
        </div>
      </dl>
      <a className="booking-primary-action" href="/">
        Voltar para o início
      </a>
    </section>
  )
}
