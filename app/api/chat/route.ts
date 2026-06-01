import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are the AI assistant for Milestone Global IT Limited, a UK-based AI agent services company. You help potential clients learn about our services and guide them toward booking a free discovery call.

Milestone Global IT Limited's four core services:
1. AI Chatbots for Business — Custom AI chatbots for customer support, lead qualification, and 24/7 engagement. From £1,500.
2. Workflow Automation — End-to-end automation of business processes using AI agents. Connects CRMs, ERPs, email, and more. From £2,000.
3. AI Consulting — Strategic guidance on AI adoption, ROI analysis, and roadmap planning. From £500/day.
4. Custom AI Agent Development — Bespoke multi-step AI agents for complex workflows. Fully custom, priced on enquiry.

Key facts:
- 100% UK-based team; data stays in the UK by default
- Enterprise-grade security practices
- 24/7 support and monitoring included with all deployments
- Free 30-minute discovery call available — no commitment required
- Typical project timeline: 2–8 weeks
- Serves local and national businesses across all sectors

LEAD CAPTURE PROTOCOL:
When a visitor wants to book a call, get a quote, get started, or expresses clear buying intent, collect the following through natural conversation — ask ONE question at a time:
1. Their full name
2. Email address
3. Which service they are interested in
4. Their preferred day/time for a discovery call (e.g. "Tuesday afternoon")

Once you have all four pieces of information, write a warm confirmation message telling them someone will be in touch within one business day to confirm their call. Then, on a completely new line at the very end of your message, output this tag exactly — no spaces, no extra text around it:
<SAVE_LEAD>{"name":"FULL_NAME","email":"EMAIL","service":"SERVICE","message":"Booked via chat. Preferred time: PREFERRED_TIME"}</SAVE_LEAD>

Important rules for the tag:
- Output it only once, only when you have all four pieces of information
- It must be valid JSON inside the tag
- Never mention the tag to the user — it is invisible to them

Keep all other responses under 150 words unless a detailed explanation is genuinely needed.`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const body = await req.json()
    const { messages } = body as { messages: Message[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    for (const msg of messages) {
      if (!msg.role || typeof msg.content !== 'string') {
        return NextResponse.json({ error: 'Invalid message shape' }, { status: 400 })
      }
    }

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages,
      }, { signal })

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
        }
      }
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
