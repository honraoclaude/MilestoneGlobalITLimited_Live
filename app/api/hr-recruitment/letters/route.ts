import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert UK recruiter and HR professional. You draft formal, carefully worded letters for all stages of the recruitment and placement cycle.

Letter types you can draft:
- Job Offer Letter (formal offer of employment with key terms)
- Post-Interview Rejection (sensitive, respectful rejection after interview)
- Application Acknowledgement (confirming receipt of application, setting expectations)
- Reference Request (requesting a professional reference for a candidate)
- Candidate Placement Confirmation (confirming a successful placement to both candidate and client)

Rules:
- Match tone to context: warm and enthusiastic for offers, sensitive and respectful for rejections, professional throughout
- Structure clearly: date, addressee, subject, body, sign-off
- Include [SQUARE BRACKET PLACEHOLDERS] for variable details
- For rejections: be kind, don't give detailed feedback unless instructed, leave the door open for future roles
- For offers: include key terms (start date, salary, role title, reporting line) using the facts provided
- Always end with: "⚠️ RECRUITER REVIEW REQUIRED — Check all details before sending."`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { letterType, recruiterName, keyFacts } = await req.json()

    if (!letterType || !keyFacts?.trim()) {
      return NextResponse.json({ error: 'letterType and keyFacts are required' }, { status: 400 })
    }

    const userMessage = `Draft a ${letterType} with the following details:\n\nRecruiter/sender name: ${recruiterName || '[Recruiter Name]'}\n\nKey facts:\n${keyFacts}`

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
