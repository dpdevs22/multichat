'use client'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { platformIcon, Platform } from '@/src/lib/platforms'

export type ChatMessage = {
  id: string
  platform: Platform
  timestamp: string
  chatter_name: string
  text: string
}
export default function ChatList() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  useEffect(() => {
    const sse = new EventSource('/api/chat/stream')
    sse.onmessage = (ev) => {
      try { setMessages(p => [...p.slice(-299), JSON.parse(ev.data)]) } catch {}
    }
    return () => sse.close()
  }, [])
  return (
    <div className="card mono text-sm space-y-2 max-h-[70vh] overflow-auto">
      {messages.map(m => (
        <div key={m.id} className="flex gap-2">
          <div className="w-24 shrink-0 text-neutral-400">{dayjs(m.timestamp).format('HH:mm:ss')}</div>
          <div className="w-8 shrink-0 text-neutral-300">{platformIcon[m.platform]}</div>
          <div className="w-48 shrink-0 text-neutral-200 truncate">{m.chatter_name}</div>
          <div className="flex-1">{m.text}</div>
        </div>
      ))}
      {messages.length===0 && <div className="text-neutral-400">No messages yet…</div>}
    </div>
  )
}
