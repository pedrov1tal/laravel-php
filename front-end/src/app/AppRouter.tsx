import { Navigate, Route, Routes } from 'react-router-dom'
import App, { LoginPage, RegisterPage } from '../App'
import { AgendarPage } from '../features/agendamentos'
import { ContaPage } from '../features/autenticacao/ContaPage'
import { DashboardPage } from '../features/admin/DashboardPage'
import { ServicosPage } from '../features/admin/ServicosPage'
import { ClientesPage } from '../features/admin/ClientesPage'
import { BarbeirosPage } from '../features/admin/BarbeirosPage'
import { ConfiguracoesPage } from '../features/admin/ConfiguracoesPage'
import { AgendaPage } from '../features/admin/AgendaPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/conta" element={<ContaPage />} />
      <Route path="/agendar" element={<AgendarPage />} />
      <Route path="/admin/:slug/dashboard" element={<DashboardPage />} />
      <Route path="/admin/:slug/agenda" element={<AgendaPage />} />
      <Route path="/admin/:slug/servicos" element={<ServicosPage />} />
      <Route path="/admin/:slug/clientes" element={<ClientesPage />} />
      <Route path="/admin/:slug/barbeiros" element={<BarbeirosPage />} />
      <Route path="/admin/:slug/configuracoes" element={<ConfiguracoesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
