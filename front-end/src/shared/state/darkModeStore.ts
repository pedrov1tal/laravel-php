import { useSyncExternalStore } from 'react'

interface EstadoDarkMode {
  modoEscuro: boolean
}

type Listener = () => void

const CHAVE_MODO_ESCURO = 'nexo:modo-escuro'

function lerModoEscuroSalvo() {
  return typeof window !== 'undefined' && window.localStorage.getItem(CHAVE_MODO_ESCURO) === 'true'
}

const estadoInicial: EstadoDarkMode = { modoEscuro: lerModoEscuroSalvo() }
let estadoAtual = estadoInicial
const listeners = new Set<Listener>()

function assinar(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function obterEstado() {
  return estadoAtual
}

function aplicarTema(modoEscuro: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = modoEscuro ? 'dark' : 'light'
  }
}

aplicarTema(estadoInicial.modoEscuro)

export function definirModoEscuro(modoEscuro: boolean) {
  if (estadoAtual.modoEscuro === modoEscuro) return

  estadoAtual = { modoEscuro }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CHAVE_MODO_ESCURO, String(modoEscuro))
  }
  aplicarTema(modoEscuro)
  listeners.forEach((listener) => listener())
}

export function useDarkModeStore<T>(seletor: (estado: EstadoDarkMode) => T): T {
  return useSyncExternalStore(
    assinar,
    () => seletor(obterEstado()),
    () => seletor(estadoInicial),
  )
}