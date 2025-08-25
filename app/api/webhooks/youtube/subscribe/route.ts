import { NextRequest } from 'next/server'
import { redirectUri } from '@/src/lib/oauth'

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const url = new URL(req.url)
  const channelId = (await req.json()).channelId
  if (!channelId) return new Response('Missing channelId', { status: 400 })

  // PubSubHubbub hub endpoint
  const hub = 'https://pubsubhubbub.appspot.com/subscribe'
  const callback = `${origin}/api/webhooks/youtube`
  const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`

  const body = new URLSearchParams()
  body.set('hub.mode', 'subscribe')
  body.set('hub.topic', topic)
  body.set('hub.callback', callback)
  body.set('hub.verify', 'async')

  const res = await fetch(hub, { method: 'POST', body })
  if (!res.ok) return new Response('Subscribe failed', { status: 500 })
  return new Response('subscribed', { status: 200 })
}
