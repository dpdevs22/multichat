import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { originFromHeaders, redirectUri } from '@/lib/oauth'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (!code || !state) return new Response('Missing code/state', { status: 400 })

    const sb = supabaseAdmin
    const { data: states, error: stErr } = await sb.from('oauth_states').select('*').eq('state', state).eq('platform','discord').limit(1)
    if (stErr || !states || states.length===0) return new Response('Invalid state', { status: 400 })
    const user_id = states[0].user_id

    const origin = originFromHeaders(req.headers)
    const redirect = redirectUri(origin, 'discord')

    // Token exchange
    const body = new URLSearchParams()
    body.set('client_id', process.env.DISCORD_CLIENT_ID!)
    body.set('client_secret', process.env.DISCORD_CLIENT_SECRET!)
    body.set('code', code!)
    body.set('grant_type', 'authorization_code')
    body.set('redirect_uri', redirect)

    const tokenRes = await fetch(`https://discord.com/api/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    if (!tokenRes.ok) return new Response('Token exchange failed', { status: 500 })
    const token = await tokenRes.json() as any
    const access_token = token.access_token
    const refresh_token = token.refresh_token

    // User info
    const u = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    })
    const me = await u.json()

    const external_user_id = me?.id || ''
    const username = me?.username || ''

    const { error: upErr } = await sb.from('linked_accounts').upsert({
      user_id, platform: 'discord', external_user_id, access_token, refresh_token, username
    }, { onConflict: 'user_id,platform' } as any)
    if (upErr) return new Response(upErr.message, { status: 500 })

    await sb.from('oauth_states').delete().eq('state', state)

    return Response.redirect(origin + '/profile?linked=discord', 302)
  } catch (e: any) {
    console.error('OAuth discord error:', e)
    return new Response('Internal error', { status: 500 })
  }
}
