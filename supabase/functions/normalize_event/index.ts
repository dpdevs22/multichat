import { serve } from '@supabase/functions'

serve(async (req: Request) => {
  try {
    const data = await req.json()
    const normalizedEvent = {
      id: data.id ?? null,
      type: data.type ?? 'unknown',
      payload: data.payload ?? {},
      received_at: new Date().toISOString(),
    }
    return new Response(JSON.stringify({ ok: true, event: normalizedEvent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
