import { useState } from 'react'
import './App.css'

type ConnectionState = 'idle' | 'loading' | 'success' | 'error'
type HealthResponse = { status: string; message: string; timestamp: string }

const apiUrl = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [state, setState] = useState<ConnectionState>('idle')
  const [response, setResponse] = useState<HealthResponse | null>(null)
  const [error, setError] = useState('')

  async function testConnection() {
    setState('loading')
    setResponse(null)
    setError('')

    try {
      const result = await fetch(`${apiUrl}/v1/health`)
      if (!result.ok) throw new Error(`A API respondeu com status ${result.status}.`)
      setResponse((await result.json()) as HealthResponse)
      setState('success')
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : 'Não foi possível conectar ao backend.')
      setState('error')
    }
  }

  return (
    <main className="connection-page">
      <section className="connection-panel" aria-labelledby="page-title">
        <p className="eyebrow">Barbearia · integração</p>
        <h1 id="page-title">Teste de conexão</h1>
        <p className="description">Verifique se o frontend React consegue acessar a API Laravel.</p>
        <button type="button" onClick={testConnection} disabled={state === 'loading'}>
          {state === 'loading' ? 'Testando conexão...' : 'Testar conexão'}
        </button>
        <div className={`result result-${state}`} role="status" aria-live="polite">
          {state === 'idle' && <span>Clique no botão para iniciar o teste.</span>}
          {state === 'loading' && <span>Consultando {apiUrl}/v1/health</span>}
          {state === 'success' && response && <><strong>Conexão funcionando</strong><span>{response.message}</span><small>Resposta recebida em {new Date(response.timestamp).toLocaleString('pt-BR')}</small></>}
          {state === 'error' && <><strong>Falha na conexão</strong><span>{error}</span></>}
        </div>
      </section>
    </main>
  )
}

export default App
