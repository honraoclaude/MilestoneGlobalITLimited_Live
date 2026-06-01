import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are an expert UK estate agent copywriter with 15 years of experience writing listings for Rightmove and Zoopla. You write compelling, accurate property descriptions that generate viewings.

Output format — always produce exactly this structure:

[HEADLINE DESCRIPTION]
A punchy opening sentence that captures the property's best selling point. Then 3–4 paragraphs (200–300 words total) covering: the property overview, key rooms and standout features, outdoor space and parking, and the location/lifestyle benefits. Warm, aspirational tone. Write as if describing the home to a motivated buyer — help them picture living there.

KEY FEATURES
• [Feature 1]
• [Feature 2]
• [Feature 3]
• [Feature 4]
• [Feature 5]
• [Feature 6 — if applicable]
• [Feature 7 — if applicable]
• [Feature 8 — if applicable]

Rules:
- Never invent facts not provided in the brief — use [TBC] for missing details
- Highlight lifestyle benefits and location advantages, not just room specs
- Use positive, active language: "light-filled", "generous", "beautifully presented"
- Avoid clichés like "must be seen" or "rarely available" — be specific instead
- Always end with: "⚠️ AGENT REVIEW REQUIRED — Verify all details before publishing."`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { propertyType, bedrooms, bathrooms, area, askingPrice, keyFeatures } = await req.json()

    if (!propertyType || !keyFeatures?.trim()) {
      return NextResponse.json({ error: 'propertyType and keyFeatures are required' }, { status: 400 })
    }

    const userMessage = `Write a Rightmove-ready property listing for the following property:

Property type: ${propertyType}
Bedrooms: ${bedrooms || '[TBC]'}
Bathrooms: ${bathrooms || '[TBC]'}
Location/Area: ${area || '[TBC]'}
Asking price: ${askingPrice || '[TBC]'}

Key features and details:
${keyFeatures}`

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
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
