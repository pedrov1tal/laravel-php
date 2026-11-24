import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Heart, LogOut, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { carregarBarbearias } from '../agendamentos/data/barbeariasApi'
import type { BarbeariaDisponivel } from '../agendamentos/types/agendamento'
import { ThemeToggleButton } from '../../shared/components/ThemeToggleButton'
import { BrandLogo } from '../../shared/components/BrandLogo'
import { carregarBarbeariasFavoritas, definirBarbeariaFavorita } from './api/barbeariasFavoritasApi'
import {
  encerrarSessao,
  obterToken,
  obterUsuarioAutenticado,
} from '../autenticacao/session'
import './cliente-home.css'

type AgendamentoCliente = {
  id: number
  data_hora: string
  status: string
  barbearia?: { nome: string; slug: string }
  servico?: { nome: string }
  barbeiro?: { nome: string }
}

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

function inicioDaSemanaHoje() {
  const hoje = new Date()
  hoje.setHours(12, 0, 0, 0)
  const segunda = hoje.getDate() - ((hoje.getDay() + 6) % 7)
  return new Date(hoje.getFullYear(), hoje.getMonth(), segunda)
}

function chaveLocalData(data: Date) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function ClienteHomePage() {
  const usuario = obterUsuarioAutenticado()
  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? 'Cliente'
  const [barbearias, setBarbearias] = useState<BarbeariaDisponivel[]>([])
  const [agendamentos, setAgendamentos] = useState<AgendamentoCliente[]>([])
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [carregandoFavoritas, setCarregandoFavoritas] = useState(true)
  const [favoritasSalvando, setFavoritasSalvando] = useState<Set<string>>(() => new Set())
  const [erroFavoritas, setErroFavoritas] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregarFavoritas = useCallback(async () => {
    setCarregandoFavoritas(true)
    setErroFavoritas(null)
    try {
      const resultado = await carregarBarbeariasFavoritas()
      setFavoritos(resultado.map((barbearia) => barbearia.slug))
    } catch (falha) {
      setErroFavoritas(falha instanceof Error ? falha.message : 'Não foi possível carregar as barbearias favoritas.')
    } finally {
      setCarregandoFavoritas(false)
    }
  }, [])

  useEffect(() => {
    let ativo = true
    carregarBarbearias()
      .then((resultado) => {
        if (ativo) setBarbearias(resultado)
      })
      .catch(() => {
        if (ativo) setErro('Não foi possível carregar as barbearias.')
      })

    const token = obterToken()
    if (token) {
      fetch(`${apiUrl}/cliente/agendamentos`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (resposta) => {
          const corpo = await resposta.json().catch(() => ({}))
          if (!resposta.ok) throw new Error(corpo.message ?? 'Não foi possível carregar os agendamentos.')
          if (ativo) {
            const lista = (corpo.data ?? []) as AgendamentoCliente[]
            setAgendamentos(lista)
          }
        })
        .catch((falha: unknown) => {
          if (ativo) setErro(falha instanceof Error ? falha.message : 'Não foi possível carregar os agendamentos.')
        })
    }

    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    void carregarFavoritas()
  }, [carregarFavoritas])

  const diasDaSemana = useMemo(() => {
    const segunda = inicioDaSemanaHoje()
    return Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(segunda)
      data.setDate(segunda.getDate() + indice)
      return data
    })
  }, [])

  const agendamentosPorData = useMemo(() => {
    const mapa = new Map<string, AgendamentoCliente[]>()
    agendamentos
      .filter((item) => ['pendente', 'confirmado'].includes(item.status))
      .forEach((item) => {
        const data = item.data_hora.slice(0, 10)
        mapa.set(data, [...(mapa.get(data) ?? []), item])
      })
    return mapa
  }, [agendamentos])

  async function alternarFavorito(slug: string) {
    if (carregandoFavoritas || erroFavoritas || favoritasSalvando.has(slug)) return

    const favorita = !favoritos.includes(slug)
    setFavoritasSalvando((atuais) => new Set(atuais).add(slug))
    setErroFavoritas(null)
    try {
      await definirBarbeariaFavorita(slug, favorita)
      setFavoritos((atuais) => favorita
        ? [...new Set([...atuais, slug])]
        : atuais.filter((item) => item !== slug))
    } catch (falha) {
      setErroFavoritas(falha instanceof Error ? falha.message : 'Não foi possível atualizar as barbearias favoritas.')
    } finally {
      setFavoritasSalvando((atuais) => new Set([...atuais].filter((item) => item !== slug)))
    }
  }

  function sair() {
    encerrarSessao()
    window.location.replace('/')
  }

  const hojeChave = chaveLocalData(new Date())
  const inicioChave = chaveLocalData(diasDaSemana[0])
  const fimChave = chaveLocalData(diasDaSemana[6])
  const agendamentosDaSemana = agendamentos.filter((item) => {
    const data = item.data_hora.slice(0, 10)
    return data >= inicioChave && data <= fimChave && ['pendente', 'confirmado'].includes(item.status)
  })
  const barbeariasExibidas = favoritos.length > 0
    ? [
        ...barbearias.filter((barbearia) => favoritos.includes(barbearia.slug)),
        ...barbearias.filter((barbearia) => !favoritos.includes(barbearia.slug)),
      ].slice(0, 6)
    : barbearias.slice(0, 6)

  return (
    <div className="client-home-shell">
      <header className="client-home-header">
        <a className="brand" href="/" aria-label="Corte Rápido, início">
          <BrandLogo />
        </a>
        <div className="client-home-header-actions">
          <ThemeToggleButton className="client-home-theme-toggle" />
          <Button asChild variant="unstyled">
            <a className="button button-dark client-home-account" href="/conta">
              Olá, {primeiroNome} <span aria-hidden="true">↗</span>
            </a>
          </Button>
          <Button
            variant="unstyled"
            className="client-home-logout"
            type="button"
            onClick={sair}
          >
            <LogOut size={14} strokeWidth={1.8} aria-hidden="true" />
            Sair
          </Button>
        </div>
      </header>

      <main className="client-home-main">
        <section className="client-home-welcome">
          <div>
            <p className="eyebrow"><span /> Sua próxima visita</p>
            <h1>Olá, {primeiroNome}.<br /><em>Pronto para o próximo corte?</em></h1>
          </div>
          <Button asChild variant="unstyled">
            <a className="button button-copper client-home-book" href="/agendar">
              <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
              Agendar agora
              <span aria-hidden="true">↗</span>
            </a>
          </Button>
        </section>

        <div className="client-home-grid">
          <section className="client-favorites" aria-labelledby="favorites-title">
            <div className="client-section-heading">
              <div>
                <p className="eyebrow"><span /> Seu universo</p>
                <h2 id="favorites-title">Barbearias favoritas</h2>
              </div>
              <a href="/agendar">Ver todas <span aria-hidden="true">↗</span></a>
            </div>

            {erroFavoritas && <p className="client-home-feedback" role="alert">{erroFavoritas} <button type="button" onClick={() => void carregarFavoritas()}>Tentar novamente</button></p>}
            {erro && barbearias.length === 0 && <p className="client-home-feedback" role="alert">{erro}</p>}

            {barbearias.length === 0 && !erro ? (
              <p className="client-home-feedback">Carregando barbearias…</p>
            ) : (
              <div className="client-favorites-grid">
                {barbeariasExibidas.map((barbearia, indice) => {
                  const favorita = favoritos.includes(barbearia.slug)
                  return (
                    <article className="client-favorite-card" key={barbearia.id}>
                      <div className={`client-favorite-cover cover-${indice % 3}`}>
                        <span>{String(indice + 1).padStart(2, '0')}</span>
                        <button
                          type="button"
                          className={favorita ? 'is-favorite' : ''}
                          aria-label={`${favorita ? 'Remover' : 'Adicionar'} ${barbearia.nome} ${favorita ? 'dos' : 'aos'} favoritos`}
                          aria-pressed={favorita}
                          aria-busy={favoritasSalvando.has(barbearia.slug)}
                          disabled={carregandoFavoritas || Boolean(erroFavoritas) || favoritasSalvando.has(barbearia.slug)}
                          onClick={() => alternarFavorito(barbearia.slug)}
                        >
                          <Heart size={18} fill={favorita ? 'currentColor' : 'none'} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="client-favorite-info">
                        <div>
                          <strong>{barbearia.nome}</strong>
                          <span>{barbearia.endereco || 'Localização disponível no agendamento'}</span>
                        </div>
                        <a
                          href={`/agendar?estabelecimento=${encodeURIComponent(barbearia.slug)}`}
                          aria-label={`Agendar em ${barbearia.nome}`}
                        >
                          ↗
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <aside className="client-week" aria-labelledby="week-title">
            <div className="client-week-heading">
              <div>
                <p className="eyebrow"><span /> Esta semana</p>
                <h2 id="week-title">Sua agenda</h2>
              </div>
              <CalendarDays size={18} strokeWidth={1.5} aria-hidden="true" />
            </div>

            <div className="client-week-calendar" aria-label="Semana atual">
              {diasDaSemana.map((data) => {
                const chave = chaveLocalData(data)
                const horarios = agendamentosPorData.get(chave) ?? []
                const hoje = chave === hojeChave
                return (
                  <div className={`${hoje ? 'is-today ' : ''}${horarios.length ? 'has-appointment' : ''}`} key={chave}>
                    <span>{data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                    <strong>{data.getDate()}</strong>
                    {horarios.length > 0 && <i aria-label={`${horarios.length} horário marcado`} />}
                  </div>
                )
              })}
            </div>

            <div className="client-week-list">
              {agendamentosDaSemana.length === 0 ? (
                <p>Nenhum horário marcado nesta semana.</p>
              ) : (
                agendamentosDaSemana.slice(0, 4).map((item) => (
                  <article key={item.id}>
                    <time>{item.data_hora.slice(11, 16)}</time>
                    <div>
                      <strong>{item.barbearia?.nome ?? 'Barbearia'}</strong>
                      <span>{item.servico?.nome ?? 'Agendamento'} · {item.barbeiro?.nome ?? 'Profissional'}</span>
                    </div>
                  </article>
                ))
              )}
            </div>

            <a className="client-week-link" href="/conta">
              Ver todos os agendamentos <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      </main>

      <footer className="client-home-footer">
        <span>© 2026 Corte Rápido</span>
      </footer>
    </div>
  )
}
