import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AgendamentoHeader } from '../components/AgendamentoHeader'
import { ConfirmacaoAgendamento } from '../components/ConfirmacaoAgendamento'
import { DadosClienteForm } from '../components/DadosClienteForm'
import { EstadoFeedback } from '../components/EstadoFeedback'
import { IndicadorProgresso } from '../components/IndicadorProgresso'
import { RevisaoAgendamento } from '../components/RevisaoAgendamento'
import { SelecaoDataHorario } from '../components/SelecaoDataHorario'
import { SelecaoProfissional } from '../components/SelecaoProfissional'
import { SelecaoServico } from '../components/SelecaoServico'
import {
  agendaParaProfissional,
  carregarContextoAgendamento,
  profissionaisParaServico,
} from '../data/agendamentosMock'
import {
  agendamentoReducer,
  criarEstadoInicial,
} from '../state/agendamentoReducer'
import type {
  ContextoAgendamento,
  EtapaAgendamento,
} from '../types/agendamento'

const titulos: Record<Exclude<EtapaAgendamento, 'confirmacao'>, string> = {
  servico: 'Escolha o serviço',
  profissional: 'Escolha o profissional',
  'data-horario': 'Escolha data e horário',
  cliente: 'Conte como podemos falar com você',
  revisao: 'Revise seu agendamento',
}

const descricoes: Record<Exclude<EtapaAgendamento, 'confirmacao'>, string> = {
  servico: 'Comece escolhendo o cuidado que combina com o seu momento.',
  profissional: 'Veja quem atende ao serviço escolhido e reserve sua cadeira.',
  'data-horario': 'Escolha entre os próximos horários disponíveis.',
  cliente: 'Precisamos apenas dos dados essenciais para confirmar seu horário.',
  revisao: 'Confira cada detalhe antes de concluir.',
}

export function AgendarPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('estabelecimento') ?? undefined
  const [carregamento, setCarregamento] = useState<{
    slug: string | undefined
    contexto: ContextoAgendamento | null
    erro: string | null
  }>({ slug, contexto: null, erro: null })
  const [estado, dispatch] = useReducer(
    agendamentoReducer,
    undefined,
    criarEstadoInicial,
  )
  const conteudoRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let ativo = true
    dispatch({ type: 'reiniciar' })

    carregarContextoAgendamento(slug)
      .then((resultado) => {
        if (ativo) {
          setCarregamento({ slug, contexto: resultado, erro: null })
        }
      })
      .catch((falha: unknown) => {
        if (!ativo) return
        setCarregamento({
          slug,
          contexto: null,
          erro:
            falha instanceof Error
              ? falha.message
              : 'Não foi possível carregar o agendamento',
        })
      })

    return () => {
      ativo = false
    }
  }, [slug])

  const contexto = carregamento.slug === slug ? carregamento.contexto : null
  const erro = carregamento.slug === slug ? carregamento.erro : null

  useEffect(() => {
    if (!contexto) return
    const tituloAnterior = document.title
    document.title = `Agendar | ${contexto.estabelecimento.nome}`
    return () => {
      document.title = tituloAnterior
    }
  }, [contexto])

  useEffect(() => {
    const elemento = conteudoRef.current
    if (elemento && 'scrollIntoView' in elemento) {
      elemento.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [estado.etapa])

  const servico = useMemo(
    () =>
      contexto?.servicos.find(
        (item) => item.id === estado.rascunho.servicoId,
      ) ?? null,
    [contexto, estado.rascunho.servicoId],
  )

  const profissionais = useMemo(
    () =>
      contexto && estado.rascunho.servicoId
        ? profissionaisParaServico(contexto, estado.rascunho.servicoId)
        : [],
    [contexto, estado.rascunho.servicoId],
  )

  const profissional = useMemo(
    () =>
      contexto?.profissionais.find(
        (item) => item.id === estado.rascunho.profissionalId,
      ) ?? null,
    [contexto, estado.rascunho.profissionalId],
  )

  const agenda = useMemo(
    () =>
      contexto && estado.rascunho.profissionalId
        ? agendaParaProfissional(contexto, estado.rascunho.profissionalId)
        : [],
    [contexto, estado.rascunho.profissionalId],
  )

  function irPara(etapa: EtapaAgendamento) {
    dispatch({ type: 'ir-para-etapa', etapa })
  }

  function voltar() {
    const anteriores: Partial<Record<EtapaAgendamento, EtapaAgendamento>> = {
      profissional: 'servico',
      'data-horario': 'profissional',
      cliente: 'data-horario',
      revisao: 'cliente',
    }
    const anterior = anteriores[estado.etapa]
    if (anterior) irPara(anterior)
  }

  if (erro) {
    return (
      <main className="booking-shell booking-state-shell">
        <EstadoFeedback
          titulo={erro}
          descricao="Confira o endereço usado ou volte para a página inicial."
          acao={{
            rotulo: 'Voltar para o início',
            onClick: () => window.location.assign('/'),
          }}
        />
      </main>
    )
  }

  if (!contexto) {
    return (
      <main className="booking-shell booking-state-shell">
        <EstadoFeedback
          carregando
          titulo="Preparando sua agenda"
          descricao="Estamos consultando os próximos horários disponíveis."
        />
      </main>
    )
  }

  const etapa = estado.etapa
  const confirmacao = etapa === 'confirmacao'

  return (
    <div className="booking-shell">
      <AgendamentoHeader estabelecimento={contexto.estabelecimento} />
      <main className="booking-layout">
        <IndicadorProgresso etapaAtual={etapa} />
        <section
          className={`booking-panel${confirmacao ? ' is-confirmation' : ''}`}
          id="booking-content"
          ref={conteudoRef}
          tabIndex={-1}
        >
          {!confirmacao && (
            <>
              <p className="booking-kicker">Agende seu horário</p>
              <h1>{titulos[etapa]}</h1>
              <p className="booking-intro">{descricoes[etapa]}</p>
            </>
          )}

          {etapa === 'servico' && (
            <>
              <SelecaoServico
                servicos={contexto.servicos}
                selecionado={estado.rascunho.servicoId}
                onSelecionar={(servicoId) =>
                  dispatch({ type: 'selecionar-servico', servicoId })
                }
              />
              <div className="booking-actions">
                <button
                  className="booking-primary-action"
                  type="button"
                  disabled={!servico}
                  onClick={() => irPara('profissional')}
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {etapa === 'profissional' && (
            <>
              <SelecaoProfissional
                profissionais={profissionais}
                selecionado={estado.rascunho.profissionalId}
                onSelecionar={(profissionalId) =>
                  dispatch({ type: 'selecionar-profissional', profissionalId })
                }
              />
              <NavegacaoEtapa
                onVoltar={voltar}
                onContinuar={() => irPara('data-horario')}
                podeContinuar={Boolean(profissional)}
              />
            </>
          )}

          {etapa === 'data-horario' && (
            <>
              <SelecaoDataHorario
                datas={agenda}
                dataSelecionada={estado.rascunho.data}
                horarioSelecionado={estado.rascunho.horario}
                onSelecionarData={(data) =>
                  dispatch({ type: 'selecionar-data', data })
                }
                onSelecionarHorario={(horario) =>
                  dispatch({ type: 'selecionar-horario', horario })
                }
              />
              <NavegacaoEtapa
                onVoltar={voltar}
                onContinuar={() => irPara('cliente')}
                podeContinuar={Boolean(
                  estado.rascunho.data && estado.rascunho.horario,
                )}
              />
            </>
          )}

          {etapa === 'cliente' && (
            <>
              <button
                className="booking-secondary-action booking-back-step"
                type="button"
                onClick={voltar}
              >
                Voltar
              </button>
              <DadosClienteForm
                valor={estado.rascunho.cliente}
                onChange={(cliente) =>
                  dispatch({ type: 'atualizar-cliente', cliente })
                }
                onContinuar={() => irPara('revisao')}
              />
            </>
          )}

          {etapa === 'revisao' &&
            servico &&
            profissional &&
            estado.rascunho.data &&
            estado.rascunho.horario && (
              <>
                <button
                  className="booking-secondary-action booking-back-step"
                  type="button"
                  onClick={voltar}
                >
                  Voltar
                </button>
                <RevisaoAgendamento
                  estabelecimento={contexto.estabelecimento}
                  servico={servico}
                  profissional={profissional}
                  data={estado.rascunho.data}
                  horario={estado.rascunho.horario}
                  cliente={estado.rascunho.cliente}
                  onEditar={irPara}
                  onConfirmar={() => dispatch({ type: 'confirmar' })}
                />
              </>
            )}

          {etapa === 'confirmacao' &&
            servico &&
            profissional &&
            estado.rascunho.data &&
            estado.rascunho.horario && (
              <ConfirmacaoAgendamento
                estabelecimento={contexto.estabelecimento}
                servico={servico}
                profissional={profissional}
                data={estado.rascunho.data}
                horario={estado.rascunho.horario}
              />
            )}
        </section>
      </main>
    </div>
  )
}

interface NavegacaoEtapaProps {
  onVoltar: () => void
  onContinuar: () => void
  podeContinuar: boolean
}

function NavegacaoEtapa({
  onVoltar,
  onContinuar,
  podeContinuar,
}: NavegacaoEtapaProps) {
  return (
    <div className="booking-actions">
      <button
        className="booking-secondary-action"
        type="button"
        onClick={onVoltar}
      >
        Voltar
      </button>
      <button
        className="booking-primary-action"
        type="button"
        disabled={!podeContinuar}
        onClick={onContinuar}
      >
        Continuar
      </button>
    </div>
  )
}
