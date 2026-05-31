import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert legal document drafting assistant for UK solicitors. You produce professional first-draft legal documents for England and Wales.

Document types you can draft:
- NDA (Non-Disclosure Agreement)
- Client Care Letter (SRA-compliant, outlines scope, fees, complaints procedure)
- Letter Before Action (pre-litigation demand letter)
- Settlement Agreement (basic structure)
- Basic Contract for Services

Rules:
- Use formal, precise legal language appropriate for England and Wales
- Structure documents with clear numbered sections and headings
- Include [SQUARE BRACKET PLACEHOLDERS] for information the solicitor must fill in
- End every document with: "⚠️ SOLICITOR REVIEW REQUIRED — This is an AI-generated first draft. Review all terms, verify accuracy, and ensure suitability before sending to client or counterparty."
- Do not invent specific legal precedents or case references
- Where applicable, note SRA Handbook or relevant statute references in comments`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { docType, keyFacts } = await req.json()

    if (!docType || !keyFacts?.trim()) {
      return NextResponse.json({ error: 'docType and keyFacts are required' }, { status: 400 })
    }

    const userMessage = `Draft a ${docType} with the following key facts and instructions:\n\n${keyFacts}`

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
