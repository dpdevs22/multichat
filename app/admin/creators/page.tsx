import { supabaseAdmin } from '@/src/lib/supabaseServer'
export default async function CreatorsPage() {
  const sb = supabaseAdmin()
  const { data } = await sb.from('profiles_with_stats').select('*').limit(100)
  return (
    <div className="space-y-4 mt-4">
      <h2 className="h2">Creators</h2>
      <div className="grid gap-3">
        {data?.map((row:any)=>(
          <div key={row.id} className="card">
            <div className="font-semibold">{row.display_name || row.id}</div>
            <div className="text-sm text-neutral-400">Linked: {row.linked_platforms?.join(', ') || '—'}</div>
            <div className="text-sm">Followers: {row.total_followers ?? 0}</div>
            <div className="text-sm">Avg msgs: {row.avg_messages_per_stream ?? 0}</div>
            <a className="btn mt-3 inline-block" href={`/admin/creators/${row.id}`}>View</a>
          </div>
        )) || <div className="card">No creators</div>}
      </div>
    </div>
  )
}
