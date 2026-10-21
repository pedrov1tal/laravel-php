import { useEffect, useState, type ReactNode } from 'react'
import { CalendarDays, CircleAlert, Menu, Scissors, Users, X } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { encerrarSessao, obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import './admin.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

type Painel = {
  barbearia: { nome: string; slug: string }
  data: string
  indicadores: { agendamentos_hoje: number; pendentes: number; concluidos: number; cancelados: number }
  agenda: Array<{ id: number; inicio: string; fim: string; status: string; cliente: { nome: string; telefone: string }; profissional: { nome: string }; servico: { nome: string; preco: string } }>
  profissionais: Array<{ id: number; nome: string; agendamentos_hoje: number; concluidos_hoje: number; proximo_atendimento: string | null; jornada_configurada: boolean }>
  alertas: Array<{ tipo: string; mensagem: string }>
  limites: { financeiro: string }
}

const menu = ['Dashboard', 'Agenda', 'Agendamentos', 'Profissionais', 'Clientes', 'Serviços', 'Horários', 'Relatórios', 'Configurações']
const status: Record<string, string> = { pendente: 'Pendente', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' }

export function DashboardPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [painel, setPainel] = useState<Painel | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [menuAberto, setMenuAberto] = useState(false)

  useEffect(() => {
    const token = obterToken()
    if (!slug || !token) return
    fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => ({}))
        if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar o painel.')
        return corpo as Painel
      })
      .then(setPainel)
      .catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar o painel.'))
  }, [slug])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/dashboard`)}`} replace />

  return <div className="admin-shell">
    <header className="admin-mobile-header">
      <a className="admin-mobile-brand" href="/" aria-label="Corte Rápido, início"><span>CR</span><strong>Painel</strong></a>
      <div className="admin-mobile-context"><strong>{painel?.barbearia.nome ?? 'Corte Rápido'}</strong><span>Administração</span></div>
      <Button variant="unstyled" className="admin-menu-button" type="button" aria-controls="admin-navigation" aria-expanded={menuAberto} aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuAberto((aberto) => !aberto)}>
        {menuAberto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
    </header>
    {menuAberto && <Button variant="unstyled" className="admin-mobile-backdrop" type="button" aria-label="Fechar menu" onClick={() => setMenuAberto(false)} />}
    <aside className={`admin-sidebar${menuAberto ? ' is-open' : ''}`} id="admin-navigation">
      <a className="admin-brand" href="/"><span>CR</span> Corte Rápido</a>
      <nav aria-label="Navegação administrativa">{menu.map((item) => <a className={item === 'Dashboard' ? 'active' : ''} href={item === 'Dashboard' ? `/admin/${slug}/dashboard` : '#conteudo'} key={item} onClick={() => setMenuAberto(false)}>{item}</a>)}</nav>
      <div className="admin-account"><strong>{usuario.nome}</strong><span>{painel?.barbearia.nome ?? 'Carregando barbearia…'}</span><Button variant="unstyled" type="button" onClick={() => { encerrarSessao(); window.location.assign('/') }}>Sair</Button></div>
    </aside>
    <main className="admin-main" id="conteudo">
      <header className="admin-header"><div><p>Visão geral</p><h1>Dashboard</h1></div><div className="admin-header-meta"><span>{painel?.barbearia.nome}</span><time>{painel ? new Date(`${painel.data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</time></div></header>
      {erro && <section className="admin-state" role="alert"><CircleAlert />{erro}</section>}
      {!painel && !erro && <section className="admin-state">Carregando dados da operação…</section>}
      {painel && <>
        <section className="admin-metrics" aria-label="Indicadores do dia">
          <Metric icon={<CalendarDays />} label="Agendamentos hoje" value={painel.indicadores.agendamentos_hoje} />
          <Metric icon={<CircleAlert />} label="Aguardando confirmação" value={painel.indicadores.pendentes} />
          <Metric icon={<Scissors />} label="Atendimentos concluídos" value={painel.indicadores.concluidos} />
          <Metric icon={<Users />} label="Cancelamentos" value={painel.indicadores.cancelados} />
        </section>
        <section className="admin-grid">
          <article className="admin-card admin-agenda"><div className="admin-card-title"><div><p>Operação de hoje</p><h2>Agenda</h2></div><span>{painel.agenda.length} itens</span></div>
            {painel.agenda.length === 0 ? <Empty text="Nenhum agendamento para hoje." /> : <ol className="admin-agenda-list">{painel.agenda.map((item) => <li key={item.id}><time>{item.inicio}<small>{item.fim}</small></time><div><strong>{item.cliente.nome}</strong><span>{item.servico.nome} · {item.profissional.nome}</span></div><em className={`status-${item.status}`}>{status[item.status] ?? item.status}</em></li>)}</ol>}
          </article>
          <article className="admin-card"><div className="admin-card-title"><div><p>Equipe</p><h2>Profissionais</h2></div></div>
            {painel.profissionais.length === 0 ? <Empty text="Nenhum profissional ativo." /> : <ul className="admin-team">{painel.profissionais.map((profissional) => <li key={profissional.id}><span className="avatar">{profissional.nome.slice(0, 2).toUpperCase()}</span><div><strong>{profissional.nome}</strong><small>{profissional.jornada_configurada ? `${profissional.agendamentos_hoje} agendamentos · próximo: ${profissional.proximo_atendimento ?? 'sem próximos'}` : 'Jornada não configurada'}</small></div><b>{profissional.concluidos_hoje} concluídos</b></li>)}</ul>}
          </article>
        </section>
        <section className="admin-grid admin-bottom">
          <article className="admin-card"><div className="admin-card-title"><div><p>Atenção</p><h2>Pendências reais</h2></div></div>{painel.alertas.length ? <ul className="admin-alerts">{painel.alertas.map((alerta, index) => <li key={index}><CircleAlert />{alerta.mensagem}</li>)}</ul> : <Empty text="Nenhuma pendência de configuração encontrada." />}</article>
          <article className="admin-card"><div className="admin-card-title"><div><p>Financeiro</p><h2>Informações disponíveis</h2></div></div><p className="admin-note">{painel.limites.financeiro}</p></article>
        </section>
      </>}
    </main>
  </div>
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) { return <article className="admin-metric"><span>{icon}</span><small>{label}</small><strong>{value}</strong></article> }
function Empty({ text }: { text: string }) { return <p className="admin-empty">{text}</p> }
