const { createClient } = require('@supabase/supabase-js')
const { WebcastPushConnection } = require('tiktok-live-connector')
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, { auth: { persistSession: false }})

async function main() {
  const { data: links, error } = await sb.from('linked_accounts').select('*').eq('platform','tiktok')
  if (error) throw error
  for (const link of links) {
    if (!link.username) continue
    const tiktok = new WebcastPushConnection(link.username)
    console.log('Connecting to TikTok', link.username)
    tiktok.connect().then(s => console.log('[TT] Connected', s.roomId)).catch(err => console.error('TT connect error', err))

    tiktok.on('chat', async (d) => {
      await sb.from('chat_messages').insert({ user_id: link.user_id, platform: 'tiktok', message_id: String(d.msgId||Date.now()), timestamp: new Date().toISOString(), chatter_name: d?.uniqueId || 'unknown', text: d?.comment || '' })
    })
    tiktok.on('gift', async (d) => {
      await sb.from('platform_events').insert({ user_id: link.user_id, platform: 'tiktok', event_type: 'gift', amount: d?.repeatCount || 1, metadata: d, timestamp: new Date().toISOString() })
    })
    tiktok.on('follow', async (d) => {
      await sb.from('platform_events').insert({ user_id: link.user_id, platform: 'tiktok', event_type: 'follow', metadata: d, timestamp: new Date().toISOString() })
    })
  }
}
main().catch(e=>{ console.error(e); process.exit(1) })
