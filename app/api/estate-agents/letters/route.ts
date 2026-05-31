import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

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

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { letterType, agentName, keyFacts } = await req.json()

    if (!letterType || !keyFacts?.trim()) {
      return NextResponse.json({ error: 'letterType and keyFacts are required' }, { status: 400 })
    }

    const userMessage = `Draft a ${letterType} with the following details:\n\nAgent name: ${agentName || '[Agent Name]'}\n\nKey facts:\n${keyFacts}`

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
