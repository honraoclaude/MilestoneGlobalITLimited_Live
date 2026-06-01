import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic()

export function streamSSE(
  fn: (
    controller: ReadableStreamDefaultController,
    encoder: TextEncoder,
    signal: AbortSignal
  ) => Promise<void>
): Response {
  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 30_000)

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        await fn(controller, encoder, ctrl.signal)
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
        } catch {}
      } finally {
        clearTimeout(timeout)
        controller.close()
      }
    },
    cancel() {
      clearTimeout(timeout)
      ctrl.abort()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
