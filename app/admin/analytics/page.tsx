import { supabaseAdmin } from '@/src/lib/supabaseServer'
export default async function AnalyticsPage() {
  const sb = supabaseAdmin
  const { data: rows } = await sb.rpc('system_analytics_overview')
  return (
    <div className="space-y-4 mt-4">
      <h2 className="h2">System Analytics</h2>
      <div className="card grid grid-cols-2 md:grid-cols-4 gap-3">
        {rows?.map((r:any)=>(
          <div key={r.metric} className="p-3 rounded-xl bg-white/5">
            <div className="text-sm text-neutral-400">{r.metric}</div>
            <div className="text-2xl font-semibold">{r.value}</div>
          </div>
        )) || <div>No data</div>}
      </div>
    </div>
  )
}
