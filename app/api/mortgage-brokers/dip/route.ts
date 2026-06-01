import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM = `You are an expert UK mortgage broker. You write clear, warm, reassuring client letters explaining a Decision in Principle (DIP).

Use plain English — no jargon. The letter should cover:
1. What a Decision in Principle is — the lender has credit-searched the client and indicated a willingness to lend
2. What the DIP amount means and what rate/product it is based on
3. What a DIP does NOT guarantee — it is not a formal mortgage offer; subject to full underwriting, property valuation, and satisfactory documentation
4. How long the DIP is valid (typically 60–90 days, state the expiry date given)
5. What the client should do next: actively search for a property, instruct a solicitor early, and begin gathering documents
6. What documents they will need for the full application: last 3 months' payslips (or 2–3 years' accounts if self-employed), last 3 months' bank statements, proof of deposit, photo ID, proof of address
7. What happens next in the process — full application, valuation, underwriting, formal offer

Tone: professional but warm and encouraging. Many clients are anxious about the mortgage process — reassure them this is excellent progress.

End with: "⚠️ BROKER REVIEW REQUIRED — Please review before sending to client."`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { clientName, lender, dipAmount, property, rate, validUntil, brokerName } = await req.json()

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: `Write a DIP cover letter with these details:
Client: ${clientName}
Lender: ${lender}
DIP Amount: ${dipAmount}
Property: ${property}
Rate: ${rate}
DIP Valid Until: ${validUntil}
Broker: ${brokerName}, Clearstone Mortgages`,
        }],
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
