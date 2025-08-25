import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabaseServer'
import { originFromHeaders, redirectUri } from '@/src/lib/oauth'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) return new Response('Missing code/state', { status: 400 })

  const sb = supabaseAdmin
  const { data: states, error: stErr } = await sb.from('oauth_states').select('*').eq('state', state).eq('platform','youtube').limit(1)
  if (stErr || !states || states.length===0) return new Response('Invalid state', { status: 400 })
  const user_id = states[0].user_id

  const origin = originFromHeaders(req.headers)
  const redirect = redirectUri(origin, 'youtube')

  // Token exchange
  const body = new URLSearchParams()
  body.set('client_id', process.env.GOOGLE_CLIENT_ID!)
  body.set('client_secret', process.env.GOOGLE_CLIENT_SECRET!)
  body.set('code', code)
  body.set('grant_type', 'authorization_code')
  body.set('redirect_uri', redirect)

  const tokenRes = await fetch(`https://oauth2.googleapis.com/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  })
  if (!tokenRes.ok) return new Response('Token exchange failed', { status: 500 })
  const token = await tokenRes.json() as any
  const access_token = token.access_token
  const refresh_token = token.refresh_token

  // User info
  let external_user_id = ''
  let username = ''
  if ('youtube' === 'twitch') {
    const u = await fetch('https://api.twitch.tv/helix/users', {
      headers: { 'Authorization': `Bearer ${access_token}`, 'Client-Id': process.env.TWITCH_CLIENT_ID! }
    })
    const j = await u.json()
    const me = j.data?.[0]
    external_user_id = me?.id || ''
    username = me?.display_name || me?.login || ''
  } else if ('youtube' === 'youtube') {
    const u = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const me = await u.json()
    external_user_id = me?.sub || ''
    username = me?.name || me?.email || ''
  } else if ('youtube' === 'discord') {
    const u = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const me = await u.json()
    external_user_id = me?.id || ''
    username = me?.username || ''
  } else if ('youtube' === 'tiktok') {
    const u = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const j = await u.json() as any
    const me = j?.data?.user || j?.data
    external_user_id = me?.open_id || ''
    username = me?.display_name || me?.username || ''
  }

  const { error: upErr } = await sb.from('linked_accounts').upsert({
    user_id, platform: 'youtube', external_user_id, access_token, refresh_token, username
  }, { onConflict: 'user_id,platform' } as any)
  if (upErr) return new Response(upErr.message, { status: 500 })

  await sb.from('oauth_states').delete().eq('state', state)

  return Response.redirect(origin + '/profile?linked=youtube', 302)
}
