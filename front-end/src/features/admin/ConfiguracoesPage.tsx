import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import './admin.css'
import './configuracoes.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'
const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
type DadosUnidade = { slug: string; nome: string; descricao: string | null; telefone: string | null; email: string | null; endereco: string | null; cor_primaria: string; cor_destaque: string; fuso_horario: string; antecedencia_cancelamento_minutos: number }
type Horario = { dia_semana: number; fechado: boolean; abre_as: string | null; fecha_as: string | null }

export function ConfiguracoesPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [dados, setDados] = useState<DadosUnidade | null>(null)
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const token = obterToken()
    if (!slug || !token) return
    fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/configuracoes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => ({}))
        if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar as configurações.')
        setDados(corpo.barbearia)
        setHorarios(corpo.horarios)
      })
      .catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar as configurações.'))
  }, [slug])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/configuracoes`)}`} replace />

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug || !dados) return
    setErro(null)
    setMensagem(null)
    setSalvando(true)
    const token = obterToken()
    try {
      const perfilResposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/configuracoes`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...dados, horarios }),
      })
      const perfilCorpo = await perfilResposta.json().catch(() => ({}))
      if (!perfilResposta.ok) throw new Error(perfilCorpo.message ?? 'Não foi possível salvar os dados da unidade.')
      setDados(perfilCorpo.barbearia)
      setHorarios(perfilCorpo.horarios)
      setMensagem('Configurações salvas.')
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível salvar as configurações.')
    } finally {
      setSalvando(false)
    }
  }

  function atualizarPerfil<K extends keyof DadosUnidade>(chave: K, valor: DadosUnidade[K]) {
    setDados((atual) => atual ? { ...atual, [chave]: valor } : atual)
  }

  function atualizarHorario(dia: number, mudanca: Partial<Horario>) {
    setHorarios((atuais) => atuais.map((horario) => horario.dia_semana === dia ? { ...horario, ...mudanca } : horario))
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link className="admin-brand" to={`/admin/${slug}/dashboard`}><span>CR</span> Barbearia</Link><nav aria-label="Navegação administrativa"><Link to={`/admin/${slug}/dashboard`}>Dashboard</Link><Link to={`/admin/${slug}/barbeiros`}>Barbeiros</Link><Link to={`/admin/${slug}/servicos`}>Serviços</Link><Link to={`/admin/${slug}/clientes`}>Clientes</Link><Link className="active" to={`/admin/${slug}/configuracoes`}>Configurações</Link></nav><div className="admin-account"><strong>{usuario.nome}</strong><span>{dados?.nome ?? 'Barbearia'}</span><Link to={`/admin/${slug}/dashboard`}>Voltar ao painel</Link></div></aside>
    <main className="admin-main admin-settings-main">
      <header className="admin-header"><div><p>Unidade</p><h1>Configurações</h1></div><Link className="admin-home-link" to={`/admin/${slug}/dashboard`}>Voltar ao dashboard</Link></header>
      {erro && <section className="admin-state" role="alert">{erro}</section>}
      {mensagem && <section className="admin-feedback" role="status">{mensagem}</section>}
      {!dados ? !erro && <section className="admin-state">Carregando configurações…</section> : <form className="admin-settings-form" onSubmit={(event) => void salvar(event)}>
        <section className="admin-card admin-settings-card"><div className="admin-card-title"><div><p>Perfil público</p><h2>Dados da barbearia</h2></div></div>
          <div className="admin-settings-fields">
            <label>Nome<input required maxLength={255} value={dados.nome} onChange={(event) => atualizarPerfil('nome', event.target.value)} /></label>
            <label>Telefone<input maxLength={30} value={dados.telefone ?? ''} onChange={(event) => atualizarPerfil('telefone', event.target.value)} /></label>
            <label>E-mail<input type="email" maxLength={255} value={dados.email ?? ''} onChange={(event) => atualizarPerfil('email', event.target.value)} /></label>
            <label>Endereço<input maxLength={500} value={dados.endereco ?? ''} onChange={(event) => atualizarPerfil('endereco', event.target.value)} /></label>
            <label className="admin-settings-wide">Descrição<textarea rows={4} maxLength={3000} value={dados.descricao ?? ''} onChange={(event) => atualizarPerfil('descricao', event.target.value)} /></label>
            <label>Cor principal<input type="color" value={dados.cor_primaria} onChange={(event) => atualizarPerfil('cor_primaria', event.target.value)} /></label>
            <label>Cor de destaque<input type="color" value={dados.cor_destaque} onChange={(event) => atualizarPerfil('cor_destaque', event.target.value)} /></label>
            <label>Fuso horário<input required value={dados.fuso_horario} onChange={(event) => atualizarPerfil('fuso_horario', event.target.value)} placeholder="America/Sao_Paulo" /></label>
            <label>Antecedência mínima para cancelamento (minutos)<input required type="number" min={0} max={10080} value={dados.antecedencia_cancelamento_minutos} onChange={(event) => atualizarPerfil('antecedencia_cancelamento_minutos', Number(event.target.value))} /></label>
          </div>
        </section>
        <section className="admin-card admin-settings-card"><div className="admin-card-title"><div><p>Agenda pública</p><h2>Funcionamento semanal</h2></div></div>
          <div className="admin-hours-list">{horarios.map((horario) => <div className="admin-hours-row" key={horario.dia_semana}><strong>{dias[horario.dia_semana]}</strong><label className="admin-hours-closed"><input type="checkbox" checked={horario.fechado} onChange={(event) => atualizarHorario(horario.dia_semana, { fechado: event.target.checked })} /> Fechado</label><label>Abre<input type="time" disabled={horario.fechado} required={!horario.fechado} value={horario.abre_as ?? ''} onChange={(event) => atualizarHorario(horario.dia_semana, { abre_as: event.target.value || null })} /></label><label>Fecha<input type="time" disabled={horario.fechado} required={!horario.fechado} value={horario.fecha_as ?? ''} onChange={(event) => atualizarHorario(horario.dia_semana, { fecha_as: event.target.value || null })} /></label></div>)}</div>
        </section>
        <Button variant="unstyled" className="button button-copper admin-settings-submit" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar configurações'}</Button>
      </form>}
      <p className="admin-settings-limit">Logo, fotos de capa, feriados e horários especiais ainda não estão disponíveis.</p>
    </main>
  </div>
}
