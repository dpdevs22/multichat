import { stripe } from '@/src/lib/stripe'
import { NextRequest } from 'next/server'
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature') as string
  const text = await req.text()
  try {
    const event = stripe.webhooks.constructEvent(text, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    console.log('stripe event', event.type)
  } catch (err:any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
  return new Response('ok')
}
