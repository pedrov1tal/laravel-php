import type { BarbeariaDisponivel } from '../types/agendamento'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

export async function carregarBarbearias(): Promise<BarbeariaDisponivel[]> {
  const resposta = await fetch(`${apiUrl}/barbearias`)
  const corpo = await resposta.json().catch(() => ({}))

  if (!resposta.ok || !Array.isArray(corpo.data)) {
    throw new Error('Não foi possível carregar as barbearias')
  }

  return corpo.data as BarbeariaDisponivel[]
}
