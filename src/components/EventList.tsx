'use client'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { supabase } from '@/src/lib/supabaseClient'
import { Platform } from '@/src/lib/platforms'

type EventRow = {
  id: string
  platform: Platform
  timestamp: string
  event_type: string
  amount?: number | null
  metadata?: any
  from_user?: string | null
}
export default function EventList() {
  const [rows, setRows] = useState<EventRow[]>([])

  useEffect(() => {
    let uid: string | null = null
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    async function init() {
      const { data } = await supabase.auth.getUser()
      uid = data.user?.id ?? null
      if (!uid) return

      const { data: initial } = await supabase
        .from('platform_events')
        .select('id,platform,timestamp,event_type,amount,metadata,from_user')
        .eq('user_id', uid)
        .order('timestamp', { ascending: false })
        .limit(200)
      if (!cancelled && initial) setRows(initial.reverse())

      channel = supabase
        .channel('platform_events')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'platform_events',
          filter: `user_id=eq.${uid}`
        }, (payload: any) => {
          setRows(prev => [...prev, payload.new as EventRow].slice(-200))
        })
        .subscribe()
    }
    init()
    return () => { cancelled = true; if (channel) supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="card mono text-sm space-y-2 max-h-[70vh] overflow-auto">
      {rows.map(e => (
        <div key={e.id} className="flex gap-2">
          <div className="w-24 text-neutral-400">{dayjs(e.timestamp).format('HH:mm:ss')}</div>
          <div className="w-20 uppercase text-neutral-300">{e.platform}</div>
          <div className="w-28 text-neutral-200">{e.event_type}</div>
          <div className="flex-1 truncate">{e.from_user || ''}</div>
          {e.amount ? <div>x{e.amount}</div> : null}
        </div>
      ))}
      {rows.length===0 && <div className="text-neutral-400">No events yet…</div>}
    </div>
  )
}
