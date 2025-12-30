'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { centralLogin, centralRegister, getCurrentUser } from '@/lib/central-auth'
import { createAuthSupabaseClient } from '@/lib/supabase-auth'
import { linkCentralSession } from '@/lib/sso'
import { 
  persistSarayaAccount, 
  readSarayaAccount, 
  clearSarayaAccount,
  persistSarayaSession,
  readSarayaSession,
  SarayaAccount 
} from '@/lib/saraya-account'

interface AuthContextType {
  user: SarayaAccount | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  updateLocalBalance: (coins: number, xp: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SarayaAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    initializeAuth()

    // Listen for account updates
    const handleAccountUpdate = (e: CustomEvent<SarayaAccount>) => {
      setUser(e.detail)
    }
    const handleAccountClear = () => {
      setUser(null)
    }

    window.addEventListener('saraya-account-updated', handleAccountUpdate as EventListener)
    window.addEventListener('saraya-account-cleared', handleAccountClear)

    return () => {
      window.removeEventListener('saraya-account-updated', handleAccountUpdate as EventListener)
      window.removeEventListener('saraya-account-cleared', handleAccountClear)
    }
  }, [])

  const initializeAuth = async () => {
    setIsLoading(true)
    
    // Check localStorage first
    const savedAccount = readSarayaAccount()
    const savedSession = readSarayaSession()
    
    if (savedAccount && savedSession) {
      setUser(savedAccount)
      
      // Verify session is still valid
      try {
        const result = await getCurrentUser(savedSession.access_token)
        if (result.success && result.account) {
          const updatedAccount: SarayaAccount = {
            id: result.account.id,
            email: result.account.email,
            name: result.account.name,
            coins: result.account.coins,
            tokens: result.account.tokens,
            xp: result.account.xp,
            level: result.account.level,
          }
          persistSarayaAccount(updatedAccount)
          setUser(updatedAccount)
        }
      } catch (error) {
        // Session might be expired, but keep local data
        console.warn('Failed to refresh user data')
      }
    }
    
    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    const result = await centralLogin(email, password)
    
    if (result.success && result.session && result.account) {
      // Set session in Supabase auth client
      const supabase = createAuthSupabaseClient()
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      })
      
      // Link SSO session
      await linkCentralSession(result.session)
      
      // Store account and session
      const account: SarayaAccount = {
        id: result.account.id,
        email: result.account.email,
        name: result.account.name,
        coins: result.account.coins,
        tokens: result.account.tokens,
        xp: result.account.xp,
        level: result.account.level,
      }
      
      persistSarayaAccount(account)
      persistSarayaSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_at: result.session.expires_at,
      })
      
      setUser(account)
      return { success: true }
    }
    
    return { success: false, error: result.error || 'Login failed' }
  }

  const register = async (email: string, password: string, name: string) => {
    const result = await centralRegister(email, password, name)
    
    if (result.success && result.session && result.account) {
      // Same flow as login
      const supabase = createAuthSupabaseClient()
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      })
      
      await linkCentralSession(result.session)
      
      const account: SarayaAccount = {
        id: result.account.id,
        email: result.account.email,
        name: result.account.name,
        coins: result.account.coins,
        tokens: result.account.tokens,
        xp: result.account.xp,
        level: result.account.level,
      }
      
      persistSarayaAccount(account)
      persistSarayaSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
        expires_at: result.session.expires_at,
      })
      
      setUser(account)
      return { success: true }
    }
    
    return { success: false, error: result.error || 'Registration failed' }
  }

  const logout = () => {
    clearSarayaAccount()
    setUser(null)
  }

  const refreshUser = async () => {
    const session = readSarayaSession()
    if (!session) return
    
    try {
      const result = await getCurrentUser(session.access_token)
      if (result.success && result.account) {
        const updatedAccount: SarayaAccount = {
          id: result.account.id,
          email: result.account.email,
          name: result.account.name,
          coins: result.account.coins,
          tokens: result.account.tokens,
          xp: result.account.xp,
          level: result.account.level,
        }
        persistSarayaAccount(updatedAccount)
        setUser(updatedAccount)
      }
    } catch (error) {
      console.error('Failed to refresh user')
    }
  }

  const updateLocalBalance = (coins: number, xp: number) => {
    if (!user) return
    const updated = {
      ...user,
      coins: user.coins + coins,
      xp: user.xp + xp,
    }
    persistSarayaAccount(updated)
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      updateLocalBalance,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
