import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert recruitment consultant and client relationship specialist. You write professional, concise client update emails that demonstrate activity, maintain confidence, and prompt the client to take the next step.

Rules:
- Demonstrate momentum — always show what's been done and what's happening next
- Include relevant market context where provided (e.g. candidate availability, salary benchmarking)
- Be direct and confident — avoid vague or defensive language
- Keep it under 200 words — hiring managers are busy
- Output is the email only — no preamble, no commentary
- Start with the salutation (e.g. "Dear [name],")
- Sign off from the recruiter by name`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { clientName, company, role, recruiterName, updateNotes } = await req.json()

    if (!updateNotes?.trim()) {
      return NextResponse.json({ error: 'updateNotes is required' }, { status: 400 })
    }

    const userMessage = `Write a client recruitment update email with these details:

Client name: ${clientName || '[Client Name]'}
Company: ${company || '[Company]'}
Role being filled: ${role || '[Role]'}
Recruiter name: ${recruiterName || '[Recruiter Name]'}

Update notes:
${updateNotes}`

    const messages: Message[] = [{ role: 'user', content: userMessage }]

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const claudeStream = client.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 600,
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
