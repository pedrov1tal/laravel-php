import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterToken, obterUsuarioAutenticado } from '../autenticacao/session'
import './servicos.css'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

type Servico = { id: number; nome: string; descricao: string | null; duracao_minutos: number; preco: string; ativo: boolean }
type CamposServico = { nome: string; descricao: string; duracao_minutos: string; preco: string }
const camposVazios: CamposServico = { nome: '', descricao: '', duracao_minutos: '30', preco: '' }

export function ServicosPage() {
  const { slug } = useParams()
  const usuario = obterUsuarioAutenticado()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [campos, setCampos] = useState<CamposServico>(camposVazios)
  const [editando, setEditando] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function carregarServicos() {
    if (!slug) return
    setCarregando(true)
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/servicos`, {
        headers: { Authorization: `Bearer ${obterToken()}` },
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar os serviços.')
      setServicos((corpo.data ?? []) as Servico[])
      setErro(null)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os serviços.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { void carregarServicos() }, [slug])

  if (!usuario) return <Navigate to={`/login?retorno=${encodeURIComponent(`/admin/${slug ?? ''}/servicos`)}`} replace />

  function iniciarEdicao(servico: Servico) {
    setEditando(servico.id)
    setCampos({ nome: servico.nome, descricao: servico.descricao ?? '', duracao_minutos: String(servico.duracao_minutos), preco: String(servico.preco) })
    setMensagem(null)
  }

  function limparFormulario() {
    setEditando(null)
    setCampos(camposVazios)
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!slug) return
    setMensagem(null)
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/servicos${editando ? `/${editando}` : ''}`, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
        body: JSON.stringify({ nome: campos.nome.trim(), descricao: campos.descricao.trim() || null, duracao_minutos: Number(campos.duracao_minutos), preco: Number(campos.preco), ativo: true }),
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível salvar o serviço.')
      limparFormulario()
      setMensagem(editando ? 'Serviço atualizado.' : 'Serviço cadastrado.')
      await carregarServicos()
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível salvar o serviço.')
    }
  }

  async function alterarAtivo(servico: Servico) {
    if (!slug) return
    const ativo = !servico.ativo
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/servicos/${servico.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obterToken()}` },
        body: JSON.stringify({ nome: servico.nome, descricao: servico.descricao, duracao_minutos: servico.duracao_minutos, preco: Number(servico.preco), ativo }),
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível atualizar o serviço.')
      setMensagem(ativo ? 'Serviço reativado.' : 'Serviço desativado; novas reservas não poderão selecioná-lo.')
      await carregarServicos()
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível atualizar o serviço.')
    }
  }

  async function excluir(servico: Servico) {
    if (!slug || !window.confirm(`Excluir o serviço “${servico.nome}”?`)) return
    try {
      const resposta = await fetch(`${apiUrl}/admin/barbearias/${encodeURIComponent(slug)}/servicos/${servico.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${obterToken()}` },
      })
      const corpo = await resposta.json().catch(() => ({}))
      if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível excluir o serviço.')
      setMensagem('Serviço excluído.')
      await carregarServicos()
    } catch (falha) {
      setMensagem(falha instanceof Error ? falha.message : 'Não foi possível excluir o serviço.')
    }
  }

  return <main className="admin-services-shell">
    <header className="admin-services-header"><div><p>Gestão da barbearia</p><h1>Serviços</h1><span>Defina preços e duração usados no agendamento.</span></div><div><Button asChild variant="unstyled"><Link to={`/admin/${slug}/dashboard`}>Voltar ao dashboard</Link></Button><Button asChild variant="unstyled"><Link to="/">Ir para a home</Link></Button></div></header>
    {mensagem && <p className="admin-services-feedback" role="status">{mensagem}</p>}
    {erro && <p className="admin-services-error" role="alert">{erro}</p>}
    <section className="admin-services-layout">
      <form className="admin-services-form" onSubmit={salvar}>
        <p>{editando ? 'Atualizar cadastro' : 'Novo serviço'}</p><h2>{editando ? 'Editar serviço' : 'Cadastrar serviço'}</h2>
        <label>Nome<input value={campos.nome} maxLength={120} required onChange={(event) => setCampos({ ...campos, nome: event.target.value })} /></label>
        <label>Descrição<textarea value={campos.descricao} maxLength={1000} rows={3} onChange={(event) => setCampos({ ...campos, descricao: event.target.value })} /></label>
        <div className="admin-services-form-row"><label>Duração (minutos)<input type="number" min={5} max={480} step={5} value={campos.duracao_minutos} required onChange={(event) => setCampos({ ...campos, duracao_minutos: event.target.value })} /></label><label>Preço (R$)<input type="number" min={0} max={100000} step="0.01" value={campos.preco} required onChange={(event) => setCampos({ ...campos, preco: event.target.value })} /></label></div>
        <div className="admin-services-form-actions"><Button variant="unstyled" className="admin-services-primary" type="submit">{editando ? 'Salvar alterações' : 'Cadastrar serviço'}</Button>{editando && <Button variant="unstyled" className="admin-services-secondary" type="button" onClick={limparFormulario}>Cancelar edição</Button>}</div>
      </form>
      <section className="admin-services-list" aria-label="Serviços cadastrados"><header><div><p>Catálogo</p><h2>Serviços da barbearia</h2></div><span>{servicos.length} itens</span></header>
        {carregando ? <p className="admin-services-empty">Carregando serviços…</p> : servicos.length === 0 ? <p className="admin-services-empty">Nenhum serviço cadastrado.</p> : <ul>{servicos.map((servico) => <li key={servico.id}><div><h3>{servico.nome}{!servico.ativo && <span className="admin-services-inactive">Inativo</span>}</h3><p>{servico.descricao || 'Sem descrição'}</p><strong>{servico.duracao_minutos} min · R$ {Number(servico.preco).toFixed(2).replace('.', ',')}</strong></div><div className="admin-services-item-actions"><Button variant="unstyled" type="button" onClick={() => iniciarEdicao(servico)}>Editar</Button><Button variant="unstyled" type="button" onClick={() => void alterarAtivo(servico)}>{servico.ativo ? 'Desativar' : 'Reativar'}</Button><Button variant="unstyled" type="button" onClick={() => void excluir(servico)}>Excluir</Button></div></li>)}</ul>}
      </section>
    </section>
  </main>
}
