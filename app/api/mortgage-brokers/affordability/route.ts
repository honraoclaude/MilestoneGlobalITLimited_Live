import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM = `You are an expert UK mortgage broker and underwriter. You produce structured affordability summaries for broker internal records and lender submission preparation.

When given client income and financial details, calculate and present:
- Indicative income multiple (4–4.5× for employed, 3.5–4× for self-employed)
- LTV ratio (loan-to-value based on deposit and property value)
- Stress-test monthly payment estimate (current rate plus 3% stress test)
- Net disposable income after all monthly commitments

Flag any risks:
- High LTV (>85%) — may require specialist lender
- Adverse credit history
- High debt-to-income ratio (>40%)
- Self-employment less than 2 years
- Contractor assessed on day rate vs. salary

Recommend lender tier: High Street (clean credit, standard income, LTV ≤85%) | Specialist (complex income, minor adverse, LTV 85–90%) | Adverse (significant credit issues, LTV >90%)

Output structure (use these exact headers):
CLIENT OVERVIEW
INCOME & DEPOSIT SUMMARY
INDICATIVE BORROWING RANGE
LTV ANALYSIS
STRESS-TEST ESTIMATE
MONTHLY AFFORDABILITY CHECK
RISK FLAGS
RECOMMENDED LENDER TIER
NEXT STEPS

End with: "⚠️ BROKER REVIEW REQUIRED — Figures are indicative only. Formal affordability assessment subject to full application and lender criteria."`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { clientDetails } = await req.json()

    if (!clientDetails?.trim()) {
      return NextResponse.json({ error: 'clientDetails is required' }, { status: 400 })
    }

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `Produce an affordability summary for the following client:\n\n${clientDetails}` }],
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
