import { useState, type FormEvent } from 'react'
import { validarDadosCliente } from '../state/agendamentoReducer'
import type { DadosCliente } from '../types/agendamento'

interface DadosClienteFormProps {
  valor: DadosCliente
  onChange: (cliente: DadosCliente) => void
  onContinuar: () => void
}

export function DadosClienteForm({
  valor,
  onChange,
  onContinuar,
}: DadosClienteFormProps) {
  const [erros, setErros] = useState<
    Partial<Record<keyof DadosCliente, string>>
  >({})

  function atualizar(campo: keyof DadosCliente, novoValor: string) {
    onChange({ ...valor, [campo]: novoValor })
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const novosErros = validarDadosCliente(valor)
    setErros(novosErros)
    if (Object.keys(novosErros).length === 0) onContinuar()
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      <div className="booking-field">
        <label htmlFor="cliente-nome">Nome</label>
        <input
          id="cliente-nome"
          autoComplete="name"
          value={valor.nome}
          aria-invalid={Boolean(erros.nome)}
          aria-describedby={erros.nome ? 'erro-nome' : undefined}
          onChange={(event) => atualizar('nome', event.target.value)}
        />
        {erros.nome && (
          <p id="erro-nome" className="booking-field-error">
            {erros.nome}
          </p>
        )}
      </div>

      <div className="booking-field">
        <label htmlFor="cliente-telefone">Telefone</label>
        <input
          id="cliente-telefone"
          autoComplete="tel"
          inputMode="tel"
          value={valor.telefone}
          aria-invalid={Boolean(erros.telefone)}
          aria-describedby={erros.telefone ? 'erro-telefone' : undefined}
          onChange={(event) => atualizar('telefone', event.target.value)}
        />
        {erros.telefone && (
          <p id="erro-telefone" className="booking-field-error">
            {erros.telefone}
          </p>
        )}
      </div>

      <div className="booking-field">
        <label htmlFor="cliente-email">
          E-mail <span>opcional</span>
        </label>
        <input
          id="cliente-email"
          type="email"
          autoComplete="email"
          value={valor.email}
          aria-invalid={Boolean(erros.email)}
          aria-describedby={erros.email ? 'erro-email' : undefined}
          onChange={(event) => atualizar('email', event.target.value)}
        />
        {erros.email && (
          <p id="erro-email" className="booking-field-error">
            {erros.email}
          </p>
        )}
      </div>

      <div className="booking-actions">
        <button className="booking-primary-action" type="submit">
          Continuar para revisão
        </button>
      </div>
    </form>
  )
}
