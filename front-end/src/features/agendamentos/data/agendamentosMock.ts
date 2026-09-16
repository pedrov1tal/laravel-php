import type {
  ContextoAgendamento,
  DataDisponivel,
} from '../types/agendamento'

function dataIsoLocal(data: Date) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-')
}

function criarAgenda(...horarios: string[]): DataDisponivel[] {
  const hoje = new Date()

  return Array.from({ length: 7 }, (_, indice) => {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate() + indice + 1,
      12,
    )
    const diaIndisponivel = indice === 3

    return {
      data: dataIsoLocal(data),
      disponivel: !diaIndisponivel,
      horarios: horarios.map((horario, horarioIndice) => ({
        horario,
        disponivel: !diaIndisponivel && !(indice === 1 && horarioIndice === 1),
      })),
    }
  })
}

function criarContextos(): ContextoAgendamento[] {
  return [
    {
      estabelecimento: {
        id: 'estabelecimento-central',
        slug: 'estudio-central',
        nome: 'Estúdio Central',
        iniciais: 'EC',
        endereco: 'Rua das Flores, 120',
        telefone: '(11) 3333-1200',
      },
      servicos: [
        {
          id: 'servico-corte',
          nome: 'Corte masculino',
          descricao: 'Corte personalizado com acabamento.',
          duracaoMinutos: 45,
          precoCentavos: 4500,
        },
        {
          id: 'servico-barba',
          nome: 'Barba',
          descricao: 'Modelagem, toalha quente e acabamento.',
          duracaoMinutos: 30,
          precoCentavos: 3000,
        },
        {
          id: 'servico-completo',
          nome: 'Corte + barba',
          descricao: 'Experiência completa em uma única sessão.',
          duracaoMinutos: 60,
          precoCentavos: 6500,
        },
      ],
      profissionais: [
        {
          id: 'profissional-alex',
          nome: 'Alex Martins',
          especialidade: 'Cortes e acabamento',
          iniciais: 'AM',
          servicoIds: ['servico-corte', 'servico-completo'],
        },
        {
          id: 'profissional-bruno',
          nome: 'Bruno Lima',
          especialidade: 'Barba e visagismo',
          iniciais: 'BL',
          servicoIds: ['servico-barba', 'servico-completo'],
        },
      ],
      agendaPorProfissional: {
        'profissional-alex': criarAgenda('09:00', '10:30', '14:00'),
        'profissional-bruno': criarAgenda('09:30', '11:00', '15:30'),
      },
    },
    {
      estabelecimento: {
        id: 'estabelecimento-horizonte',
        slug: 'barbearia-horizonte',
        nome: 'Barbearia Horizonte',
        iniciais: 'BH',
        endereco: 'Avenida do Sol, 450',
        telefone: '(11) 3444-4500',
      },
      servicos: [
        {
          id: 'horizonte-corte',
          nome: 'Corte clássico',
          descricao: 'Tesoura, máquina e finalização.',
          duracaoMinutos: 40,
          precoCentavos: 4000,
        },
        {
          id: 'horizonte-barba',
          nome: 'Barba premium',
          descricao: 'Toalha quente e hidratação.',
          duracaoMinutos: 35,
          precoCentavos: 3500,
        },
      ],
      profissionais: [
        {
          id: 'horizonte-caio',
          nome: 'Caio Nunes',
          especialidade: 'Clássicos contemporâneos',
          iniciais: 'CN',
          servicoIds: ['horizonte-corte', 'horizonte-barba'],
        },
      ],
      agendaPorProfissional: {
        'horizonte-caio': criarAgenda('10:00', '13:30', '16:00'),
      },
    },
  ]
}

export async function carregarContextoAgendamento(slug?: string) {
  await Promise.resolve()
  const contextos = criarContextos()
  const contexto = slug
    ? contextos.find((item) => item.estabelecimento.slug === slug)
    : contextos[0]

  if (!contexto) throw new Error('Estabelecimento não encontrado')
  return contexto
}

export function profissionaisParaServico(
  contexto: ContextoAgendamento,
  servicoId: string,
) {
  return contexto.profissionais.filter((item) =>
    item.servicoIds.includes(servicoId),
  )
}

export function agendaParaProfissional(
  contexto: ContextoAgendamento,
  profissionalId: string,
) {
  return contexto.agendaPorProfissional[profissionalId] ?? []
}
