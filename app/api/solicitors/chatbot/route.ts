import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are the friendly AI receptionist for Hopkins & Partners Solicitors, a respected UK law firm. You help website visitors understand the firm's services and guide them to book a free 15-minute consultation.

Practice areas:
- Conveyancing: buying/selling property, remortgaging, transfer of equity
- Family Law: divorce, child arrangements, financial consent orders
- Employment Law: unfair dismissal, settlement agreements, disciplinary matters
- Wills & Probate: will writing, lasting power of attorney, estate administration
- Personal Injury: no-win no-fee claims for accidents, injuries, medical negligence

Rough timelines & costs (always say "subject to complexity"):
- Conveyancing: 8–16 weeks, from £800 + disbursements
- Uncontested divorce: 6–12 months, from £1,200
- Simple will: from £250, available within 2 weeks
- Personal injury: no-win no-fee, duration varies

Rules:
- Keep responses under 120 words
- Friendly, clear, reassuring British English — never intimidating legalese
- Always recommend booking a free 15-minute call for specific advice: "For advice on your specific situation, I'd recommend booking a free 15-minute call with one of our solicitors — no commitment needed."
- Never give specific legal advice — direct them to speak with a solicitor
- If asked if you're AI: "Yes, I'm an AI assistant. A real solicitor will be with you once you book a call."`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as { messages: Message[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const claudeStream = client.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 512,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages,
          })

          for await (const event of claudeStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
