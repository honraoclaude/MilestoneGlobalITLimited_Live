import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are a UK solicitor client communications specialist. You draft professional, empathetic client update emails.

Style guidelines:
- Clear, professional British English — informative but never alarming
- Warm but appropriately formal (Dear [Name], Kind regards)
- Explain what has happened, what it means, and what happens next
- Include realistic next steps and an estimated timeline where possible
- Never use unexplained legal jargon
- Keep it concise — clients don't want to read an essay
- Sign off from the solicitor (use the name provided, or "[Solicitor Name]" if not given)
- Do NOT add any preamble like "Here is the email:" — output the email directly, ready to send`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { caseType, clientName, solicitorName, updateNotes } = await req.json()

    if (!updateNotes?.trim()) {
      return NextResponse.json({ error: 'updateNotes is required' }, { status: 400 })
    }

    const userMessage = `Draft a client update email with these details:
Case type: ${caseType || 'General matter'}
Client name: ${clientName || '[Client Name]'}
Solicitor name: ${solicitorName || '[Solicitor Name]'}
Update notes: ${updateNotes}`

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
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
