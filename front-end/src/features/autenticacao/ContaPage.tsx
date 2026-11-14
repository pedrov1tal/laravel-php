import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TubelightNavbar } from '../../shared/components/TubelightNavbar'
import { clientSiteNavigationItems, siteNavigationItems } from '../../shared/navigation/siteNavigation'
import { encerrarSessao, obterToken, obterUsuarioAutenticado, usuarioAutenticadoEhCliente } from './session'
import './conta.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
type AgendamentoConta = {
  id: number
  data_hora: string
  status: string
  barbearia?: { nome: string; slug: string }
  servico?: { nome: string }
  barbeiro?: { nome: string }
}

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
  const navigationItems = usuarioAutenticadoEhCliente() ? clientSiteNavigationItems : siteNavigationItems
  const [agendamentos, setAgendamentos] = useState<AgendamentoConta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    if (!usuarioAutenticadoEhCliente()) {
      setCarregando(false)
      return
    }
    const token = obterToken()
    if (!token) {
      setErro('Sua sessão expirou. Entre novamente para consultar seus agendamentos.')
      setCarregando(false)
      return
    }
    fetch(`${apiUrl}/cliente/agendamentos`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => ({}))
        if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar seus agendamentos.')
        setAgendamentos(corpo.data ?? [])
      })
      .catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar seus agendamentos.'))
      .finally(() => setCarregando(false))
  }, [])

  if (!usuario) {
    return <Navigate to="/login?retorno=%2Fconta" replace />
  }

  function sair() {
    encerrarSessao()
    navigate('/', { replace: true })
  }

  async function cancelarAgendamento(id: number) {
    const token = obterToken()
    if (!token || !window.confirm('Deseja cancelar este agendamento?')) return
    setMensagem(null)
    try {
      const resposta = await fetch(`${apiUrl}/cliente/agendamentos/${id}/cancelamento`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? corpo.errors?.agendamento?.[0] ?? 'Não foi possível cancelar o agendamento.')
      setAgendamentos((lista) => lista.map((item) => item.id === id ? { ...item, status: corpo.status ?? 'cancelado' } : item))
      setMensagem('Agendamento cancelado.')
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível cancelar o agendamento.')
    }
  }

  return (
    <div className="account-shell">
      <header className="account-header">
        <a className="brand" href="/" aria-label="Nexo Agenda, início">
          <span className="brand-mark">N</span>
          <span>NEXO <small>AGENDA PARA BARBEARIAS</small></span>
        </a>
        <TubelightNavbar items={navigationItems} />
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
              <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
              Sair da conta
            </Button>
          </div>
        </section>

        {usuarioAutenticadoEhCliente() && <section className="account-bookings" aria-labelledby="account-bookings-title">
          <div className="account-bookings-heading"><div><span>Seu histórico</span><h2 id="account-bookings-title">Agendamentos</h2></div><a href="/agendar">Novo horário</a></div>
          {mensagem && <p className="account-booking-message" role="status">{mensagem}</p>}
          {erro && <p className="account-booking-message" role="alert">{erro}</p>}
          {carregando ? <p className="account-bookings-empty">Carregando seus agendamentos…</p> : agendamentos.length === 0 ? <p className="account-bookings-empty">Você ainda não tem agendamentos nesta conta.</p> : <ul className="account-bookings-list">{agendamentos.map((item) => {
            const [data, hora] = item.data_hora.split(' ')
            const dataFormatada = new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
            const ativo = ['pendente', 'confirmado'].includes(item.status)
            return <li key={item.id}>
              <div className="account-booking-info"><strong>{item.barbearia?.nome ?? 'Barbearia'}</strong><span>{item.servico?.nome ?? 'Serviço'} · {item.barbeiro?.nome ?? 'Profissional'}</span><time>{dataFormatada} às {hora}</time></div>
              <div className="account-booking-actions"><span className={`account-booking-status status-${item.status}`}>{item.status}</span>{item.barbearia?.slug && <a href={`/agendar?estabelecimento=${encodeURIComponent(item.barbearia.slug)}`}>Agendar novamente</a>}{ativo && <Button variant="unstyled" className="account-cancel-booking" type="button" onClick={() => void cancelarAgendamento(item.id)}>Cancelar</Button>}</div>
            </li>
          })}</ul>}
        </section>}
      </main>

      <footer className="account-footer">
        <span>© 2026 Nexo Agenda</span>
        <span>Seus dados permanecem neste navegador.</span>
      </footer>
    </div>
  )
}
