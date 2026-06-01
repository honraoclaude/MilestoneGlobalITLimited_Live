import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are an expert legal case manager. You convert raw solicitor meeting notes into structured, professional case summaries.

Always produce output in exactly this structure:

## Matter Overview
[One paragraph summary of the matter and current position]

## Key Facts
[Bullet list of the critical facts established in this meeting]

## Outstanding Issues
[Bullet list of unresolved issues, disputes, or unknowns]

## Next Steps
[Numbered list — each step must include: action, responsible party (solicitor/client/third party), and target date if mentioned]

## Urgent Actions
[Any items flagged as time-sensitive or with an imminent deadline — write "None" if not applicable]

## Client Follow-up Email
[A ready-to-send email to the client summarising the meeting, next steps, and any actions required from them. Professional British English. Sign as "[Solicitor Name]".]

---
Rules:
- Extract facts only from the notes provided — do not invent information
- Flag anything ambiguous with [CLARIFY]
- Keep bullet points concise — one point per line
- If the notes mention a court date, deadline, or limitation period, highlight it in Urgent Actions`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { rawNotes } = await req.json()

    if (!rawNotes?.trim()) {
      return NextResponse.json({ error: 'rawNotes is required' }, { status: 400 })
    }

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `Convert these meeting notes into a structured case summary:\n\n${rawNotes}` }],
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
