import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: redirect to Trovo OAuth authorize URL
  return new Response('OAuth start for trovo not implemented', { status: 501 })
}
