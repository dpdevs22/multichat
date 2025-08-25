
/**
 * Example Supabase Edge Function that accepts a provider-specific payload,
 * normalizes it, and POSTs to your Next.js webhook ingestion endpoint or
 * directly writes to Supabase using a service key (not shown here).
 *
 * This file is illustrative — deploy it to Supabase Functions and wire your
 * external webhooks to it if you prefer the normalization to happen inside Supabase.
 */

import { serve } from 'std/server'

serve(async (req) => {
  try {
    const body = await req.json().catch(()=>null)
    if (!body) return new Response('bad', { status: 400 })

    // Simple normalization example for a made-up provider shape
    const normalized = {
      kind: body.type || 'unknown',
      user_id: body.target_user_id,
      platform: body.provider || 'unknown',
      payload: body
    }

    // In production: validate, map, and insert into DB.
    return new Response(JSON.stringify({ normalized }), { status: 200 })
  } catch (err) {
    return new Response('error', { status: 500 })
  }
})
