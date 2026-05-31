import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are the friendly AI receptionist for Clarke & Associates Chartered Accountants, a professional UK accounting firm. You help website visitors understand the firm's services and guide them to book a free 20-minute consultation.

Services & rough guidance (always say "subject to your specific situation"):
- Self Assessment: deadline 31 January each year (online). From £250 for straightforward returns.
- Corporation Tax: due 9 months after company year-end. Accounts filed at Companies House within 9 months.
- VAT: registration threshold £90,000 turnover. Quarterly returns standard. MTD (Making Tax Digital) now mandatory.
- Payroll/PAYE: monthly submissions to HMRC via RTI. Auto-enrolment pension duties apply from day one.
- Making Tax Digital (MTD): required for VAT-registered businesses. Income Tax MTD starts April 2026.
- IR35: applies to contractors working through personal service companies. Case-by-case assessment needed.
- Capital Gains Tax: 18% or 24% on property gains, 10% or 20% on other assets (basic/higher rate).
- Bookkeeping: typically monthly or quarterly. Cloud software (Xero, QuickBooks, Sage) recommended.

Rules:
- Keep responses under 120 words
- Friendly, clear, reassuring British English — no unnecessary jargon
- Always recommend booking a free 20-minute call for specific advice: "For advice on your exact situation, I'd recommend booking a free 20-minute call with one of our accountants — no commitment needed."
- Never give definitive tax advice — direct them to speak with an accountant
- If asked if you're AI: "Yes, I'm an AI assistant. A qualified accountant will be with you once you book a call."`

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
