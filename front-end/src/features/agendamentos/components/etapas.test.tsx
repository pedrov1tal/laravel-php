import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmacaoAgendamento } from './ConfirmacaoAgendamento'
import { DadosClienteForm } from './DadosClienteForm'
import { RevisaoAgendamento } from './RevisaoAgendamento'
import { SelecaoDataHorario } from './SelecaoDataHorario'
import { SelecaoProfissional } from './SelecaoProfissional'
import { SelecaoServico } from './SelecaoServico'
import type {
  DadosCliente,
  Estabelecimento,
  Profissional,
  ServicoAgendamento,
} from '../types/agendamento'

const estabelecimento: Estabelecimento = {
  id: 'e1',
  slug: 'estudio-central',
  nome: 'Estúdio Central',
  iniciais: 'EC',
  endereco: 'Rua das Flores, 120',
  telefone: '(11) 3333-1200',
}

const servico: ServicoAgendamento = {
  id: 's1',
  nome: 'Corte masculino',
  descricao: 'Corte personalizado.',
  duracaoMinutos: 45,
  precoCentavos: 4500,
}

const profissional: Profissional = {
  id: 'p1',
  nome: 'Alex Martins',
  especialidade: 'Cortes e acabamento',
  iniciais: 'AM',
  servicoIds: ['s1'],
}

const cliente: DadosCliente = {
  nome: 'Ana Souza',
  telefone: '(11) 99999-0000',
  email: '',
}

describe('etapas de seleção', () => {
  it('seleciona um serviço por um botão acessível', async () => {
    const user = userEvent.setup()
    const onSelecionar = vi.fn()
    render(
      <SelecaoServico
        servicos={[
          {
            id: 's1',
            nome: 'Corte',
            descricao: 'Acabamento',
            duracaoMinutos: 45,
            precoCentavos: 4500,
          },
        ]}
        selecionado={null}
        onSelecionar={onSelecionar}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Corte/ }))
    expect(onSelecionar).toHaveBeenCalledWith('s1')
  })

  it('informa quando nenhum profissional atende ao serviço', () => {
    render(
      <SelecaoProfissional
        profissionais={[]}
        selecionado={null}
        onSelecionar={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Nenhum profissional disponível para este serviço.'),
    ).toBeInTheDocument()
  })

  it('não permite selecionar horário indisponível', async () => {
    const user = userEvent.setup()
    const onHorario = vi.fn()
    render(
      <SelecaoDataHorario
        datas={[
          {
            data: '2026-09-18',
            disponivel: true,
            horarios: [{ horario: '09:00', disponivel: false }],
          },
        ]}
        dataSelecionada="2026-09-18"
        horarioSelecionado={null}
        onSelecionarData={vi.fn()}
        onSelecionarHorario={onHorario}
      />,
    )

    const horario = screen.getByRole('button', { name: '09:00' })
    expect(horario).toBeDisabled()
    await user.click(horario)
    expect(onHorario).not.toHaveBeenCalled()
  })

  it('explica quando não existem datas disponíveis', () => {
    render(
      <SelecaoDataHorario
        datas={[]}
        dataSelecionada={null}
        horarioSelecionado={null}
        onSelecionarData={vi.fn()}
        onSelecionarHorario={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Nenhuma data disponível no momento.'),
    ).toBeInTheDocument()
  })

  it('mantém a troca de data acessível quando um dia não possui horários', () => {
    render(
      <SelecaoDataHorario
        datas={[
          { data: '2026-09-18', disponivel: true, horarios: [] },
        ]}
        dataSelecionada="2026-09-18"
        horarioSelecionado={null}
        onSelecionarData={vi.fn()}
        onSelecionarHorario={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Nenhum horário disponível para esta data.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Selecionar 18 de setembro' }),
    ).toBeEnabled()
  })
})

describe('dados, revisão e confirmação', () => {
  it('mostra erros de nome e telefone e aceita e-mail opcional', async () => {
    const user = userEvent.setup()
    const onContinuar = vi.fn()
    render(
      <DadosClienteForm
        valor={{ nome: '', telefone: '', email: '' }}
        onChange={vi.fn()}
        onContinuar={onContinuar}
      />,
    )

    await user.click(
      screen.getByRole('button', { name: 'Continuar para revisão' }),
    )

    expect(screen.getByText('Informe seu nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe seu telefone.')).toBeInTheDocument()
    expect(onContinuar).not.toHaveBeenCalled()
  })

  it('permite editar a etapa de serviço pela revisão', async () => {
    const user = userEvent.setup()
    const onEditar = vi.fn()
    render(
      <RevisaoAgendamento
        estabelecimento={estabelecimento}
        servico={servico}
        profissional={profissional}
        data="2026-09-18"
        horario="14:30"
        cliente={cliente}
        onEditar={onEditar}
        onConfirmar={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Editar serviço' }))
    expect(onEditar).toHaveBeenCalledWith('servico')
  })

  it('mostra os dados essenciais na confirmação', () => {
    render(
      <ConfirmacaoAgendamento
        estabelecimento={estabelecimento}
        servico={servico}
        profissional={profissional}
        data="2026-09-18"
        horario="14:30"
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Seu horário está marcado.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Estúdio Central')).toBeInTheDocument()
    expect(screen.getByText('Alex Martins')).toBeInTheDocument()
    expect(screen.getByText('14:30')).toBeInTheDocument()
  })
})
