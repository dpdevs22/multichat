import { serve } from '@supabase/functions'

serve(async (req: Request) => {
  try {
    const data = await req.json()

    // Example processing: normalize the event payload
    // Replace this with your actual logic
    const normalizedEvent = {
      id: data.id || null,
      type: data.type || 'unknown',
      payload: data.payload || {},
      received_at: new Date().toISOString(),
    }

    return new Response(JSON.stringify({ ok: true, event: normalizedEvent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Error in normalize_event function:', err)
    return new Response(JSON.stringify({ ok: false, error: err.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
