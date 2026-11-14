import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import './clientes.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

type Agendamento = { id: number; data_hora: string; status: string; nao_compareceu: boolean; servico?: { nome: string }; barbeiro?: { nome: string } }
type Cliente = { id: number; nome: string; telefone: string; email: string | null; agendamentos_concluidos: number; cancelamentos: number; faltas: number; ultima_visita: string | null; bloqueado: boolean; observacoes_internas: string | null; agendamentos?: Agendamento[] }

export function ClientesPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [pagina, setPagina] = useState(1)
  const [ultimaPagina, setUltimaPagina] = useState(1)
  const [observacoes, setObservacoes] = useState('')
  const [bloqueado, setBloqueado] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function carregarClientes() {
    if (!slug) return
    setCarregando(true)
    try {
      const parametros = new URLSearchParams({ page: String(pagina) })
      if (termo) parametros.set('busca', termo)
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/clientes?${parametros}`, { headers: { Authorization: `Bearer ${obterToken()}` } })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar os clientes.')
      setClientes((corpo.data ?? []) as Cliente[])
      setUltimaPagina(Number(corpo.meta?.last_page ?? 1))
      setErro(null)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os clientes.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { void carregarClientes() }, [slug, termo, pagina])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/clientes`)}`} replace />

  async function abrirCliente(cliente: Cliente) {
    if (!slug) return
    setMensagem(null)
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/clientes/${cliente.id}`, { headers: { Authorization: `Bearer ${obterToken()}` } })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível abrir o perfil do cliente.')
      setClienteSelecionado(corpo.data as Cliente)
      setObservacoes((corpo.data as Cliente).observacoes_internas ?? '')
      setBloqueado(Boolean((corpo.data as Cliente).bloqueado))
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível abrir o perfil do cliente.')
    }
  }

  function pesquisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPagina(1)
    setTermo(busca.trim())
  }

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug || !clienteSelecionado) return
    const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/clientes/${clienteSelecionado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
      body: JSON.stringify({ observacoes_internas: observacoes, bloqueado }),
    })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) {
      setMensagem(corpo.message ?? 'Não foi possível salvar o perfil.')
      return
    }
    setMensagem('Perfil atualizado para esta barbearia.')
    setClienteSelecionado({ ...clienteSelecionado, observacoes_internas: observacoes, bloqueado })
    await carregarClientes()
  }

  return <main className="admin-clients-shell">
    <header className="admin-clients-header"><div><p>Gestão da barbearia</p><h1>Clientes</h1><span>Consulte visitas e mantenha observações privadas desta unidade.</span></div><div><Button asChild variant="unstyled"><Link to={`/admin/${slug}/dashboard`}>Voltar ao dashboard</Link></Button><Button asChild variant="unstyled"><Link to="/">Ir para a home</Link></Button></div></header>
    {mensagem && <p className="admin-clients-feedback" role="status">{mensagem}</p>}{erro && <p className="admin-clients-error" role="alert">{erro}</p>}
    <section className="admin-clients-layout">
      <section className="admin-clients-list"><header><div><p>Relacionamento</p><h2>Base de clientes</h2></div><span>{clientes.length} nesta página</span></header>
        <form className="admin-clients-search" onSubmit={pesquisar}><label htmlFor="busca-cliente">Pesquisar por nome, telefone ou e-mail</label><div><input id="busca-cliente" value={busca} onChange={(event) => setBusca(event.target.value)} /><Button variant="unstyled" type="submit">Buscar</Button></div></form>
        {carregando ? <p className="admin-clients-empty">Carregando clientes…</p> : clientes.length === 0 ? <p className="admin-clients-empty">Nenhum cliente encontrado nesta barbearia.</p> : <ul>{clientes.map((cliente) => <li key={cliente.id}><button className={clienteSelecionado?.id === cliente.id ? 'is-selected' : ''} type="button" onClick={() => void abrirCliente(cliente)}><span className="admin-clients-avatar">{cliente.nome.slice(0, 2).toUpperCase()}</span><span className="admin-clients-row-info"><strong>{cliente.nome}{cliente.bloqueado && <em>Bloqueado</em>}</strong><small>{cliente.telefone}{cliente.email ? ` · ${cliente.email}` : ''}</small></span><span className="admin-clients-row-visits">{cliente.agendamentos_concluidos} visitas</span></button></li>)}</ul>}
        <footer className="admin-clients-pagination"><Button variant="unstyled" disabled={pagina <= 1} onClick={() => setPagina((valor) => valor - 1)}>Anterior</Button><span>Página {pagina} de {ultimaPagina}</span><Button variant="unstyled" disabled={pagina >= ultimaPagina} onClick={() => setPagina((valor) => valor + 1)}>Próxima</Button></footer>
      </section>
      {clienteSelecionado ? <section className="admin-client-profile"><header><p>Perfil do cliente</p><h2>{clienteSelecionado.nome}</h2><span>{clienteSelecionado.telefone}{clienteSelecionado.email ? ` · ${clienteSelecionado.email}` : ''}</span></header><div className="admin-client-stats"><div><small>Atendimentos concluídos</small><strong>{clienteSelecionado.agendamentos_concluidos}</strong></div><div><small>Cancelamentos</small><strong>{clienteSelecionado.cancelamentos}</strong></div><div><small>Não comparecimentos</small><strong>{clienteSelecionado.faltas}</strong></div><div><small>Última visita</small><strong>{clienteSelecionado.ultima_visita ? new Date(clienteSelecionado.ultima_visita).toLocaleDateString('pt-BR') : '—'}</strong></div></div>
        <form className="admin-client-notes" onSubmit={(event) => void salvarPerfil(event)}><label htmlFor="observacoes">Observações internas<textarea id="observacoes" rows={4} maxLength={5000} value={observacoes} onChange={(event) => setObservacoes(event.target.value)} /></label><label className="admin-client-block"><input type="checkbox" checked={bloqueado} onChange={(event) => setBloqueado(event.target.checked)} />Bloquear novos agendamentos nesta unidade</label><Button variant="unstyled" type="submit">Salvar perfil</Button></form>
        <section className="admin-client-history"><h3>Histórico de agendamentos</h3>{clienteSelecionado.agendamentos?.length ? <ul>{clienteSelecionado.agendamentos.map((agendamento) => <li key={agendamento.id}><time>{new Date(`${agendamento.data_hora.replace(' ', 'T')}:00`).toLocaleString('pt-BR')}</time><span>{agendamento.servico?.nome ?? 'Serviço'} · {agendamento.barbeiro?.nome ?? 'Barbeiro'}</span><em>{agendamento.nao_compareceu ? 'Não compareceu' : agendamento.status}</em></li>)}</ul> : <p>Nenhum agendamento no histórico desta unidade.</p>}</section>
      </section> : <section className="admin-client-profile admin-client-placeholder"><p>Selecione um cliente para consultar as visitas, o histórico e as observações.</p></section>}
    </section>
  </main>
}
