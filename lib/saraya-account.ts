'use client'

const STORAGE_KEY = 'saraya_account'
const SESSION_KEY = 'saraya_session'

export interface SarayaAccount {
  id: string
  email: string
  name: string
  coins: number
  tokens: number
  xp: number
  level: number
}

export interface SarayaSession {
  access_token: string
  refresh_token: string
  expires_at?: number
}

export function persistSarayaAccount(account: SarayaAccount | null) {
  if (typeof window === 'undefined') return
  if (!account) {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('saraya-account-cleared'))
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
  window.dispatchEvent(new CustomEvent('saraya-account-updated', { detail: account }))
}

export function readSarayaAccount(): SarayaAccount | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSarayaAccount() {
  persistSarayaAccount(null)
  clearSarayaSession()
}

export function persistSarayaSession(session: SarayaSession | null) {
  if (typeof window === 'undefined') return
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function readSarayaSession(): SarayaSession | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSarayaSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}
