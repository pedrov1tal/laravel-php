const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function dataLocal(dataIso: string) {
  const [ano, mes, dia] = dataIso.split('-').map(Number)
  return new Date(ano, mes - 1, dia, 12)
}

export function formatarPreco(precoCentavos: number) {
  return moeda.format(precoCentavos / 100)
}

export function formatarDuracao(minutos: number) {
  const horas = Math.floor(minutos / 60)
  const restante = minutos % 60

  if (!horas) return `${restante} min`
  return restante ? `${horas}h ${restante} min` : `${horas}h`
}

export function formatarDataLonga(dataIso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(dataLocal(dataIso))
}

export function formatarDiaSemana(dataIso: string) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(
    dataLocal(dataIso),
  )
}

export function formatarDiaMes(dataIso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(
    dataLocal(dataIso),
  )
}
