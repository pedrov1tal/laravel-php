import { obterUsuarioAutenticado } from '../../autenticacao/session'
import { TubelightNavbar } from '../../../shared/components/TubelightNavbar'
import { siteNavigationItems } from '../../../shared/navigation/siteNavigation'
import type { Estabelecimento } from '../types/agendamento'

interface AgendamentoHeaderProps {
  estabelecimento: Estabelecimento
  retorno: string
}

export function AgendamentoHeader({
  estabelecimento,
  retorno,
}: AgendamentoHeaderProps) {
  const usuario = obterUsuarioAutenticado()
  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0]

  return (
    <header className="booking-header">
      <a className="booking-brand" href="/" aria-label="Voltar para o início">
        <span aria-hidden="true">{estabelecimento.iniciais}</span>
        <strong>{estabelecimento.nome}</strong>
      </a>
      <TubelightNavbar items={siteNavigationItems} />
      <a className="booking-account" href={`/login?retorno=${encodeURIComponent(retorno)}`}>
        {primeiroNome ? `Olá, ${primeiroNome}` : 'Login'} <span aria-hidden="true">↗</span>
      </a>
    </header>
  )
}
