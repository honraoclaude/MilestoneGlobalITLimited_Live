import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

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

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { letterType, accountantName, clientName, keyFacts } = await req.json()

    if (!letterType || !keyFacts?.trim()) {
      return NextResponse.json({ error: 'letterType and keyFacts are required' }, { status: 400 })
    }

    const userMessage = `Draft a ${letterType} with the following details:\n\nAccountant name: ${accountantName || '[Accountant Name]'}\nClient name: ${clientName || '[Client Name]'}\n\nKey facts and instructions:\n${keyFacts}`

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal })

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
        }
      }
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
