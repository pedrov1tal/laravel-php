import type { Estabelecimento } from '../types/agendamento'

interface AgendamentoHeaderProps {
  estabelecimento: Estabelecimento
}

export function AgendamentoHeader({
  estabelecimento,
}: AgendamentoHeaderProps) {
  return (
    <header className="booking-header">
      <a className="booking-brand" href="/" aria-label="Voltar para o início">
        <span aria-hidden="true">{estabelecimento.iniciais}</span>
        <strong>{estabelecimento.nome}</strong>
      </a>
      <a className="booking-back-home" href="/">
        Voltar para o início
      </a>
    </header>
  )
}
