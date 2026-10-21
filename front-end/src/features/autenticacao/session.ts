export interface UsuarioAutenticado {
  id: string
  nome: string
  email: string
  telefone: string
}

type NovoUsuario = Omit<UsuarioAutenticado, 'id'> & { senha?: string }

interface SessaoLocal {
  token: string
  usuario: UsuarioAutenticado
  adminSlug: string | null
  cliente: boolean
  possuiPerfilOperacional: boolean
}

const CHAVE_SESSAO = 'nexo:sessao-cliente'
const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

function lerJson<T>(chave: string, fallback: T): T {
  try {
    const valor = localStorage.getItem(chave)
    return valor ? (JSON.parse(valor) as T) : fallback
  } catch {
    return fallback
  }
}

function normalizarEmail(email: string) {
  return email.trim().toLocaleLowerCase('pt-BR')
}

async function requisitar(caminho: string, init: RequestInit) {
  const resposta = await fetch(`${API_URL}${caminho}`, { headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) }, ...init })
  const corpo = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível concluir a solicitação.')
  return corpo
}

export async function cadastrarUsuario(dados: NovoUsuario) {
  await requisitar('/auth/registro', { method: 'POST', body: JSON.stringify({ nome: dados.nome.trim(), email: normalizarEmail(dados.email), telefone: dados.telefone.trim(), senha: dados.senha ?? '' }) })
}

export function autenticarUsuario(email: string, senha = ''): Promise<UsuarioAutenticado> & Partial<UsuarioAutenticado> {
  return (async () => {
  const corpo = await requisitar('/auth/login', { method: 'POST', body: JSON.stringify({ email: normalizarEmail(email), senha }) })
  const usuario: UsuarioAutenticado = { id: String(corpo.usuario.id), nome: corpo.usuario.nome, email: corpo.usuario.email, telefone: '' }
  let adminSlug: string | null = null
  let cliente = false
  let possuiPerfilOperacional = false
  try {
    const sessao = await requisitar('/auth/me', { method: 'GET', headers: { Authorization: `Bearer ${corpo.token}` } })
    const barbearias = (sessao.barbearias ?? []) as Array<{ slug: string; papeis: string[] }>
    adminSlug = barbearias.find((barbearia) => barbearia.papeis.includes('administrador'))?.slug ?? null
    possuiPerfilOperacional = barbearias.some((barbearia) => barbearia.papeis.some((papel) => papel === 'administrador' || papel === 'barbeiro'))
    cliente = Boolean(sessao.cliente) || !possuiPerfilOperacional
  } catch { /* A sessão básica continua válida mesmo se o contexto não puder ser carregado. */ }
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token: corpo.token, usuario, adminSlug, cliente, possuiPerfilOperacional } satisfies SessaoLocal))
  return usuario
  })() as Promise<UsuarioAutenticado> & Partial<UsuarioAutenticado>
}

export function obterUsuarioAutenticado() {
  const sessao = lerJson<UsuarioAutenticado | { usuario: UsuarioAutenticado } | null>(CHAVE_SESSAO, null)
  return sessao && 'usuario' in sessao ? sessao.usuario : sessao
}

export function obterToken() {
  return lerJson<{ token?: string } | null>(CHAVE_SESSAO, null)?.token ?? null
}

export function usuarioAutenticadoEhCliente() {
  const sessao = lerJson<Partial<SessaoLocal> | null>(CHAVE_SESSAO, null)
  if (!sessao) return false
  if (sessao.cliente === true) return true
  if (sessao.possuiPerfilOperacional === true) return false

  return !sessao.adminSlug
}

export function destinoInicialDaSessao() {
  const sessao = lerJson<{ adminSlug?: string } | null>(CHAVE_SESSAO, null)
  return sessao?.adminSlug ? `/admin/${sessao.adminSlug}/dashboard` : '/conta'
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO)
}

export function destinoSeguro(retorno: string | null) {
  return retorno?.startsWith('/') && !retorno.startsWith('//') ? retorno : '/'
}
