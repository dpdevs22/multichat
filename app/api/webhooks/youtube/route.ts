import { NextRequest } from 'next/server'
import { insertEvent } from '@/src/lib/ingest'

// Handles both GET verification (hub.challenge) and POST notifications from PubSubHubbub
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const challenge = url.searchParams.get('hub.challenge')
  const topic = url.searchParams.get('hub.topic')
  // You should verify mode & topic correspond to what you requested
  if (challenge) return new Response(challenge, { status: 200 })
  return new Response('No challenge', { status: 400 })
}

export async function POST(req: NextRequest) {
  // YouTube sends XML or message bodies; we'll accept JSON forwarded from a middle layer.
  const bodyText = await req.text().catch(()=>null)
  if (!bodyText) return new Response('Bad request', { status: 400 })
  try {
    const json = JSON.parse(bodyText)
    // Example normalized format expected from middle-layer: { type: 'superchat', channelId, user, amount }
    if (json.type === 'superchat' || json.type === 'superchat.received') {
      await insertEvent({ user_id: String(json.channelId), platform: 'youtube', event_type: 'gift', amount: json.amount || 0, from_user: json.user })
    }
  } catch (err) {
    console.error('youtube webhook parse error - not JSON. raw:', bodyText.substring(0,200))
    // If you receive XML PubSubHubbub notification, parse it accordingly in your middle-layer
  }
  return new Response('ok', { status: 200 })
}
