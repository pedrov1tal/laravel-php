import { Button } from '@/components/ui/button'

interface EstadoFeedbackProps {
  titulo: string
  descricao: string
  acao?: { rotulo: string; onClick: () => void }
  carregando?: boolean
}

export function EstadoFeedback({
  titulo,
  descricao,
  acao,
  carregando = false,
}: EstadoFeedbackProps) {
  return (
    <section
      className="booking-feedback"
      role={carregando ? 'status' : 'alert'}
      aria-live="polite"
    >
      <p className="booking-kicker">
        {carregando ? 'Carregando' : 'Atenção'}
      </p>
      <h2>{titulo}</h2>
      <p>{descricao}</p>
      {acao && (
        <Button
          variant="unstyled"
          className="booking-text-action"
          type="button"
          onClick={acao.onClick}
        >
          {acao.rotulo}
        </Button>
      )}
    </section>
  )
}
