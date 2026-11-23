import { useEffect, useState, type ReactNode } from 'react'
import { CalendarDays, CircleAlert, Home, Scissors, Users, UserPlus, BadgeCheck, Percent, DollarSign } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import { AdminSidebar } from './AdminSidebar'
import './admin.css'
import './dashboard.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

type Painel = {
  barbearia: { nome: string; slug: string }
  data: string
  periodo: 7 | 30 | 90
  indicadores: { agendamentos_hoje: number; pendentes: number; concluidos: number; cancelados: number; faltas: number; faltas_mes: number; confirmados: number; clientes: number; novos_clientes_mes: number; taxa_cancelamento_mes: number; taxa_faltas_mes: number; receita_estimada_mes_centavos: number; receita_estimada_periodo_centavos: number }
  agenda: Array<{ id: number; inicio: string; fim: string; status: string; nao_compareceu: boolean; cliente: { nome: string; telefone: string }; profissional: { nome: string }; servico: { nome: string; preco: string } }>
  profissionais: Array<{ id: number; nome: string; agendamentos_hoje: number; concluidos_hoje: number; proximo_atendimento: string | null; jornada_configurada: boolean; servicos: Array<{ id: number; nome: string }> }>
  analiticos: {
    agendamentos_por_dia: Array<{ data: string; quantidade: number }>
    receita_estimada_por_dia: Array<{ data: string; centavos: number }>
    servicos_mais_realizados: Array<{ nome: string; quantidade: number }>
    desempenho_profissionais: Array<{ id: number; nome: string; concluidos: number; cancelamentos: number; faltas: number }>
    status: Array<{ status: string; quantidade: number }>
    nao_comparecimentos: number
  }
  proximos_agendamentos: Array<{ id: number; data: string; inicio: string; status: string; nao_compareceu: boolean; cliente: { nome: string; telefone: string }; profissional: { nome: string }; servico: { nome: string } }>
  alertas: Array<{ tipo: string; mensagem: string }>
  limites: { financeiro: string }
}

const status: Record<string, string> = { pendente: 'Pendente', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado', nao_compareceu: 'Não compareceu' }

export function DashboardPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [painel, setPainel] = useState<Painel | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [atualizacao, setAtualizacao] = useState(0)
  const [periodo, setPeriodo] = useState<7 | 30 | 90>(7)

  useEffect(() => {
    const token = obterToken()
    setErro(null)
    setPainel(null)
    if (!slug || !token) {
      setErro('Sua sessão expirou. Entre novamente para abrir o dashboard.')
      return
    }
    fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/dashboard?periodo=${periodo}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => ({}))
        if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar o painel.')
        return corpo as Painel
      })
      .then((dados) => { setPainel(dados); setErro(null) })
      .catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar o painel.'))
  }, [slug, atualizacao, periodo])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/dashboard`)}`} replace />

  async function confirmarAgendamento(id: number) {
    if (!slug || !window.confirm('Confirmar este agendamento? A disponibilidade será validada novamente.')) return
    const token = obterToken()
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos/${id}/confirmacao`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? corpo.errors?.agendamento?.[0] ?? 'Não foi possível confirmar o agendamento.')
      setMensagem('Agendamento confirmado.')
      setAtualizacao((valor) => valor + 1)
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível confirmar o agendamento.')
    }
  }

  async function cancelarHorario(id: number) {
    if (!slug || !window.confirm('Deseja cancelar este horário? O agendamento será liberado para uma nova reserva.')) return
    const token = obterToken()
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos/${id}/cancelamento`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ motivo: 'Cancelado pelo administrador.' }),
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível cancelar o horário.')
      setMensagem('Horário cancelado. Ele já está liberado na agenda.')
      setAtualizacao((valor) => valor + 1)
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível cancelar o horário.')
    }
  }

  async function concluirAtendimento(id: number) {
    if (!slug || !window.confirm('Marcar este atendimento como concluído?')) return
    const token = obterToken()
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos/${id}/conclusao`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? corpo.errors?.agendamento?.[0] ?? 'Não foi possível concluir o atendimento.')
      setMensagem('Atendimento concluído.')
      setAtualizacao((valor) => valor + 1)
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível concluir o atendimento.')
    }
  }

  async function registrarFalta(id: number) {
    if (!slug || !window.confirm('Registrar que o cliente não compareceu?')) return
    const token = obterToken()
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos/${id}/nao-comparecimento`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? corpo.errors?.agendamento?.[0] ?? 'Não foi possível registrar a falta.')
      setMensagem('Não comparecimento registrado.')
      setAtualizacao((valor) => valor + 1)
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível registrar a falta.')
    }
  }

  return <div className="admin-shell" id="inicio">
    <AdminSidebar slug={slug ?? ''} active="dashboard" nomeUsuario={usuario.nome} contexto={painel?.barbearia.nome ?? 'Barbearia'} />
    <main className="admin-main" id="conteudo">
      <header className="admin-header"><div><p>Visão geral</p><h1>Dashboard</h1></div><div className="admin-header-actions"><div className="admin-header-meta"><span>{painel?.barbearia.nome}</span><time>{painel ? new Date(`${painel.data}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</time></div><nav className="admin-dashboard-actions" aria-label="Acesso rápido"><Link className="dashboard-agenda-link is-primary" to={`/admin/${slug}/agenda?novo=1`}>Novo agendamento</Link><Link className="dashboard-agenda-link" to={`/admin/${slug}/barbeiros`}>Novo barbeiro</Link><Link className="dashboard-agenda-link" to={`/admin/${slug}/servicos`}>Novo serviço</Link><a className="dashboard-agenda-link" href="#agenda">Ver agenda de hoje</a></nav><Button asChild variant="unstyled"><Link className="admin-home-link" to="/"><Home size={16} /> Ir para a home</Link></Button></div></header>
      {erro && <section className="admin-state" role="alert"><CircleAlert /><span>{erro}</span><Button variant="unstyled" type="button" onClick={() => setAtualizacao((valor) => valor + 1)}>Tentar novamente</Button></section>}
      {mensagem && <section className="admin-feedback" role="status">{mensagem}</section>}
      {!painel && !erro && <section className="admin-state">Carregando dados da operação…</section>}
      {painel && <>
        <section className="admin-metrics" aria-label="Resumo do negócio">
          <Metric icon={<DollarSign />} label="Receita estimada no mês" value={formatarMoeda(painel.indicadores.receita_estimada_mes_centavos)} />
          <Metric icon={<DollarSign />} label={`Receita estimada · ${periodo} dias`} value={formatarMoeda(painel.indicadores.receita_estimada_periodo_centavos)} />
          <Metric icon={<CalendarDays />} label={`Agendamentos · ${periodo} dias`} value={painel.analiticos.agendamentos_por_dia.reduce((total, item) => total + item.quantidade, 0)} />
          <Metric icon={<Scissors />} label="Atendimentos concluídos hoje" value={painel.indicadores.concluidos} />
        </section>
        <section className="admin-secondary-metrics" aria-label="Outros indicadores">
          <Metric icon={<CircleAlert />} label="Aguardando confirmação" value={painel.indicadores.pendentes} />
          <Metric icon={<BadgeCheck />} label="Confirmados hoje" value={painel.indicadores.confirmados} />
          <Metric icon={<Users />} label="Clientes cadastrados" value={painel.indicadores.clientes} />
          <Metric icon={<UserPlus />} label="Novos clientes no mês" value={painel.indicadores.novos_clientes_mes} />
          <Metric icon={<Percent />} label="Cancelamentos no mês" value={`${painel.indicadores.taxa_cancelamento_mes}%`} />
          <Metric icon={<CircleAlert />} label="Taxa de faltas no mês" value={`${painel.indicadores.taxa_faltas_mes}%`} />
        </section>
        <section className="admin-analytics" aria-label="Análises da operação">
          <div className="admin-analytics-heading"><div><p>Visão analítica</p><h2>Operação no período</h2></div><label>Período<select value={periodo} onChange={(event) => setPeriodo(Number(event.target.value) as 7 | 30 | 90)}><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option></select></label></div>
          <div className="admin-analytics-grid">
            <article className="admin-card admin-chart-card"><div className="admin-card-title"><div><p>Volume diário</p><h2>Agendamentos por dia</h2></div></div>
              <div className={`admin-bar-chart${periodo === 90 ? ' is-long' : periodo === 30 ? ' is-month' : ''}`} role="img" aria-label={`Agendamentos por dia nos últimos ${periodo} dias`}>
                {painel.analiticos.agendamentos_por_dia.map((item) => <div className="admin-bar-column" key={item.data} title={`${new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR')}: ${item.quantidade}`}><strong>{item.quantidade}</strong><span className="admin-bar-track"><i style={{ height: `${Math.max(4, item.quantidade / Math.max(1, ...painel.analiticos.agendamentos_por_dia.map((dia) => dia.quantidade)) * 100)}%` }} /></span><small>{new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: periodo === 7 ? '2-digit' : undefined })}</small></div>)}
              </div>
              {painel.analiticos.agendamentos_por_dia.every((item) => item.quantidade === 0) && <Empty text="Sem agendamentos neste período. Os indicadores serão preenchidos conforme as reservas forem registradas." />}
              <p className="admin-chart-caption">Valores estimados pelo preço atual dos serviços concluídos. Pagamentos, custos e lucro líquido ainda não são registrados.</p>
            </article>
            <article className="admin-card admin-chart-card"><div className="admin-card-title"><div><p>Serviços concluídos</p><h2>Receita estimada por dia</h2></div></div>
              <div className={`admin-bar-chart admin-revenue-chart${periodo === 90 ? ' is-long' : periodo === 30 ? ' is-month' : ''}`} role="img" aria-label={`Receita estimada por dia nos últimos ${periodo} dias`}>
                {painel.analiticos.receita_estimada_por_dia.map((item) => <div className="admin-bar-column" key={item.data} title={`${new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR')}: ${formatarMoeda(item.centavos)}`}><strong>{formatarMoedaCompacta(item.centavos)}</strong><span className="admin-bar-track"><i style={{ height: `${Math.max(4, item.centavos / Math.max(1, ...painel.analiticos.receita_estimada_por_dia.map((dia) => dia.centavos)) * 100)}%` }} /></span><small>{new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: periodo === 7 ? '2-digit' : undefined })}</small></div>)}
              </div>
              {painel.analiticos.receita_estimada_por_dia.every((item) => item.centavos === 0) && <Empty text="Nenhum serviço concluído neste período." />}
            </article>
            <article className="admin-card admin-chart-card"><div className="admin-card-title"><div><p>Serviços concluídos</p><h2>Mais realizados</h2></div></div>
              {painel.analiticos.servicos_mais_realizados.length === 0 ? <Empty text="Nenhum atendimento concluído neste período." /> : <RankBars items={painel.analiticos.servicos_mais_realizados.map((item) => ({ label: item.nome, value: item.quantidade }))} />}
            </article>
            <article className="admin-card admin-chart-card"><div className="admin-card-title"><div><p>Equipe</p><h2>Desempenho por barbeiro</h2></div></div>
              {painel.analiticos.desempenho_profissionais.length === 0 ? <Empty text="Nenhum profissional ativo." /> : <ul className="admin-performance-list">{painel.analiticos.desempenho_profissionais.map((item) => <li key={item.id}><strong>{item.nome}</strong><span>{item.concluidos} concluídos · {item.cancelamentos} cancelamentos · {item.faltas} faltas</span></li>)}</ul>}
            </article>
            <article className="admin-card admin-chart-card"><div className="admin-card-title"><div><p>Atendimentos no período</p><h2>Status</h2></div></div>
              <RankBars items={painel.analiticos.status.map((item) => ({ label: status[item.status] ?? item.status, value: item.quantidade }))} />
            </article>
          </div>
        </section>
        <section className="admin-grid">
          <article className="admin-card admin-agenda" id="agenda"><div className="admin-card-title"><div><p>Operação de hoje</p><h2>Agenda do dia</h2></div><span>{painel.agenda.length} itens</span></div>
            {painel.agenda.length === 0 ? <Empty text="Nenhum agendamento para hoje." /> : <ol className="admin-agenda-list">{painel.agenda.map((item) => <li key={item.id}><time>{item.inicio}<small>{item.fim}</small></time><div><strong>{item.cliente.nome}</strong><span>{item.servico.nome} · {item.profissional.nome}</span></div><div className="admin-agenda-actions"><em className={`status-${item.status}`}>{item.nao_compareceu ? 'Não compareceu' : status[item.status] ?? item.status}</em>{['pendente', 'confirmado'].includes(item.status) && <>{item.status === 'pendente' && <Button variant="unstyled" className="admin-cancel-button" type="button" onClick={() => void confirmarAgendamento(item.id)}>Confirmar</Button>}<Button variant="unstyled" className="admin-cancel-button" type="button" onClick={() => void concluirAtendimento(item.id)}>Concluir</Button><Button variant="unstyled" className="admin-cancel-button" type="button" onClick={() => void registrarFalta(item.id)}>Marcar falta</Button><Button variant="unstyled" className="admin-cancel-button" type="button" onClick={() => void cancelarHorario(item.id)}>Cancelar horário</Button></>}</div></li>)}</ol>}
          </article>
          <article className="admin-card" id="profissionais"><div className="admin-card-title"><div><p>Equipe</p><h2>Profissionais</h2></div></div>
            {painel.profissionais.length === 0 ? <Empty text="Nenhum profissional ativo." /> : <ul className="admin-team">{painel.profissionais.map((profissional) => <li key={profissional.id}><span className="avatar">{profissional.nome.slice(0, 2).toUpperCase()}</span><div><strong>{profissional.nome}</strong><small>{profissional.jornada_configurada ? `${profissional.agendamentos_hoje} agendamentos · próximo: ${profissional.proximo_atendimento ?? 'sem próximos'}` : 'Jornada não configurada'}</small></div><b>{profissional.concluidos_hoje} concluídos</b></li>)}</ul>}
          </article>
        </section>
        <section className="admin-card admin-upcoming"><div className="admin-card-title"><div><p>Todos os status · hoje e próximos 7 dias</p><h2>Agenda completa</h2></div><Link to={`/admin/${slug}/agenda`}>Ver todos os horários</Link></div>
          {painel.proximos_agendamentos.length === 0 ? <Empty text="Nenhum agendamento nos próximos sete dias." /> : <ol className="admin-upcoming-list">{painel.proximos_agendamentos.map((item) => <li key={item.id}><time>{new Date(`${item.data}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}<strong>{item.inicio}</strong></time><div><strong>{item.cliente.nome}</strong><span>{item.servico.nome} · {item.profissional.nome}</span></div><div className="admin-upcoming-actions"><em className={`status-${item.nao_compareceu ? 'nao_compareceu' : item.status}`}>{item.nao_compareceu ? 'Não compareceu' : status[item.status] ?? item.status}</em>{item.status === 'pendente' && <Button variant="unstyled" className="admin-cancel-button" type="button" onClick={() => void confirmarAgendamento(item.id)}>Confirmar</Button>}{['pendente', 'confirmado'].includes(item.status) && <Button variant="unstyled" className="admin-cancel-button" type="button" onClick={() => void cancelarHorario(item.id)}>Cancelar</Button>}</div></li>)}</ol>}
        </section>
        <section className="admin-grid admin-bottom">
          <article className="admin-card"><div className="admin-card-title"><div><p>Atenção</p><h2>Pendências reais</h2></div></div>{painel.alertas.length ? <ul className="admin-alerts">{painel.alertas.map((alerta, index) => <li key={index}><CircleAlert />{alerta.mensagem}</li>)}</ul> : <Empty text="Nenhuma pendência de configuração encontrada." />}</article>
          <article className="admin-card"><div className="admin-card-title"><div><p>Serviços concluídos</p><h2>Como ler os valores</h2></div></div><p className="admin-note">{painel.limites.financeiro}</p></article>
        </section>
      </>}
    </main>
  </div>
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) { return <article className="admin-metric"><span>{icon}</span><small>{label}</small><strong>{value}</strong></article> }
function formatarMoeda(centavos: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100) }
function formatarMoedaCompacta(centavos: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 }).format(centavos / 100) }
function RankBars({ items }: { items: Array<{ label: string; value: number }> }) {
  const maximo = Math.max(1, ...items.map((item) => item.value))
  return <ul className="admin-rank-bars">{items.map((item) => <li key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><span className="admin-rank-track"><i style={{ width: `${item.value / maximo * 100}%` }} /></span></li>)}</ul>
}
function Empty({ text }: { text: string }) { return <p className="admin-empty">{text}</p> }
