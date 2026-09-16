import type { UsuarioAutenticado } from '../../autenticacao/session'

interface DadosUsuarioAutenticadoProps {
  usuario: UsuarioAutenticado
  onContinuar: () => void
}

export function DadosUsuarioAutenticado({
  usuario,
  onContinuar,
}: DadosUsuarioAutenticadoProps) {
  return (
    <section className="booking-account" aria-labelledby="booking-account-name">
      <div className="booking-account-heading">
        <span className="booking-avatar" aria-hidden="true">
          {usuario.nome
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte[0])
            .join('')
            .toUpperCase()}
        </span>
        <div>
          <span>Conta usada no agendamento</span>
          <strong id="booking-account-name">{usuario.nome}</strong>
        </div>
      </div>
      <dl>
        <div>
          <dt>Telefone</dt>
          <dd>{usuario.telefone}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>{usuario.email}</dd>
        </div>
      </dl>
      <p>
        A confirmação deste horário ficará vinculada a esta conta.
      </p>
      <div className="booking-actions">
        <button
          className="booking-primary-action"
          type="button"
          onClick={onContinuar}
        >
          Continuar para revisão
        </button>
      </div>
    </section>
  )
}
