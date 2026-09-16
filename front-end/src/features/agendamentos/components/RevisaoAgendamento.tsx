import {
  formatarDataLonga,
  formatarDuracao,
  formatarPreco,
} from '../../../lib/formatters'
import type {
  DadosCliente,
  Estabelecimento,
  EtapaAgendamento,
  Profissional,
  ServicoAgendamento,
} from '../types/agendamento'

interface RevisaoAgendamentoProps {
  estabelecimento: Estabelecimento
  servico: ServicoAgendamento
  profissional: Profissional
  data: string
  horario: string
  cliente: DadosCliente
  onEditar: (etapa: EtapaAgendamento) => void
  onConfirmar: () => void
}

interface LinhaRevisaoProps {
  rotulo: string
  titulo: string
  detalhe: string
  editar: string
  onEditar: () => void
}

function LinhaRevisao({
  rotulo,
  titulo,
  detalhe,
  editar,
  onEditar,
}: LinhaRevisaoProps) {
  return (
    <div className="booking-review-row">
      <span>{rotulo}</span>
      <div>
        <strong>{titulo}</strong>
        <p>{detalhe}</p>
      </div>
      <button type="button" onClick={onEditar}>
        {editar}
      </button>
    </div>
  )
}

export function RevisaoAgendamento({
  estabelecimento,
  servico,
  profissional,
  data,
  horario,
  cliente,
  onEditar,
  onConfirmar,
}: RevisaoAgendamentoProps) {
  return (
    <div className="booking-review">
      <div className="booking-review-establishment">
        <span>Estabelecimento</span>
        <strong>{estabelecimento.nome}</strong>
        <p>{estabelecimento.endereco}</p>
      </div>

      <LinhaRevisao
        rotulo="Serviço"
        titulo={servico.nome}
        detalhe={`${formatarDuracao(servico.duracaoMinutos)} · ${formatarPreco(servico.precoCentavos)}`}
        editar="Editar serviço"
        onEditar={() => onEditar('servico')}
      />
      <LinhaRevisao
        rotulo="Profissional"
        titulo={profissional.nome}
        detalhe={profissional.especialidade}
        editar="Editar profissional"
        onEditar={() => onEditar('profissional')}
      />
      <LinhaRevisao
        rotulo="Data e horário"
        titulo={formatarDataLonga(data)}
        detalhe={horario}
        editar="Editar data e horário"
        onEditar={() => onEditar('data-horario')}
      />
      <LinhaRevisao
        rotulo="Sua conta"
        titulo={cliente.nome}
        detalhe={[cliente.telefone, cliente.email].filter(Boolean).join(' · ')}
        editar="Ver conta"
        onEditar={() => onEditar('cliente')}
      />

      <div className="booking-review-total">
        <span>Valor total</span>
        <strong>{formatarPreco(servico.precoCentavos)}</strong>
      </div>

      <div className="booking-actions">
        <button
          className="booking-primary-action"
          type="button"
          onClick={onConfirmar}
        >
          Confirmar agendamento
        </button>
      </div>
    </div>
  )
}
