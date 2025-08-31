import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!url || !serviceKey) {
  console.warn('[supabaseServer] Missing Supabase env vars')
}

export const supabaseAdmin: SupabaseClient = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})

export function getSupabaseAdmin(): SupabaseClient {
  return supabaseAdmin
}
