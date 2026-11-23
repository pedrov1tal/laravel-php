import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AgendamentoHeader } from './AgendamentoHeader'
import { EstadoFeedback } from './EstadoFeedback'
import { carregarBarbearias } from '../data/barbeariasApi'
import type { BarbeariaDisponivel } from '../types/agendamento'

type EstadoListagem = {
  carregando: boolean
  barbearias: BarbeariaDisponivel[]
  erro: string | null
}

export function SelecaoBarbearia() {
  const [tentativa, setTentativa] = useState(0)
  const [estado, setEstado] = useState<EstadoListagem>({
    carregando: true,
    barbearias: [],
    erro: null,
  })

  useEffect(() => {
    let ativo = true
    setEstado({ carregando: true, barbearias: [], erro: null })

    carregarBarbearias()
      .then((barbearias) => {
        if (ativo) setEstado({ carregando: false, barbearias, erro: null })
      })
      .catch(() => {
        if (ativo) {
          setEstado({
            carregando: false,
            barbearias: [],
            erro: 'Não foi possível carregar as barbearias',
          })
        }
      })

    return () => {
      ativo = false
    }
  }, [tentativa])

  return (
    <div className="booking-shell">
      <AgendamentoHeader retorno="/agendar" />
      <main className="booking-selection-layout">
        {estado.carregando ? (
          <EstadoFeedback
            carregando
            titulo="Buscando barbearias"
            descricao="Estamos preparando as opções disponíveis para o seu próximo horário."
          />
        ) : estado.erro ? (
          <EstadoFeedback
            titulo={estado.erro}
            descricao="Verifique sua conexão e tente carregar as opções novamente."
            acao={{
              rotulo: 'Tentar novamente',
              onClick: () => setTentativa((valor) => valor + 1),
            }}
          />
        ) : estado.barbearias.length === 0 ? (
          <EstadoFeedback
            titulo="Nenhuma barbearia disponível"
            descricao="Ainda não há unidades ativas para receber novos agendamentos."
          />
        ) : (
          <section aria-labelledby="booking-selection-title">
            <p className="booking-kicker">Seu próximo horário</p>
            <h1 id="booking-selection-title">Escolha uma barbearia</h1>
            <p className="booking-intro">
              Selecione onde você quer ser atendido para consultar serviços,
              profissionais e horários disponíveis.
            </p>
            <div className="booking-barbershop-grid">
              {estado.barbearias.map((barbearia) => (
                <Link
                  className="booking-barbershop-card"
                  key={barbearia.id}
                  to={`/agendar?estabelecimento=${encodeURIComponent(barbearia.slug)}`}
                  aria-label={`Agendar em ${barbearia.nome}`}
                >
                  <span className="booking-option-topline">Barbearia disponível</span>
                  <strong>{barbearia.nome}</strong>
                  <p>{barbearia.descricao || 'Escolha esta unidade para consultar a agenda.'}</p>
                  {barbearia.endereco && <address>{barbearia.endereco}</address>}
                  <b>Ver horários <span aria-hidden="true">↗</span></b>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
