import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabaseServer'
import { originFromHeaders, redirectUri, randomState } from '@/src/lib/oauth'

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return new Response('Missing uid', { status: 400 })
  const origin = originFromHeaders(req.headers)
  const redirect = redirectUri(origin, 'discord')
  const state = randomState()
  // Save state
  const sb = supabaseAdmin()
  const { error } = await sb.from('oauth_states').insert({ state, user_id: uid, platform: 'discord' })
  if (error) return new Response(error.message, { status: 500 })

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: redirect,
    response_type: 'code',
    scope: `identify`,
    state,
  })


  params.set("response_type","code");
  const authUrl = `https://discord.com/api/oauth2/authorize` + ( `?` + params.toString() )
  return Response.redirect(authUrl, 302)
}
