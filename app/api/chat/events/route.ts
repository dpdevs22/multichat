import { NextRequest } from 'next/server'
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      let i = 0
      const timer = setInterval(()=>{
        const evt = {
          id: String(Date.now() + i++),
          platform: (['twitch','youtube','tiktok'] as const)[Math.floor(Math.random()*3)],
          timestamp: new Date().toISOString(),
          event_type: (['follow','subscribe','gift'] as const)[Math.floor(Math.random()*3)],
          amount: Math.random()>0.6 ? Math.ceil(Math.random()*5) : undefined,
          from_user: ['Zed','Yara','Kai'][Math.floor(Math.random()*3)]
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`))
      }, 3500)
    }
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
