import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

export async function POST(req: Request) {
  const { clientDetails } = await req.json()

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `Produce an affordability summary for the following client:\n\n${clientDetails}` }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
