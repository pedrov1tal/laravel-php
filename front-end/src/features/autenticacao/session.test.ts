import { beforeEach, describe, expect, it } from 'vitest'
import {
  autenticarUsuario,
  cadastrarUsuario,
  destinoSeguro,
  encerrarSessao,
  obterUsuarioAutenticado,
} from './session'

describe('sessão simulada do cliente', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cadastra o perfil e inicia a sessão com os dados completos', () => {
    const usuario = cadastrarUsuario({
      nome: 'Ana Souza',
      email: 'ANA@EXEMPLO.COM',
      telefone: '(11) 99999-0000',
    })

    expect(usuario).toMatchObject({
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      telefone: '(11) 99999-0000',
    })
    expect(obterUsuarioAutenticado()).toEqual(usuario)
  })

  it('autentica somente um perfil previamente cadastrado', () => {
    cadastrarUsuario({
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      telefone: '(11) 99999-0000',
    })
    encerrarSessao()

    expect(autenticarUsuario('ana@exemplo.com')?.nome).toBe('Ana Souza')
    encerrarSessao()
    expect(autenticarUsuario('outra@exemplo.com')).toBeNull()
  })

  it('aceita apenas retornos internos seguros', () => {
    expect(destinoSeguro('/agendar?estabelecimento=estudio-central')).toBe(
      '/agendar?estabelecimento=estudio-central',
    )
    expect(destinoSeguro('https://site-malicioso.example')).toBe('/')
    expect(destinoSeguro('//site-malicioso.example')).toBe('/')
    expect(destinoSeguro(null)).toBe('/')
  })
})
