import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM = `You are an expert UK mortgage broker and financial educator. You take a European Standardised Information Sheet (ESIS) — a dense regulatory document — and rewrite it in plain, friendly English that any first-time buyer can understand.

Cover all of these points:
1. What this mortgage is — lender name, mortgage type (repayment or interest-only), loan amount, and term
2. The interest rate — is it fixed or variable, what is the initial rate, and when does it change?
3. Monthly payment during the initial rate period
4. What happens when the initial rate ends — explain that it reverts to the Standard Variable Rate (SVR), what the SVR is, and that payments will likely increase
5. The total amount repayable over the full term (including all interest)
6. The Annual Percentage Rate of Charge (APRC) — explain in one sentence what this means
7. Early Repayment Charges — when do they apply, how much are they, and when do they end?
8. Overpayment rules — how much can be overpaid without penalty?
9. Key risks — what happens if interest rates rise (for variable rate products), and what happens if mortgage payments are missed

Use simple, friendly language. No jargon. Structure with clear headers. This is an explanation to help the client understand their mortgage — it is not financial advice.`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { esisText } = await req.json()

    if (!esisText?.trim()) {
      return NextResponse.json({ error: 'esisText is required' }, { status: 400 })
    }

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `Please rewrite this ESIS in plain English for my client:\n\n${esisText}` }],
      }, { signal })

      for await (const chunk of claudeStream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
        }
      }
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
