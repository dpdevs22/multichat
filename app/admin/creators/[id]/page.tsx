import { supabaseAdmin } from '@/src/lib/supabaseServer'
export default async function CreatorDetail({ params }: { params: { id: string }}) {
  const sb = supabaseAdmin()
  const [{ data: profile }, { data: links }, { data: stats }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', params.id).single(),
    sb.from('linked_accounts').select('*').eq('user_id', params.id),
    sb.from('analytics_daily').select('*').eq('user_id', params.id).order('date', { ascending: false }).limit(30),
  ])
  return (
    <div className="space-y-4 mt-4">
      <h2 className="h2">Creator {profile?.display_name || profile?.id}</h2>
      <div className="card">
        <div className="font-semibold mb-2">Linked accounts</div>
        <ul className="text-sm space-y-1">
          {links?.map((l:any)=>(<li key={l.id}>{l.platform}: {l.username} {l.follower_count ? `(followers ${l.follower_count})` : ''}</li>))}
        </ul>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Recent analytics</div>
        <div className="text-sm grid grid-cols-5 gap-2">
          <div className="font-medium">Date</div>
          <div>Msgs</div><div>Followers</div><div>Gifts</div><div>Subs</div>
          {stats?.map((s:any)=>([
            <div key={s.date+'d'}>{s.date}</div>,
            <div key={s.date+'m'}>{s.messages_count}</div>,
            <div key={s.date+'f'}>{s.followers_count}</div>,
            <div key={s.date+'g'}>{s.gifts_count}</div>,
            <div key={s.date+'s'}>{s.subs_count}</div>
          ]))}
        </div>
      </div>
    </div>
  )
}
