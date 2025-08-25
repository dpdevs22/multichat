import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/src/lib/supabaseServer'
import { originFromHeaders, redirectUri, randomState } from '@/src/lib/oauth'

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid')
  if (!uid) return new Response('Missing uid', { status: 400 })
  const origin = originFromHeaders(req.headers)
  const redirect = redirectUri(origin, 'tiktok')
  const state = randomState()
  // Save state
  const sb = supabaseAdmin
  const { error } = await sb.from('oauth_states').insert({ state, user_id: uid, platform: 'tiktok' })
  if (error) return new Response(error.message, { status: 500 })

  const params = new URLSearchParams({
    client_id: process.env.TIKTOK_CLIENT_KEY!,
    redirect_uri: redirect,
    response_type: 'code',
    scope: `user.info.basic`,
    state,
  })


  params.set("response_type","code");
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/` + ( `?` + params.toString() )
  return Response.redirect(authUrl, 302)
}
