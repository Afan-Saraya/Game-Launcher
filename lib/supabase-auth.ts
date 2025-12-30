import { createBrowserClient } from '@supabase/ssr'

let authClient: ReturnType<typeof createBrowserClient> | null = null

export function createAuthSupabaseClient() {
  if (typeof window !== 'undefined') {
    if (!authClient) {
      authClient = createBrowserClient(
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
        {
          cookieOptions: {
            name: 'sb-auth-token',
          },
        }
      )
    }
    return authClient
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_AUTH_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token',
      },
    }
  )
}
