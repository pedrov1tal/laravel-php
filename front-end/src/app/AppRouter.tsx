import { Navigate, Route, Routes } from 'react-router-dom'
import App, { LoginPage, RegisterPage } from '../App'
import { AgendarPage } from '../features/agendamentos'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route path="/agendar" element={<AgendarPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
