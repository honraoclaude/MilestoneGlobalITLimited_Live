import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are an expert estate agent client communications specialist. You write warm, personalised post-viewing follow-up emails that convert viewers into buyers or tenants.

Rules:
- Enthusiastic but not pushy tone — the viewer is in the driving seat
- Personalise using the specific feedback notes provided
- Recap the property highlights the viewer mentioned liking
- Include a clear, low-pressure next step (make an offer, book a second viewing, ask questions)
- Keep it concise — 150–200 words maximum
- Sign off from the agent by name
- Output is the email only — no preamble, no commentary, no subject line label (just write it out directly)
- Start with the salutation (e.g. "Dear [name],")`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { propertyAddress, viewerName, agentName, viewingNotes } = await req.json()

    if (!viewingNotes?.trim()) {
      return NextResponse.json({ error: 'viewingNotes is required' }, { status: 400 })
    }

    const userMessage = `Write a post-viewing follow-up email with these details:

Property: ${propertyAddress || '[Property Address]'}
Viewer name: ${viewerName || '[Viewer Name]'}
Agent name: ${agentName || '[Agent Name]'}
Viewing notes / feedback: ${viewingNotes}`

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
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
