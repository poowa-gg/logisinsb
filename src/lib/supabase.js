import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Logistix] Missing Supabase env vars.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables.'
  )
}

export const supabase = createClient(
  SUPABASE_URL     || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      // 10 second timeout — prevents hanging forever on slow connections
      fetch: (url, options = {}) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        return fetch(url, { ...options, signal: controller.signal })
          .finally(() => clearTimeout(timeout))
      },
    },
  }
)
