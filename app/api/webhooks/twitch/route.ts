import { NextRequest } from 'next/server'
import { insertChat, insertEvent } from '@/src/lib/ingest'

// Twitch EventSub verification + notification handler
// Docs: https://dev.twitch.tv/docs/eventsub
export async function POST(req: NextRequest) {
  const signature = req.headers.get('Twitch-Eventsub-Message-Signature') || req.headers.get('twitch-eventsub-message-signature')
  const messageId = req.headers.get('Twitch-Eventsub-Message-Id') || req.headers.get('twitch-eventsub-message-id')
  const timestamp = req.headers.get('Twitch-Eventsub-Message-Timestamp') || req.headers.get('twitch-eventsub-message-timestamp')
  const secret = process.env.TWITCH_EVENTSUB_SECRET
  const raw = await req.text()

  // Validate required headers
  if (!signature || !messageId || !timestamp || !secret) {
    return new Response('Missing headers or secret', { status: 400 })
  }

  // Compute HMAC SHA256 of messageId + timestamp + body using secret
  const crypto = await import('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(messageId + timestamp + raw)
  const expected = 'sha256=' + hmac.digest('hex')

  // Timing-safe compare
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  if (!ok) return new Response('Invalid signature', { status: 403 })

  // Parse JSON now
  let body
  try { body = JSON.parse(raw) } catch (e) { return new Response('Bad JSON', { status: 400 }) }

  // Handle verification challenge
  if (body.challenge) {
    // Return the challenge string directly (plain text)
    return new Response(body.challenge, { status: 200 })
  }

  // Notifications
  try {
    const { subscription, event } = body
    const platform = 'twitch'
    if (subscription?.type?.includes('channel.follow')) {
      await insertEvent({ user_id: String(event.broadcaster_user_id), platform, event_type: 'follow', from_user: event.user_name || null })
    } else if (subscription?.type?.includes('channel.subscribe')) {
      await insertEvent({ user_id: String(event.broadcaster_user_id), platform, event_type: 'subscribe', from_user: event.user_name || null })
    } else if (subscription?.type?.includes('channel.cheer') || subscription?.type?.includes('bits')) {
      await insertEvent({ user_id: String(event.broadcaster_user_id), platform, event_type: 'gift', amount: event.bits || undefined, from_user: event.user_name || null })
    } else if (subscription?.type?.includes('channel.unban') || subscription?.type?.includes('channel.ban')) {
      // ignore for now
    }
    // Add more mappings as desired
  } catch (err:any) {
    console.error('twitch webhook processing error', err)
    return new Response('error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
