import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabaseServer'
import { originFromHeaders, redirectUri } from '@/src/lib/oauth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) return new Response('Missing code/state', { status: 400 })

  const sb = supabaseAdmin
  const { data: states, error: stErr } = await sb
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .eq('platform', 'tiktok')
    .limit(1)

  if (stErr || !states || states.length === 0) return new Response('Invalid state', { status: 400 })
  const user_id = states[0].user_id

  const origin = originFromHeaders(req.headers)
  const redirect = redirectUri(origin, 'tiktok')

  // Token exchange
  const body = new URLSearchParams()
  body.set('client_key', process.env.TIKTOK_CLIENT_KEY!)
  body.set('client_secret', process.env.TIKTOK_CLIENT_SECRET!)
  body.set('code', code)
  body.set('grant_type', 'authorization_code')
  body.set('redirect_uri', redirect)

  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  if (!tokenRes.ok) return new Response('Token exchange failed', { status: 500 })
  const token = (await tokenRes.json()) as any
  const access_token = token.access_token
  const refresh_token = token.refresh_token

  // Fetch TikTok user info
  const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/', {
    headers: { Authorization: `Bearer ${access_token}` }
  })
  if (!userRes.ok) return new Response('Failed to fetch user info', { status: 500 })
  const userData = (await userRes.json()) as any
  const user = userData?.data?.user || userData?.data
  const external_user_id = user?.open_id || ''
  const username = user?.display_name || user?.username || ''

  // Upsert linked account
  const { error: upErr } = await sb.from('linked_accounts').upsert(
    { user_id, platform: 'tiktok', external_user_id, access_token, refresh_token, username },
    { onConflict: 'user_id,platform' } as any
  )
  if (upErr) return new Response(upErr.message, { status: 500 })

  // Delete the state entry
  await sb.from('oauth_states').delete().eq('state', state)

  // Redirect to profile
  return Response.redirect(origin + '/profile?linked=tiktok', 302)
}
