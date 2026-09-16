export interface UsuarioAutenticado {
  id: string
  nome: string
  email: string
  telefone: string
}

type NovoUsuario = Omit<UsuarioAutenticado, 'id'>

const CHAVE_PERFIS = 'nexo:perfis-clientes'
const CHAVE_SESSAO = 'nexo:sessao-cliente'

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

function listarPerfis() {
  return lerJson<Record<string, UsuarioAutenticado>>(CHAVE_PERFIS, {})
}

export function cadastrarUsuario(dados: NovoUsuario) {
  const email = normalizarEmail(dados.email)
  const usuario: UsuarioAutenticado = {
    id: `cliente-${Date.now()}`,
    nome: dados.nome.trim(),
    email,
    telefone: dados.telefone.trim(),
  }
  const perfis = listarPerfis()
  perfis[email] = usuario
  localStorage.setItem(CHAVE_PERFIS, JSON.stringify(perfis))
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario))
  return usuario
}

export function autenticarUsuario(emailInformado: string) {
  const usuario = listarPerfis()[normalizarEmail(emailInformado)] ?? null
  if (usuario) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario))
  return usuario
}

export function obterUsuarioAutenticado() {
  return lerJson<UsuarioAutenticado | null>(CHAVE_SESSAO, null)
}

export function encerrarSessao() {
  localStorage.removeItem(CHAVE_SESSAO)
}

export function destinoSeguro(retorno: string | null) {
  return retorno?.startsWith('/') && !retorno.startsWith('//') ? retorno : '/'
}
