import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { encerrarSessao } from '../autenticacao/session'
import './admin-sidebar.css'

type AdminSection =
  | 'dashboard'
  | 'agenda'
  | 'barbeiros'
  | 'servicos'
  | 'clientes'
  | 'configuracoes'

interface AdminSidebarProps {
  slug: string
  active: AdminSection
  nomeUsuario: string
  contexto?: string
}

const opcoes: Array<{ id: AdminSection; nome: string; rota: string }> = [
  { id: 'dashboard', nome: 'Dashboard', rota: 'dashboard' },
  { id: 'agenda', nome: 'Agenda', rota: 'agenda' },
  { id: 'barbeiros', nome: 'Barbeiros', rota: 'barbeiros' },
  { id: 'servicos', nome: 'Serviços', rota: 'servicos' },
  { id: 'clientes', nome: 'Clientes', rota: 'clientes' },
  { id: 'configuracoes', nome: 'Configurações', rota: 'configuracoes' },
]

export function AdminSidebar({
  slug,
  active,
  nomeUsuario,
  contexto = 'Administração',
}: AdminSidebarProps) {
  const [menuAberto, setMenuAberto] = useState(false)

  function sair() {
    encerrarSessao()
    window.location.replace('/')
  }

  return (
    <>
      <header className="admin-mobile-header">
        <Link className="admin-mobile-brand" to={`/admin/${slug}/dashboard`} aria-label="Abrir dashboard">
          <span>CR</span>
          <strong>Barbearia</strong>
        </Link>
        <div className="admin-mobile-context">
          <strong>{contexto}</strong>
          <span>Administração</span>
        </div>
        <Button
          variant="unstyled"
          className="admin-menu-button"
          type="button"
          aria-controls="admin-navigation"
          aria-expanded={menuAberto}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          {menuAberto ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </header>
      {menuAberto && (
        <Button
          variant="unstyled"
          className="admin-mobile-backdrop"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      )}
      <aside
        className={`admin-sidebar${menuAberto ? ' is-open' : ''}`}
        id="admin-navigation"
      >
        <Link className="admin-brand" to={`/admin/${slug}/dashboard`}>
          <span>CR</span> Barbearia
        </Link>
        <nav aria-label="Navegação administrativa">
          {opcoes.map((opcao) => (
            <Link
              className={active === opcao.id ? 'active' : undefined}
              to={`/admin/${slug}/${opcao.rota}`}
              key={opcao.id}
              aria-current={active === opcao.id ? 'page' : undefined}
              onClick={() => setMenuAberto(false)}
            >
              {opcao.nome}
            </Link>
          ))}
        </nav>
        <div className="admin-account">
          <strong>{nomeUsuario}</strong>
          <span>{contexto}</span>
          <Link to="/">Ir para a home</Link>
          <Button
            variant="unstyled"
            className="admin-logout"
            type="button"
            onClick={sair}
          >
            <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
            Sair da conta
          </Button>
        </div>
      </aside>
    </>
  )
}
