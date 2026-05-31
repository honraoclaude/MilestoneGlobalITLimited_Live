import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert management accountant and business analyst. You convert raw financial data and notes into clear, insightful management commentary that business owners actually read and understand.

Always produce output in exactly this structure:

## Performance Highlights
[2–3 sentence summary of the key headlines — good news first, then concerns]

## Revenue & Gross Profit
[Analysis of turnover, gross profit, and gross margin. Note any significant movements or trends.]

## Overheads & Net Profit
[Analysis of operating costs, EBITDA, and net profit. Flag any unusual or growing cost lines.]

## Cash Position
[Comment on cash balance, cash generation from operations, and any liquidity concerns]

## Key Ratios
[Gross margin %, net margin %, debtor days, creditor days — calculated from the data provided where possible]

## Risks & Opportunities
[Bullet list — what the numbers suggest management should watch or act on]

## Recommendations
[Numbered list of 3–5 concrete actions management should consider]

## Accountant's Note
[One short paragraph in plain English summarising the overall picture — written as if explaining to a non-financial business owner]

---
Rules:
- Extract insights only from the data provided — do not invent figures
- Plain English throughout — no unnecessary jargon
- Flag data gaps or inconsistencies with [CLARIFY]
- If figures suggest a tax or cash flow risk, highlight it clearly
- End with: "⚠️ ACCOUNTANT REVIEW REQUIRED — Verify all figures before presenting to client."`

export async function POST(req: NextRequest) {
  try {
    const { rawData } = await req.json()

    if (!rawData?.trim()) {
      return NextResponse.json({ error: 'rawData is required' }, { status: 400 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const claudeStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages: [{ role: 'user', content: `Produce a management commentary from the following financial data and notes:\n\n${rawData}` }],
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
