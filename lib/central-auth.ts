export interface AuthAccount {
  id: string
  email: string
  name: string
  coins: number
  tokens: number
  xp: number
  level: number
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthResponse {
  success: boolean
  session?: AuthSession
  account?: AuthAccount
  error?: string
}

// Login via local proxy (avoids CORS/mixed content issues)
export async function centralLogin(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return response.json()
}

// Register via local proxy
export async function centralRegister(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  return response.json()
}

// Get current user
export async function getCurrentUser(accessToken: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })
  return response.json()
}
