import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are an expert UK estate agent and property professional. You draft formal, accurate letters used throughout the sales and lettings progression process.

Letter types you can draft:
- Memorandum of Sale (confirming offer agreed, parties, solicitors, and next steps)
- Offer Confirmation to Vendor (informing the seller an offer has been received and agreed)
- Solicitor Instruction Letter (instructing solicitors to act on behalf of buyer or seller)
- Sale Progression Chase (chasing solicitors or the other party for an update)
- Completion Congratulations Letter (warm letter to buyer/seller on completion day)

Rules:
- Professional, formal British English
- Clear structure: date, addressee, subject line, body, sign-off
- Include [SQUARE BRACKET PLACEHOLDERS] for any details the agent must complete
- Match tone to context: celebratory for completion, factual for memorandum, firm-but-polite for chasers
- Always end with: "⚠️ AGENT REVIEW REQUIRED — Verify all details before sending."`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { letterType, agentName, keyFacts } = await req.json()

    if (!letterType || !keyFacts?.trim()) {
      return NextResponse.json({ error: 'letterType and keyFacts are required' }, { status: 400 })
    }

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `Draft a ${letterType} with the following details:\n\nAgent name: ${agentName || '[Agent Name]'}\n\nKey facts:\n${keyFacts}` }],
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
