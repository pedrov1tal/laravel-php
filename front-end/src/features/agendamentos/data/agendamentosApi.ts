import type { ContextoAgendamento, DataDisponivel } from '../types/agendamento'
import { obterToken } from '../../autenticacao/session'

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

export async function carregarContextoAgendamento(slug?: string): Promise<ContextoAgendamento> {
  if (!slug) throw new Error('Escolha uma barbearia para agendar.')
  const resposta = await fetch(`${apiUrl}/barbearias/${encodeURIComponent(slug)}/contexto-agendamento`)
  if (!resposta.ok) throw new Error('Barbearia não encontrada ou indisponível.')
  return resposta.json() as Promise<ContextoAgendamento>
}

export function profissionaisParaServico(contexto: ContextoAgendamento, servicoId: string) {
  return contexto.profissionais.filter((item) => item.servicoIds.includes(servicoId))
}

export function agendaParaProfissional(contexto: ContextoAgendamento, profissionalId: string): DataDisponivel[] {
  return contexto.agendaPorProfissional[profissionalId] ?? []
}

export async function criarAgendamento(slug: string, dados: { servicoId: string; profissionalId: string; data: string; horario: string }) {
  const token = obterToken()
  if (!token) throw new Error('Entre na sua conta para confirmar o agendamento.')
  const resposta = await fetch(`${apiUrl}/barbearias/${encodeURIComponent(slug)}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ servico_id: Number(dados.servicoId), barbeiro_id: Number(dados.profissionalId), data_hora: `${dados.data} ${dados.horario}` }),
  })
  const corpo = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(corpo.message ?? corpo.errors?.data_hora?.[0] ?? 'Não foi possível confirmar o agendamento.')
  return corpo
}
