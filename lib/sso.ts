const ACCOUNTS_ORIGIN = process.env.NEXT_PUBLIC_ACCOUNTS_ORIGIN || 'https://accounts.sarayasolutions.com'
const SSO_LINK_ENDPOINT = process.env.NEXT_PUBLIC_SSO_LINK_URL || `${ACCOUNTS_ORIGIN}/api/auth/sso-link`

export async function linkCentralSession(session?: { access_token: string; refresh_token: string } | null) {
  if (!session?.access_token || !session?.refresh_token) return

  try {
    await fetch(SSO_LINK_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      }),
    })
  } catch (error) {
    console.warn('Failed to link central SSO session', error)
  }
}
