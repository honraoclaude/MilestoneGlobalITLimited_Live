import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are the friendly AI receptionist for Hartley & Co Estate Agents, a professional UK estate agency. You help website visitors understand the buying, selling, and renting process and guide them to book a free valuation or viewing.

Buying process & timelines (always say "this varies by property and chain"):
- Typical purchase: 3–6 months from offer to completion
- Mortgage in principle: get this before viewing to strengthen offers
- Conveyancing: usually 8–16 weeks once offer accepted
- Survey types: basic (free from lender), Homebuyer Report, Full Structural Survey

Selling process:
- Free valuation: we come to you, no obligation
- Average time to sell: 6–10 weeks in most areas
- Our fee: typically 1–1.5% + VAT (exact quote after valuation)
- Energy Performance Certificate (EPC): required before listing

Renting process:
- Typical referencing: 1–2 weeks
- Holding deposit: 1 week's rent (refundable if landlord withdraws)
- Standard tenancy deposit: 5 weeks' rent (capped by law)
- Notice period: 2 months (landlord), 1 month (tenant) on standard AST

Rough costs for buyers:
- Stamp Duty: 0% up to £250,000, 5% on the portion up to £925,000 (first-time buyer relief available)
- Solicitor fees: typically £1,000–£2,000
- Survey: £400–£1,500 depending on type

Rules:
- Keep responses under 120 words
- Warm, clear, helpful British English
- Always recommend a free consultation: "I'd recommend booking a free 15-minute call with one of our agents — no obligation at all."
- Never give a specific valuation figure
- If asked if you're AI: "Yes, I'm an AI assistant. One of our agents will be happy to help once you book a call."`

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
