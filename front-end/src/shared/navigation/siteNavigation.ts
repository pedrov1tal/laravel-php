import { CalendarCheck, Layers3, ListChecks, Scissors, Users } from 'lucide-react'
import type { TubelightNavItem } from '../components/TubelightNavbar'

export const siteNavigationItems: TubelightNavItem[] = [
  { name: 'Recursos', url: '/#recursos', icon: Layers3 },
  { name: 'Como funciona', url: '/#como-funciona', icon: ListChecks },
  { name: 'Planos', url: '/#planos', icon: Scissors },
  { name: 'Clientes', url: '/#clientes', icon: Users },
  { name: 'Agendar', url: '/agendar', icon: CalendarCheck },
]
