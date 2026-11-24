import { obterToken } from '../../autenticacao/session'
import type { BarbeariaDisponivel } from '../../agendamentos/types/agendamento'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

async function requisitar(caminho: string, method: 'GET' | 'PUT' | 'DELETE') {
  const token = obterToken()
  if (!token) throw new Error('Sua sessão expirou. Entre novamente para continuar.')

  const resposta = await fetch(`${apiUrl}${caminho}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  })
  const texto = await resposta.text()
  let corpo: unknown

  try {
    corpo = texto ? JSON.parse(texto) : {}
  } catch {
    throw new Error(`A API retornou uma resposta inválida (HTTP ${resposta.status}).`)
  }

  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    throw new Error(`A API retornou uma resposta inválida (HTTP ${resposta.status}).`)
  }

  const dados = corpo as { data?: unknown; message?: unknown }
  if (!resposta.ok) {
    throw new Error(typeof dados.message === 'string' ? dados.message : `Não foi possível atualizar favoritos (HTTP ${resposta.status}).`)
  }

  return dados
}

export async function carregarBarbeariasFavoritas(): Promise<BarbeariaDisponivel[]> {
  const resposta = await requisitar('/cliente/barbearias-favoritas', 'GET')
  if (!Array.isArray(resposta.data)) throw new Error('A API retornou uma lista de favoritos inválida.')

  return resposta.data as BarbeariaDisponivel[]
}

export async function definirBarbeariaFavorita(slug: string, favorita: boolean): Promise<void> {
  await requisitar(
    `/cliente/barbearias-favoritas/${encodeURIComponent(slug)}`,
    favorita ? 'PUT' : 'DELETE',
  )
}
