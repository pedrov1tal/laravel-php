import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TubelightNavbar } from '../../shared/components/TubelightNavbar'
import { siteNavigationItems } from '../../shared/navigation/siteNavigation'
import { encerrarSessao, obterUsuarioAutenticado } from './session'
import './conta.css'

function obterIniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

export function ContaPage() {
  const navigate = useNavigate()
  const usuario = obterUsuarioAutenticado()

  if (!usuario) {
    return <Navigate to="/login?retorno=%2Fconta" replace />
  }

  function sair() {
    encerrarSessao()
    navigate('/', { replace: true })
  }

  return (
    <div className="account-shell">
      <header className="account-header">
        <a className="brand" href="/" aria-label="Nexo Agenda, início">
          <span className="brand-mark">N</span>
          <span>NEXO <small>AGENDA PARA BARBEARIAS</small></span>
        </a>
        <TubelightNavbar items={siteNavigationItems} />
        <Button asChild variant="unstyled">
          <a className="account-back-link" href="/">
            Voltar para o início <span aria-hidden="true">↗</span>
          </a>
        </Button>
      </header>

      <main className="account-main">
        <section className="account-intro" aria-labelledby="account-title">
          <p className="eyebrow"><span /> Área do cliente</p>
          <h1 id="account-title">Sua conta.<br /><em>Seus dados.</em></h1>
          <p>Consulte as informações usadas nos seus agendamentos e acesse rapidamente sua próxima reserva.</p>
        </section>

        <section className="account-card" aria-label="Dados da conta">
          <div className="account-profile">
            <span className="account-avatar" aria-hidden="true">
              {obterIniciais(usuario.nome)}
            </span>
            <div>
              <span>Conta ativa</span>
              <strong>{usuario.nome}</strong>
            </div>
          </div>

          <dl className="account-details">
            <div>
              <dt>E-mail</dt>
              <dd>{usuario.email}</dd>
            </div>
            <div>
              <dt>Telefone</dt>
              <dd>{usuario.telefone}</dd>
            </div>
          </dl>

          <div className="account-actions">
            <Button asChild variant="unstyled">
              <a className="button button-copper" href="/agendar">
                Agendar horário <span aria-hidden="true">↗</span>
              </a>
            </Button>
            <Button
              variant="unstyled"
              className="account-logout"
              type="button"
              onClick={sair}
            >
              Sair da conta
            </Button>
          </div>
        </section>
      </main>

      <footer className="account-footer">
        <span>© 2026 Nexo Agenda</span>
        <span>Seus dados permanecem neste navegador.</span>
      </footer>
    </div>
  )
}
