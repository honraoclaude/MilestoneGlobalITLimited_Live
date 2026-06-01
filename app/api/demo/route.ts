import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM = `You are an AI automation agent handling business messages. Write a professional automated email response to the message provided. Rules: 90-120 words, warm but efficient tone, clearly show the situation is being handled, include a specific next step or resolution. Write only the response body — start with a greeting, end with a sign-off from "Milestone AI Agent". No subject line.`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { scenario, message } = await req.json()
    if (!scenario || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 250,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `Scenario: ${scenario}\n\nIncoming message:\n${message}` }],
      }, { signal })

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
        }
      }
    })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
