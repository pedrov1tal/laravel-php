import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { obterUsuarioAutenticado } from '../../autenticacao/session'
import { AgendamentoHeader } from '../components/AgendamentoHeader'
import { ConfirmacaoAgendamento } from '../components/ConfirmacaoAgendamento'
import { DadosUsuarioAutenticado } from '../components/DadosUsuarioAutenticado'
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
  type EstadoAgendamento,
} from '../state/agendamentoReducer'
import {
  consumirAgendamentoPendente,
  salvarAgendamentoPendente,
} from '../state/agendamentoPendente'
import type {
  ContextoAgendamento,
  EtapaAgendamento,
} from '../types/agendamento'

const titulos: Record<Exclude<EtapaAgendamento, 'confirmacao'>, string> = {
  servico: 'Escolha o serviço',
  profissional: 'Escolha o profissional',
  'data-horario': 'Escolha data e horário',
  cliente: 'Confirme sua conta',
  revisao: 'Revise seu agendamento',
}

const descricoes: Record<Exclude<EtapaAgendamento, 'confirmacao'>, string> = {
  servico: 'Comece escolhendo o cuidado que combina com o seu momento.',
  profissional: 'Veja quem atende ao serviço escolhido e reserve sua cadeira.',
  'data-horario': 'Escolha entre os próximos horários disponíveis.',
  cliente: 'Usaremos os dados do seu perfil para identificar este agendamento.',
  revisao: 'Confira cada detalhe antes de concluir.',
}

export function AgendarPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const slug = searchParams.get('estabelecimento') ?? undefined
  const [carregamento, setCarregamento] = useState<{
    slug: string | undefined
    contexto: ContextoAgendamento | null
    erro: string | null
  }>({ slug, contexto: null, erro: null })
  const [estado, dispatch] = useReducer(
    agendamentoReducer,
    undefined,
    criarEstadoInicialComSessao,
  )
  const conteudoRef = useRef<HTMLElement>(null)
  const slugAnteriorRef = useRef(slug)

  useEffect(() => {
    let ativo = true
    if (slugAnteriorRef.current !== slug) {
      slugAnteriorRef.current = slug
      dispatch({ type: 'reiniciar' })
    }

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

  function continuarParaConta() {
    const usuarioAtual = obterUsuarioAutenticado()
    if (!usuarioAtual) {
      salvarAgendamentoPendente({ ...estado, etapa: 'cliente' })
      const retorno = `${location.pathname}${location.search}`
      navigate(`/login?retorno=${encodeURIComponent(retorno)}`)
      return
    }

    dispatch({
      type: 'atualizar-cliente',
      cliente: {
        nome: usuarioAtual.nome,
        telefone: usuarioAtual.telefone,
        email: usuarioAtual.email,
      },
    })
    irPara('cliente')
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
  const usuario = obterUsuarioAutenticado()

  return (
    <div className="booking-shell">
      <AgendamentoHeader
        estabelecimento={contexto.estabelecimento}
        retorno={`${location.pathname}${location.search}`}
      />
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
                <Button
                  variant="unstyled"
                  className="booking-primary-action"
                  type="button"
                  disabled={!servico}
                  onClick={() => irPara('profissional')}
                >
                  Continuar
                </Button>
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
                onContinuar={continuarParaConta}
                podeContinuar={Boolean(
                  estado.rascunho.data && estado.rascunho.horario,
                )}
              />
            </>
          )}

          {etapa === 'cliente' && (
            <>
              <Button
                variant="unstyled"
                className="booking-secondary-action booking-back-step"
                type="button"
                onClick={voltar}
              >
                Voltar
              </Button>
              {usuario ? (
                <DadosUsuarioAutenticado
                  usuario={usuario}
                  onContinuar={() => irPara('revisao')}
                />
              ) : (
                <EstadoFeedback
                  titulo="Entre para continuar"
                  descricao="Seu agendamento precisa ficar vinculado à sua conta."
                  acao={{
                    rotulo: 'Entrar na minha conta',
                    onClick: continuarParaConta,
                  }}
                />
              )}
            </>
          )}

          {etapa === 'revisao' &&
            servico &&
            profissional &&
            estado.rascunho.data &&
            estado.rascunho.horario && (
              <>
                <Button
                  variant="unstyled"
                  className="booking-secondary-action booking-back-step"
                  type="button"
                  onClick={voltar}
                >
                  Voltar
                </Button>
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

function criarEstadoInicialComSessao(): EstadoAgendamento {
  const usuario = obterUsuarioAutenticado()
  if (!usuario) return criarEstadoInicial()

  const pendente = consumirAgendamentoPendente()
  if (!pendente) return criarEstadoInicial()

  return {
    ...pendente,
    etapa: 'cliente',
    rascunho: {
      ...pendente.rascunho,
      cliente: {
        nome: usuario.nome,
        telefone: usuario.telefone,
        email: usuario.email,
      },
    },
  }
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
      <Button
        variant="unstyled"
        className="booking-secondary-action"
        type="button"
        onClick={onVoltar}
      >
        Voltar
      </Button>
      <Button
        variant="unstyled"
        className="booking-primary-action"
        type="button"
        disabled={!podeContinuar}
        onClick={onContinuar}
      >
        Continuar
      </Button>
    </div>
  )
}
