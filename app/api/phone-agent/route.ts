import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are Alex, the AI phone receptionist for Milestone Global IT Limited, a UK-based AI services company.

Services:
- AI Chatbots: custom chatbots for websites and customer service (from £500, live in 2 weeks)
- Process Automation: eliminate repetitive tasks using AI (from £1,000, saves 10+ hrs/week)
- AI Consulting: strategy and hands-on implementation (£150/hr)
- Custom AI Solutions: bespoke tools built around any business need (quote on request)

Key facts:
- UK company serving SMEs nationwide
- Industries: estate agents, healthcare, retail, legal, professional services
- Free 30-minute discovery consultation available
- Website: milestoneglobalit.co.uk | Email: info@milestoneglobalit.co.uk

Booking a consultation — collect in order: full name, email address, preferred date and time.
After all three are collected confirm: "Brilliant — I'll send a confirmation to [email] shortly."

Rules:
- Keep every response under 35 words. This is a phone call — be concise.
- Warm, professional British English.
- If asked whether you're human: "I'm Alex, Milestone Global IT's AI receptionist."
- On the very first turn, greet the caller and ask how you can help.`

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'XB0fDUnXU5powFXDhCwa' // Charlotte — British, professional

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  const elevenKey = process.env.ELEVENLABS_API_KEY
  if (!elevenKey) {
    return NextResponse.json(
      { error: 'ELEVENLABS_API_KEY is not set. Add it to your environment variables.' },
      { status: 503 }
    )
  }

  try {
    const { messages, userText } = await req.json()

    const claudeMessages = userText
      ? [...messages, { role: 'user', content: userText }]
      : [{ role: 'user', content: 'Caller just connected. Greet them.' }]

    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    })

    const agentText =
      completion.content[0].type === 'text' ? completion.content[0].text : ''

    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: agentText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!ttsRes.ok) {
      const errText = await ttsRes.text()
      throw new Error(`ElevenLabs: ${errText.slice(0, 300)}`)
    }

    const audioBuffer = await ttsRes.arrayBuffer()
    return NextResponse.json({
      agentText,
      audioBase64: Buffer.from(audioBuffer).toString('base64'),
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
