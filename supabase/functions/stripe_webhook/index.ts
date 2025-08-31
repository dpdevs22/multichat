import { serve } from '@supabase/functions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' })

serve(async (req: Request) => {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature') as string
    const secret = process.env.STRIPE_WEBHOOK_SECRET as string
    const event = stripe.webhooks.constructEvent(body, sig, secret)

    console.log('Stripe event:', event.type)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err: any) {
    console.error('Stripe webhook error:', err?.message || err)
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 })
  }
})
