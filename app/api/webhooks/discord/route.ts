import { NextRequest } from 'next/server'
import { insertChat, insertEvent } from '@/src/lib/ingest'

// Use this endpoint to receive events from a Discord bot or interaction webhook.
// For bot messages, you'll likely post to this route from your bot process.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null)
  if (!body) return new Response('Bad request', { status: 400 })

  try {
    // Example payloads supported:
    // { kind: 'message', channelOwnerId: '<creator-supabase-uuid>', author: 'Name', content: 'hello' }
    // { kind: 'gift', channelOwnerId: '<creator-uuid>', from: 'user', amount: 1 }
    if (body.kind === 'message') {
      await insertChat({
        user_id: body.channelOwnerId,
        platform: 'discord',
        message_id: body.id || undefined,
        timestamp: body.timestamp,
        chatter_name: body.author,
        text: body.content
      })
    } else {
      await insertEvent({
        user_id: body.channelOwnerId,
        platform: 'discord',
        event_type: body.kind,
        amount: body.amount,
        from_user: body.from,
        metadata: body
      })
    }
  } catch (err:any) {
    console.error('discord webhook error', err)
    return new Response('error', { status: 500 })
  }

  return new Response('ok')
}
