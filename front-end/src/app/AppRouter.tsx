import { Navigate, Route, Routes } from 'react-router-dom'
import App, { LoginPage, RegisterPage } from '../App'
import { AgendarPage } from '../features/agendamentos'
import { ContaPage } from '../features/autenticacao/ContaPage'
import { DashboardPage } from '../features/admin/DashboardPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/conta" element={<ContaPage />} />
      <Route path="/agendar" element={<AgendarPage />} />
      <Route path="/admin/:slug/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
