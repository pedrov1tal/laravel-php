import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import { AdminSidebar } from './AdminSidebar'
import { SweetAlertModal } from '../../shared/ui/SweetAlertModal'
import './barbeiros.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

type Servico = { id: number; nome: string }
type JornadaDia = { dia_semana: number; indisponivel: boolean; inicia_as: string; termina_as: string; pausa_inicio: string; pausa_fim: string }
type Ausencia = { id: number; inicio_em: string; fim_em: string; motivo: string | null }
type Atendimento = { id: number; data_hora: string; status: string; cliente: string | null; servico: string | null }
type Barbeiro = { id: number; nome: string; telefone: string | null; email: string | null; ativo: boolean; servicos: Servico[]; jornada: JornadaDia[]; ausencias: Ausencia[]; agendamentos?: Atendimento[] }

function horario(valor?: string | null) { return valor?.slice(0, 5) ?? '' }

export function BarbeirosPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [selecionado, setSelecionado] = useState<Barbeiro | null>(null)
  const [ausenciaParaExcluir, setAusenciaParaExcluir] = useState<Ausencia | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [servicoIds, setServicoIds] = useState<number[]>([])
  const [jornada, setJornada] = useState<JornadaDia[]>([])
  const [inicioAusencia, setInicioAusencia] = useState('')
  const [fimAusencia, setFimAusencia] = useState('')
  const [motivoAusencia, setMotivoAusencia] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [salvandoNovo, setSalvandoNovo] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function carregarBarbeiros() {
    if (!slug) return
    setCarregando(true)
    try {
      const [respostaBarbeiros, respostaServicos] = await Promise.all([
        fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros`, { headers: { Authorization: `Bearer ${obterToken()}` } }),
        fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/servicos`, { headers: { Authorization: `Bearer ${obterToken()}` } }),
      ])
      const [corpoBarbeiros, corpoServicos] = await Promise.all([respostaBarbeiros.json().catch(() => ({})), respostaServicos.json().catch(() => ({}))])
      if (!respostaBarbeiros.ok) throw new Error(corpoBarbeiros.message ?? 'Não foi possível carregar os barbeiros.')
      if (!respostaServicos.ok) throw new Error(corpoServicos.message ?? 'Não foi possível carregar os serviços.')
      setBarbeiros((corpoBarbeiros.data ?? []) as Barbeiro[])
      setServicos((corpoServicos.data ?? []) as Servico[])
      setErro(null)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os barbeiros.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { void carregarBarbeiros() }, [slug])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/barbeiros`)}`} replace />

  async function cadastrarBarbeiro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug) return

    const form = event.currentTarget
    const dados = new FormData(form)
    const servicoIdsNovos = dados.getAll('servico_ids[]').map(Number)
    setSalvandoNovo(true)
    setMensagem(null)
    setErro(null)

    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
        body: JSON.stringify({
          nome: String(dados.get('nome') ?? '').trim(),
          telefone: String(dados.get('telefone') ?? '').trim() || null,
          email: String(dados.get('email') ?? '').trim() || null,
          servico_ids: servicoIdsNovos,
        }),
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) {
        const erroValidacao = Object.values(corpo.errors ?? {}).flat()[0]
        throw new Error(corpo.message ?? erroValidacao ?? 'Não foi possível cadastrar o barbeiro.')
      }

      form.reset()
      setFormAberto(false)
      setMensagem('Barbeiro cadastrado com sucesso.')
      await carregarBarbeiros()
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível cadastrar o barbeiro.')
    } finally {
      setSalvandoNovo(false)
    }
  }

  function fecharCadastro() {
    setFormAberto(false)
    setErro(null)
  }

  async function abrir(barbeiro: Barbeiro) {
    if (!slug) return
    setMensagem(null)
    setAusenciaParaExcluir(null)
    const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros/${barbeiro.id}`, { headers: { Authorization: `Bearer ${obterToken()}` } })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) { setMensagem(corpo.message ?? 'Não foi possível abrir o barbeiro.'); return }
    const perfil = corpo.data as Barbeiro
    setSelecionado(perfil)
    setNome(perfil.nome)
    setTelefone(perfil.telefone ?? '')
    setEmail(perfil.email ?? '')
    setAtivo(perfil.ativo)
    setServicoIds(perfil.servicos.map((item) => item.id))
    setJornada(dias.map((_, dia) => {
      const existente = perfil.jornada.find((item) => item.dia_semana === dia)
      return existente ? { ...existente, indisponivel: Boolean(existente.indisponivel), inicia_as: horario(existente.inicia_as), termina_as: horario(existente.termina_as), pausa_inicio: horario(existente.pausa_inicio), pausa_fim: horario(existente.pausa_fim) } : { dia_semana: dia, indisponivel: true, inicia_as: '', termina_as: '', pausa_inicio: '', pausa_fim: '' }
    }))
  }

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug || !selecionado) return
    const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros/${selecionado.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
      body: JSON.stringify({ nome, telefone: telefone || null, email: email || null, ativo, servico_ids: servicoIds }),
    })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) { setMensagem(corpo.message ?? 'Não foi possível salvar o perfil.'); return }
    setMensagem('Dados do barbeiro atualizados.')
    await abrir(corpo as Barbeiro)
    await carregarBarbeiros()
  }

  async function salvarJornada(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug || !selecionado) return
    const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros/${selecionado.id}/jornada`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
      body: JSON.stringify({ horarios: jornada }),
    })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) { setMensagem(corpo.message ?? Object.values(corpo.errors ?? {}).flat().join(' ') ?? 'Não foi possível salvar a jornada.'); return }
    setMensagem('Jornada de trabalho atualizada.')
    await abrir(corpo as Barbeiro)
  }

  async function registrarAusencia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug || !selecionado) return
    const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros/${selecionado.id}/ausencias`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
      body: JSON.stringify({ inicio_em: inicioAusencia.replace('T', ' '), fim_em: fimAusencia.replace('T', ' '), motivo: motivoAusencia || null }),
    })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) { setMensagem(corpo.message ?? 'Não foi possível registrar a ausência.'); return }
    setMensagem('Ausência registrada.')
    setInicioAusencia(''); setFimAusencia(''); setMotivoAusencia('')
    await abrir(selecionado)
  }

  async function excluirAusencia(ausencia: Ausencia) {
    if (!slug || !selecionado) return
    const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/barbeiros/${selecionado.id}/ausencias/${ausencia.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${obterToken()}` } })
    const corpo = await resposta.json().catch(() => ({}))
    if (!resposta.ok) { setMensagem(corpo.message ?? 'Não foi possível remover a ausência.'); return }
    setAusenciaParaExcluir(null)
    setMensagem('Ausência removida.')
    await abrir(selecionado)
  }

  function atualizarDia(indice: number, campo: keyof JornadaDia, valor: string | boolean) {
    setJornada((diasAtuais) => diasAtuais.map((item, index) => index === indice ? { ...item, [campo]: valor } : item))
  }

  return <div className="admin-shell">
    <AdminSidebar slug={slug ?? ''} active="barbeiros" nomeUsuario={usuario.nome} />
    <main className="admin-barbers-shell">
    <header className="admin-barbers-header"><div><p>Gestão da barbearia</p><h1>Barbeiros</h1><span>Equipe, serviços atendidos, jornada e ausências.</span></div><div><Button variant="unstyled" className="admin-barber-add-toggle" type="button" onClick={() => { if (formAberto) fecharCadastro(); else { setMensagem(null); setErro(null); setFormAberto(true) } }}><Plus size={16} aria-hidden="true" />{formAberto ? 'Fechar cadastro' : 'Adicionar barbeiro'}</Button><Button asChild variant="unstyled"><Link to={`/admin/${slug}/dashboard`}>Voltar ao dashboard</Link></Button><Button asChild variant="unstyled"><Link to="/">Ir para a home</Link></Button></div></header>
    {mensagem && <p className="admin-barbers-feedback" role="status">{mensagem}</p>}{erro && <p className="admin-barbers-error" role="alert">{erro}</p>}
    <SweetAlertModal open={formAberto} title="Adicionar barbeiro" onClose={fecharCadastro}>
      <form className="admin-barber-create" onSubmit={(event) => void cadastrarBarbeiro(event)}>
      <header><div><p>Novo profissional</p><h2>Adicionar barbeiro</h2></div></header>
      {erro && <p className="admin-barbers-error" role="alert">{erro}</p>}
      <div className="admin-barber-create-fields">
        <label>Nome<input name="nome" required maxLength={255} autoComplete="name" /></label>
        <label>Telefone<input name="telefone" type="tel" maxLength={30} autoComplete="tel" /></label>
        <label>E-mail<input name="email" type="email" maxLength={255} autoComplete="email" /></label>
      </div>
      <fieldset className="admin-barber-create-services">
        <legend>Serviços atendidos (opcional)</legend>
        {servicos.length === 0
          ? <p>Nenhum serviço cadastrado. Você poderá associar serviços depois.</p>
          : servicos.map((servico) => <label key={servico.id}><input type="checkbox" name="servico_ids[]" value={servico.id} />{servico.nome}</label>)}
      </fieldset>
      <Button variant="unstyled" className="admin-barber-action" type="submit" disabled={salvandoNovo}>
        {salvandoNovo ? 'Cadastrando…' : 'Cadastrar barbeiro'}
      </Button>
      </form>
    </SweetAlertModal>
    <section className="admin-barbers-layout"><section className="admin-barbers-list"><header><h2>Equipe cadastrada</h2><span>{barbeiros.length} nesta página</span></header>{carregando ? <p>Carregando barbeiros…</p> : barbeiros.length === 0 ? <p>Nenhum barbeiro cadastrado.</p> : <ul>{barbeiros.map((barbeiro) => <li key={barbeiro.id}><button className={selecionado?.id === barbeiro.id ? 'is-selected' : ''} onClick={() => void abrir(barbeiro)} type="button"><span className="admin-barber-avatar">{barbeiro.nome.slice(0, 2).toUpperCase()}</span><span><strong>{barbeiro.nome}</strong><small>{barbeiro.ativo ? 'Ativo' : 'Inativo'} · {barbeiro.servicos.length} serviços</small></span></button></li>)}</ul>}</section>
      {selecionado ? <SweetAlertModal open title="Perfil do barbeiro" onClose={() => setSelecionado(null)}><section className="admin-barber-detail">{mensagem && <p className="admin-barbers-feedback" role="status">{mensagem}</p>}<header><p>Perfil profissional</p><h2>{selecionado.nome}</h2></header>
        <form className="admin-barber-profile-form" onSubmit={(event) => void salvarPerfil(event)}><div className="admin-barber-profile-grid"><label>Nome<input required value={nome} onChange={(event) => setNome(event.target.value)} /></label><label>Telefone<input type="tel" value={telefone} onChange={(event) => setTelefone(event.target.value)} /></label><label>E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="admin-barber-active"><input type="checkbox" checked={ativo} onChange={(event) => setAtivo(event.target.checked)} />Profissional ativo</label></div><fieldset><legend>Serviços atendidos</legend><div className="admin-barber-service-options">{servicos.map((servico) => <label key={servico.id}><input type="checkbox" checked={servicoIds.includes(servico.id)} onChange={(event) => setServicoIds((atual) => event.target.checked ? [...atual, servico.id] : atual.filter((id) => id !== servico.id))} />{servico.nome}</label>)}</div></fieldset><Button variant="unstyled" className="admin-barber-action" type="submit">Salvar perfil</Button></form>
        <form className="admin-barber-schedule-form" onSubmit={(event) => void salvarJornada(event)}><h3>Jornada semanal</h3>{jornada.map((item, indice) => <div className="admin-barber-day" key={item.dia_semana}><label className="admin-barber-day-closed"><input type="checkbox" checked={item.indisponivel} onChange={(event) => atualizarDia(indice, 'indisponivel', event.target.checked)} />{dias[item.dia_semana]}</label>{item.indisponivel ? <span>Folga</span> : <><label>Entrada<input type="time" required value={item.inicia_as} onChange={(event) => atualizarDia(indice, 'inicia_as', event.target.value)} /></label><label>Saída<input type="time" required value={item.termina_as} onChange={(event) => atualizarDia(indice, 'termina_as', event.target.value)} /></label><label>Pausa<input type="time" value={item.pausa_inicio} onChange={(event) => atualizarDia(indice, 'pausa_inicio', event.target.value)} /></label><label>Retorno<input type="time" value={item.pausa_fim} onChange={(event) => atualizarDia(indice, 'pausa_fim', event.target.value)} /></label></>}</div>)}<Button variant="unstyled" className="admin-barber-action" type="submit">Salvar jornada</Button></form>
        <section className="admin-barber-absence"><h3>Folgas, férias e ausências</h3><form onSubmit={(event) => void registrarAusencia(event)}><label>Início<input type="datetime-local" required value={inicioAusencia} onChange={(event) => setInicioAusencia(event.target.value)} /></label><label>Fim<input type="datetime-local" min={inicioAusencia || undefined} required value={fimAusencia} onChange={(event) => setFimAusencia(event.target.value)} /></label><label>Motivo<input maxLength={255} value={motivoAusencia} onChange={(event) => setMotivoAusencia(event.target.value)} /></label><Button variant="unstyled" className="admin-barber-action" type="submit">Registrar ausência</Button></form>{ausenciaParaExcluir && <div className="admin-barber-confirm-remove" role="group" aria-label="Confirmar remoção de ausência"><span>Remover esta ausência?</span><Button variant="unstyled" type="button" onClick={() => void excluirAusencia(ausenciaParaExcluir)}>Confirmar</Button><Button variant="unstyled" type="button" onClick={() => setAusenciaParaExcluir(null)}>Cancelar</Button></div>}{selecionado.ausencias.length ? <ul>{selecionado.ausencias.map((ausencia) => <li key={ausencia.id}><span>{horarioAusencia(ausencia.inicio_em)} — {horarioAusencia(ausencia.fim_em)}{ausencia.motivo ? ` · ${ausencia.motivo}` : ''}</span><Button variant="unstyled" type="button" onClick={() => setAusenciaParaExcluir(ausencia)}>Remover</Button></li>)}</ul> : <p>Nenhuma ausência registrada.</p>}</section>
        <section className="admin-barber-appointments"><h3>Agenda individual recente</h3>{selecionado.agendamentos?.length ? <ul>{selecionado.agendamentos.map((item) => <li key={item.id}><time>{horarioAusencia(item.data_hora)}</time><span>{item.cliente ?? 'Cliente'} · {item.servico ?? 'Serviço'}</span><em>{item.status}</em></li>)}</ul> : <p>Nenhum atendimento no histórico.</p>}</section>
      </section></SweetAlertModal> : <section className="admin-barber-detail admin-barber-placeholder">Selecione um barbeiro para editar dados e horários.</section>}
    </section>
    </main>
  </div>
}

function horarioAusencia(valor: string) { return valor.replace('T', ' ').slice(0, 16) }
