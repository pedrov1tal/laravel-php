import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import { AdminSidebar } from './AdminSidebar'
import { SweetAlertModal } from '../../shared/ui/SweetAlertModal'
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
  const [modalAberto, setModalAberto] = useState(false)
  const dadosSalvos = useRef<DadosUnidade | null>(null)
  const horariosSalvos = useRef<Horario[]>([])

  useEffect(() => {
    const token = obterToken()
    if (!slug || !token) return
    fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/configuracoes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (resposta) => {
        const corpo = await resposta.json().catch(() => ({}))
        if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar as configurações.')
        dadosSalvos.current = corpo.barbearia
        horariosSalvos.current = corpo.horarios
        setDados(corpo.barbearia)
        setHorarios(corpo.horarios)
      })
      .catch((falha: unknown) => setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar as configurações.'))
  }, [slug])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/configuracoes`)}`} replace />

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug || !dados || salvando) return
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
      dadosSalvos.current = perfilCorpo.barbearia
      horariosSalvos.current = perfilCorpo.horarios
      setDados(perfilCorpo.barbearia)
      setHorarios(perfilCorpo.horarios)
      setMensagem('Configurações salvas.')
      setModalAberto(false)
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

  function fecharModal() {
    setModalAberto(false)
    if (dadosSalvos.current) setDados({ ...dadosSalvos.current })
    setHorarios(horariosSalvos.current.map((horario) => ({ ...horario })))
    setErro(null)
  }

  return <div className="admin-shell">
    <AdminSidebar slug={slug ?? ''} active="configuracoes" nomeUsuario={usuario.nome} contexto={dados?.nome ?? 'Barbearia'} />
    <main className="admin-main admin-settings-main">
      <header className="admin-header"><div><p>Unidade</p><h1>Configurações</h1></div><div className="admin-header-actions"><Button variant="unstyled" className="admin-home-link" type="button" disabled={!dados} onClick={() => setModalAberto(true)}>Editar configurações</Button><Link className="admin-home-link" to={`/admin/${slug}/dashboard`}>Voltar ao dashboard</Link></div></header>
      {erro && <section className="admin-state" role="alert">{erro}</section>}
      {mensagem && <section className="admin-feedback" role="status">{mensagem}</section>}
      {!dados ? !erro && <section className="admin-state">Carregando configurações…</section> : <section className="admin-card admin-settings-summary">
        <div className="admin-card-title"><div><p>Perfil da unidade</p><h2>{dados.nome}</h2></div></div>
        <dl>
          <div><dt>Telefone</dt><dd>{dados.telefone || 'Não informado'}</dd></div>
          <div><dt>E-mail</dt><dd>{dados.email || 'Não informado'}</dd></div>
          <div><dt>Endereço</dt><dd>{dados.endereco || 'Não informado'}</dd></div>
          <div><dt>Fuso horário</dt><dd>{dados.fuso_horario}</dd></div>
          <div><dt>Funcionamento</dt><dd>{horarios.filter((horario) => !horario.fechado).length} dias por semana</dd></div>
        </dl>
        <p className="admin-settings-limit">Logo, fotos de capa, feriados e horários especiais ainda não estão disponíveis.</p>
      </section>}
      <SweetAlertModal open={modalAberto} title="Editar configurações" onClose={fecharModal} width={860}>
      {dados && <form className="admin-settings-form" onSubmit={(event) => void salvar(event)}>
        {erro && <section className="admin-state" role="alert">{erro}</section>}
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
        <div className="admin-settings-modal-actions">
          <Button variant="unstyled" className="admin-settings-cancel" type="button" onClick={fecharModal} disabled={salvando}>Cancelar</Button>
          <Button variant="unstyled" className="button button-copper admin-settings-submit" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar configurações'}</Button>
        </div>
      </form>}
      </SweetAlertModal>
    </main>
  </div>
}
