import { supabaseAdmin } from './supabaseServer'

export type NormalizedChat = {
  user_id: string,
  platform: string,
  message_id?: string,
  timestamp?: string,
  chatter_name?: string,
  text?: string,
  is_action?: boolean
}

export type NormalizedEvent = {
  user_id: string,
  platform: string,
  event_type: string,
  amount?: number,
  timestamp?: string,
  metadata?: any,
  from_user?: string
}

export async function insertChat(c: NormalizedChat) {
  const sb = supabaseAdmin()
  return sb.from('chat_messages').insert({
    user_id: c.user_id,
    platform: c.platform,
    message_id: c.message_id,
    timestamp: c.timestamp || new Date().toISOString(),
    chatter_name: c.chatter_name,
    text: c.text,
    is_action: c.is_action || false
  })
}

export async function insertEvent(e: NormalizedEvent) {
  const sb = supabaseAdmin()
  return sb.from('platform_events').insert({
    user_id: e.user_id,
    platform: e.platform,
    event_type: e.event_type,
    amount: e.amount,
    metadata: e.metadata || null,
    from_user: e.from_user || null,
    timestamp: e.timestamp || new Date().toISOString()
  })
}
