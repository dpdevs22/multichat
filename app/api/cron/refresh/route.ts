import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const revalidate = 0

export async function GET(_req: NextRequest) {
  try {
    const sb = supabaseAdmin
    await sb.from('system_heartbeats').insert({ source: 'cron:refresh', created_at: new Date().toISOString() })
    return new Response('ok', { status: 200 })
  } catch (e: any) {
    return new Response(e.message || 'error', { status: 500 })
  }
}
