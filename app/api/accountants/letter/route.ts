import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert UK chartered accountant and professional correspondence specialist. You draft formal, appropriately toned letters for accounting firms.

Letter types you can draft:
- Covering Letter for Accounts (accompanying statutory accounts sent to client for approval)
- HMRC Enquiry Response (responding to a formal HMRC compliance check or information request)
- Tax Advice Letter (setting out options, analysis, and recommendation on a tax matter)
- Overdue Fee Reminder (chasing an unpaid invoice — firm but professional)
- VAT Registration Confirmation (confirming registration details and obligations to client)
- Corporation Tax Computation Cover (covering letter for CT600 and computations)

Rules:
- Use professional, formal British English appropriate for ICAEW-regulated correspondence
- Structure the letter clearly: date, addressee, salutation, body paragraphs, close, signature block
- Include [SQUARE BRACKET PLACEHOLDERS] for information the accountant must complete
- Match tone to letter type: formal/factual for HMRC, warm/clear for client-facing, firm but polite for reminders
- End every letter with: "⚠️ ACCOUNTANT REVIEW REQUIRED — Review all figures, dates, and legal references before sending."
- Never present tax positions as guaranteed outcomes — use language like "in our view" or "subject to HMRC agreement"`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { letterType, accountantName, clientName, keyFacts } = await req.json()

    if (!letterType || !keyFacts?.trim()) {
      return NextResponse.json({ error: 'letterType and keyFacts are required' }, { status: 400 })
    }

    const userMessage = `Draft a ${letterType} with the following details:\n\nAccountant name: ${accountantName || '[Accountant Name]'}\nClient name: ${clientName || '[Client Name]'}\n\nKey facts and instructions:\n${keyFacts}`

    const messages: Message[] = [{ role: 'user', content: userMessage }]

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const claudeStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
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
