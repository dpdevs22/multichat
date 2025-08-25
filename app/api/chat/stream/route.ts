import { NextRequest } from 'next/server'
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      let i = 0
      const timer = setInterval(()=>{
        const msg = {
          id: String(Date.now() + i++),
          platform: (['twitch','youtube','discord','tiktok'] as const)[Math.floor(Math.random()*4)],
          timestamp: new Date().toISOString(),
          chatter_name: ['Alice','Bob','Charlie','Dana'][Math.floor(Math.random()*4)],
          text: ['Hello!','Nice stream','Pog','🔥🔥'][Math.floor(Math.random()*4)],
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
      }, 1500)
    }
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
}
