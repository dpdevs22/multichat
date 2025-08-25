import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: redirect to Facebook OAuth authorize URL
  return new Response('OAuth start for facebook not implemented', { status: 501 })
}
