import { describe, expect, it } from 'vitest'
import {
  agendaParaProfissional,
  carregarContextoAgendamento,
  profissionaisParaServico,
} from './agendamentosMock'

describe('agendamentosMock', () => {
  it('carrega o estabelecimento padrão sem slug', async () => {
    const contexto = await carregarContextoAgendamento()
    expect(contexto.estabelecimento.slug).toBe('estudio-central')
  })

  it('carrega outro estabelecimento pelo slug', async () => {
    const contexto = await carregarContextoAgendamento('barbearia-horizonte')
    expect(contexto.estabelecimento.nome).toBe('Barbearia Horizonte')
  })

  it('rejeita slug desconhecido', async () => {
    await expect(
      carregarContextoAgendamento('inexistente'),
    ).rejects.toThrow('Estabelecimento não encontrado')
  })

  it('filtra profissionais pelo serviço', async () => {
    const contexto = await carregarContextoAgendamento()
    const profissionais = profissionaisParaServico(contexto, 'servico-corte')

    expect(profissionais).not.toHaveLength(0)
    expect(
      profissionais.every((item) =>
        item.servicoIds.includes('servico-corte'),
      ),
    ).toBe(true)
  })

  it('retorna a agenda do profissional selecionado', async () => {
    const contexto = await carregarContextoAgendamento()
    expect(
      agendaParaProfissional(contexto, 'profissional-alex'),
    ).not.toHaveLength(0)
  })

  it('gera datas futuras para a agenda demonstrativa', async () => {
    const contexto = await carregarContextoAgendamento()
    const [primeiroDia] = agendaParaProfissional(
      contexto,
      'profissional-alex',
    )
    const hoje = new Date()
    const hojeIso = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0'),
    ].join('-')

    expect(primeiroDia.data > hojeIso).toBe(true)
  })
})
