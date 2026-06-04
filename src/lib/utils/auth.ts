import { createClient } from '$lib/supabase/client'

export function signInWithGoogle() {
  document.cookie = `auth_redirect=/; path=/; max-age=300; SameSite=Lax`
  const supabase = createClient()
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
