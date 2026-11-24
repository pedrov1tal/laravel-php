import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { definirModoEscuro, useDarkModeStore } from '../state/darkModeStore'

interface ThemeToggleButtonProps {
  className: string
  mostrarTexto?: boolean
}

export function ThemeToggleButton({ className, mostrarTexto = false }: ThemeToggleButtonProps) {
  const modoEscuro = useDarkModeStore((estado) => estado.modoEscuro)
  const rotulo = modoEscuro ? 'Ativar modo claro' : 'Ativar modo escuro'

  return (
    <Button
      variant="unstyled"
      className={className}
      type="button"
      aria-label={rotulo}
      aria-pressed={modoEscuro}
      title={rotulo}
      onClick={() => definirModoEscuro(!modoEscuro)}
    >
      {modoEscuro
        ? <Sun size={17} aria-hidden="true" />
        : <Moon size={17} aria-hidden="true" />}
      {mostrarTexto && <span>{modoEscuro ? 'Modo claro' : 'Modo escuro'}</span>}
    </Button>
  )
}
