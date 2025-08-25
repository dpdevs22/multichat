import { stripe } from '@/src/lib/stripe'
import { NextRequest } from 'next/server'
export async function POST(req: NextRequest) {
  const priceId = process.env.STRIPE_PRICE_ID!
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/profile?success=1`,
    cancel_url: `${origin}/profile?canceled=1`,
  })
  return Response.redirect(session.url!, 303)
}
