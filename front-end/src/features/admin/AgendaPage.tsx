import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import './admin.css'
import './agenda.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
const statusLabels: Record<string, string> = { pendente: 'Pendente', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado' }
type Agendamento = { id: number; data_hora: string; status: string; nao_compareceu: boolean; cliente?: { nome: string; telefone: string }; barbeiro?: { id: number; nome: string }; servico?: { nome: string; duracao_minutos: number; preco: string } }
type Barbeiro = { id: number; nome: string; ativo?: boolean; servicos?: Array<{ id: number }> }
type Cliente = { id: number; nome: string; telefone: string; email: string | null }
type Servico = { id: number; nome: string; duracao_minutos: number; ativo: boolean }

function hojeLocal() {
  const agora = new Date()
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`
}

function adicionarDias(data: string, quantidade: number) {
  const dia = new Date(`${data}T12:00:00`)
  dia.setDate(dia.getDate() + quantidade)
  return `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}-${String(dia.getDate()).padStart(2, '0')}`
}

export function AgendaPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [inicio, setInicio] = useState(hojeLocal)
  const [fim, setFim] = useState(() => adicionarDias(hojeLocal(), 6))
  const [barbeiroId, setBarbeiroId] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [ultimaPagina, setUltimaPagina] = useState(1)
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [atualizacao, setAtualizacao] = useState(0)
  const [formAberto, setFormAberto] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [servicoId, setServicoId] = useState('')
  const [profissionalId, setProfissionalId] = useState('')
  const [dataManual, setDataManual] = useState(hojeLocal)
  const [horaManual, setHoraManual] = useState('09:00')
  const [statusManual, setStatusManual] = useState('confirmado')
  const [buscaCliente, setBuscaCliente] = useState('')
  const buscaClientesId = useRef(0)

  const carregar = useCallback(async () => {
    if (!slug) return
    const token = obterToken()
    if (!token) return
    const parametros = new URLSearchParams({ data_inicio: inicio, data_fim: fim, page: String(pagina) })
    if (barbeiroId) parametros.set('barbeiro_id', barbeiroId)
    if (statusFiltro) parametros.set('status', statusFiltro)
    if (busca.trim()) parametros.set('busca', busca.trim())
    setErro(null)
    try {
      const [agendaResposta, barbeirosResposta, servicosResposta, clientesResposta] = await Promise.all([
        fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos?${parametros}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/servicos`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/clientes`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [agendaCorpo, barbeirosCorpo, servicosCorpo, clientesCorpo] = await Promise.all([agendaResposta.json().catch(() => ({})), barbeirosResposta.json().catch(() => ({})), servicosResposta.json().catch(() => ({})), clientesResposta.json().catch(() => ({}))])
      if (!agendaResposta.ok) throw new Error(agendaCorpo.message ?? 'Não foi possível carregar a agenda.')
      if (!barbeirosResposta.ok) throw new Error(barbeirosCorpo.message ?? 'Não foi possível carregar os profissionais.')
      if (!servicosResposta.ok || !clientesResposta.ok) throw new Error('Não foi possível carregar clientes e serviços para novos agendamentos.')
      setAgendamentos(agendaCorpo.data ?? [])
      setUltimaPagina(agendaCorpo.meta?.last_page ?? 1)
      setBarbeiros(barbeirosCorpo.data ?? [])
      setServicos((servicosCorpo.data ?? []).filter((servico: Servico) => servico.ativo))
      setClientes(clientesCorpo.data ?? [])
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar a agenda.')
    }
  }, [slug, inicio, fim, barbeiroId, statusFiltro, busca, pagina])

  useEffect(() => { void carregar() }, [carregar, atualizacao])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/agenda`)}`} replace />

  async function executarAcao(item: Agendamento, acao: 'cancelamento' | 'conclusao' | 'nao-comparecimento') {
    if (!slug) return
    if (acao === 'cancelamento' && !window.confirm('Cancelar este agendamento?')) return
    if (acao === 'conclusao' && !window.confirm('Marcar este atendimento como concluído?')) return
    if (acao === 'nao-comparecimento' && !window.confirm('Registrar que o cliente não compareceu?')) return
    const token = obterToken()
    if (!token) { setErro('Sua sessão expirou. Entre novamente para continuar.'); return }
    try {
      const requisicao: RequestInit = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }
      if (acao === 'cancelamento') requisicao.body = JSON.stringify({ motivo: 'Cancelado pelo administrador.' })
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos/${item.id}/${acao}`, requisicao)
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) {
        setErro(corpo.message ?? corpo.errors?.agendamento?.[0] ?? 'Não foi possível atualizar o agendamento.')
        return
      }
      setMensagem(acao === 'conclusao' ? 'Atendimento concluído.' : acao === 'nao-comparecimento' ? 'Não comparecimento registrado.' : 'Agendamento cancelado.')
      setAtualizacao((valor) => valor + 1)
    } catch {
      setErro('Não foi possível conectar à API para atualizar o agendamento.')
    }
  }

  async function buscarClientes(termo: string) {
    const chamada = ++buscaClientesId.current
    setBuscaCliente(termo)
    setClienteId('')
    if (!slug || termo.trim().length < 2) return
    const token = obterToken()
    if (!token) return
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/clientes?busca=${encodeURIComponent(termo.trim())}`, { headers: { Authorization: `Bearer ${token}` } })
      const corpo = await resposta.json().catch(() => ({}))
      if (resposta.ok && chamada === buscaClientesId.current) setClientes(corpo.data ?? [])
    } catch {
      if (chamada === buscaClientesId.current) setErro('Não foi possível pesquisar clientes.')
    }
  }

  async function criarAgendamento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug) return
    const token = obterToken()
    if (!token) { setErro('Sua sessão expirou. Entre novamente para continuar.'); return }
    setErro(null)
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cliente_id: Number(clienteId), servico_id: Number(servicoId), barbeiro_id: Number(profissionalId), data_hora: `${dataManual} ${horaManual}`, status: statusManual }),
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? corpo.errors?.data_hora?.[0] ?? 'Não foi possível criar o agendamento.')
      setMensagem('Agendamento criado e disponibilidade validada.')
      setFormAberto(false)
      setAtualizacao((valor) => valor + 1)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível criar o agendamento.')
    }
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link className="admin-brand" to={`/admin/${slug}/dashboard`}><span>CR</span> Barbearia</Link><nav aria-label="Navegação administrativa"><Link to={`/admin/${slug}/dashboard`}>Dashboard</Link><Link className="active" to={`/admin/${slug}/agenda`}>Agenda</Link><Link to={`/admin/${slug}/barbeiros`}>Barbeiros</Link><Link to={`/admin/${slug}/servicos`}>Serviços</Link><Link to={`/admin/${slug}/clientes`}>Clientes</Link><Link to={`/admin/${slug}/configuracoes`}>Configurações</Link></nav><div className="admin-account"><strong>{usuario.nome}</strong><span>Administração</span><Link to="/">Ir para a home</Link></div></aside>
    <main className="admin-main admin-calendar-main">
      <header className="admin-header"><div><p>Gestão da barbearia</p><h1>Agenda</h1></div><Link className="admin-home-link" to={`/admin/${slug}/dashboard`}>Voltar ao dashboard</Link></header>
      <section className="admin-card admin-calendar-filters" aria-label="Filtros da agenda">
        <label>De<input type="date" value={inicio} onChange={(event) => { setInicio(event.target.value); setPagina(1) }} /></label>
        <label>Até<input type="date" min={inicio} value={fim} onChange={(event) => { setFim(event.target.value); setPagina(1) }} /></label>
        <label>Profissional<select value={barbeiroId} onChange={(event) => { setBarbeiroId(event.target.value); setPagina(1) }}><option value="">Todos</option>{barbeiros.map((barbeiro) => <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>)}</select></label>
        <label>Status<select value={statusFiltro} onChange={(event) => { setStatusFiltro(event.target.value); setPagina(1) }}><option value="">Todos</option>{Object.entries(statusLabels).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}</select></label>
        <label className="admin-calendar-search">Buscar cliente<input value={busca} onChange={(event) => { setBusca(event.target.value); setPagina(1) }} placeholder="Nome, telefone ou e-mail" /></label>
      </section>
      <div className="admin-calendar-create-toggle"><Button variant="unstyled" className="button button-copper" type="button" onClick={() => setFormAberto((aberto) => !aberto)}>{formAberto ? 'Fechar formulário' : 'Novo agendamento manual'}</Button></div>
      {formAberto && <form className="admin-card admin-manual-booking" onSubmit={(event) => void criarAgendamento(event)}>
        <h2>Novo agendamento</h2>
        <label>Buscar cliente<input required minLength={2} value={buscaCliente} onChange={(event) => void buscarClientes(event.target.value)} placeholder="Digite nome, telefone ou e-mail" /></label>
        <label>Cliente<select required value={clienteId} onChange={(event) => setClienteId(event.target.value)}><option value="">Selecione um cliente</option>{clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nome} · {cliente.telefone}</option>)}</select></label>
        <label>Serviço<select required value={servicoId} onChange={(event) => { setServicoId(event.target.value); setProfissionalId('') }}><option value="">Selecione um serviço</option>{servicos.map((servico) => <option key={servico.id} value={servico.id}>{servico.nome} · {servico.duracao_minutos} min</option>)}</select></label>
        <label>Profissional<select required value={profissionalId} onChange={(event) => setProfissionalId(event.target.value)}><option value="">Selecione um profissional</option>{barbeiros.filter((barbeiro) => barbeiro.ativo !== false && (!servicoId || barbeiro.servicos?.some((servico) => String(servico.id) === servicoId))).map((barbeiro) => <option key={barbeiro.id} value={barbeiro.id}>{barbeiro.nome}</option>)}</select></label>
        <label>Data<input required type="date" min={hojeLocal()} value={dataManual} onChange={(event) => setDataManual(event.target.value)} /></label>
        <label>Horário<input required type="time" step={1800} value={horaManual} onChange={(event) => setHoraManual(event.target.value)} /></label>
        <label>Status inicial<select value={statusManual} onChange={(event) => setStatusManual(event.target.value)}><option value="confirmado">Confirmado</option><option value="pendente">Pendente</option></select></label>
        <Button variant="unstyled" className="button button-copper" type="submit">Criar agendamento</Button>
      </form>}
      {erro && <section className="admin-state" role="alert">{erro}</section>}
      {mensagem && <section className="admin-feedback" role="status">{mensagem}</section>}
      <section className="admin-card admin-calendar-card"><div className="admin-card-title"><div><p>Período selecionado</p><h2>{agendamentos.length} agendamentos nesta página</h2></div></div>
        {agendamentos.length === 0 ? <p className="admin-empty">Nenhum agendamento encontrado para esses filtros.</p> : <div className="admin-calendar-table-wrap"><table className="admin-calendar-table"><thead><tr><th>Data e hora</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Status</th><th>Ações</th></tr></thead><tbody>{agendamentos.map((item) => {
          const [data, hora] = item.data_hora.split(' ')
          const dataLabel = new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR')
          const ativo = ['pendente', 'confirmado'].includes(item.status)
          return <tr key={item.id}><td>{dataLabel}<small>{hora}</small></td><td>{item.cliente?.nome}<small>{item.cliente?.telefone}</small></td><td>{item.servico?.nome}<small>{item.servico?.duracao_minutos} min</small></td><td>{item.barbeiro?.nome}</td><td><em className={`status-${item.status}`}>{item.nao_compareceu ? 'Não compareceu' : statusLabels[item.status] ?? item.status}</em></td><td>{ativo && <span className="admin-calendar-actions"><button type="button" onClick={() => void executarAcao(item, 'conclusao')}>Concluir</button><button type="button" onClick={() => void executarAcao(item, 'nao-comparecimento')}>Marcar falta</button><button type="button" onClick={() => void executarAcao(item, 'cancelamento')}>Cancelar</button></span>}</td></tr>
        })}</tbody></table></div>}
        <div className="admin-calendar-pagination"><Button variant="unstyled" type="button" disabled={pagina <= 1} onClick={() => setPagina((atual) => atual - 1)}>Anterior</Button><span>Página {pagina} de {ultimaPagina}</span><Button variant="unstyled" type="button" disabled={pagina >= ultimaPagina} onClick={() => setPagina((atual) => atual + 1)}>Próxima</Button></div>
      </section>
    </main>
  </div>
}
