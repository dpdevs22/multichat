import { stripe } from '@/src/lib/stripe'
import { NextRequest } from 'next/server'
export async function POST(req: NextRequest) {
  const customerId = req.headers.get('x-demo-customer') || undefined
  if (!customerId) return new Response('Missing customer', { status: 400 })
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${origin}/profile` })
  return Response.redirect(portal.url, 303)
}
