import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // TODO: exchange code for tokens, store in linked_accounts
  return new Response('OAuth callback for trovo not implemented', { status: 501 })
}
