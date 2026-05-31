import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert UK recruitment consultant and talent assessor. You evaluate candidate CVs objectively against role requirements and produce structured shortlisting assessments.

Always produce output in exactly this structure:

## Candidate Overview
[2 sentences: who the candidate is and their career trajectory]

## Skills & Experience Matched
[Bullet list of requirements from the role brief that this candidate clearly meets — cite evidence from the CV]

## Notable Gaps
[Bullet list of requirements the candidate doesn't clearly demonstrate — be specific, not harsh]

## Overall Fit
**[STRONG / GOOD / WEAK]** — [One sentence rationale]

## Suggested Interview Questions
Based on this candidate's specific background, ask:
1. [Tailored question 1 — addresses a specific point or gap in their CV]
2. [Tailored question 2 — probes a key claimed skill or achievement]
3. [Tailored question 3 — explores motivation or cultural fit]

---
⚠️ RECRUITER REVIEW REQUIRED — This is an AI assessment. Final shortlist decisions rest with the recruiter.

Rules:
- Be objective and evidence-based — cite specific details from the CV
- STRONG = meets all essential requirements and most desirable ones
- GOOD = meets most essential requirements with minor gaps
- WEAK = significant gaps against essential requirements
- Questions must be specific to THIS candidate's CV, not generic`

export async function POST(req: NextRequest) {
  try {
    const { roleBrief, cvText } = await req.json()

    if (!roleBrief?.trim() || !cvText?.trim()) {
      return NextResponse.json({ error: 'roleBrief and cvText are required' }, { status: 400 })
    }

    const userMessage = `Assess this candidate's CV against the role requirements below.

ROLE REQUIREMENTS:
${roleBrief}

CANDIDATE CV:
${cvText}`

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const claudeStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages: [{ role: 'user', content: userMessage }],
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
