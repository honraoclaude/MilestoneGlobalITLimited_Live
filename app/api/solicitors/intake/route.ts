import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are Sophie, the AI phone receptionist for a UK solicitors firm. You are warm, reassuring, and professional.

Practice areas you handle:
- Conveyancing (buying/selling property, remortgaging)
- Family Law (divorce, child arrangements, financial settlements)
- Employment Law (unfair dismissal, redundancy, discrimination)
- Wills & Probate (writing wills, administering estates)
- Personal Injury (accidents, medical negligence, workplace injuries)
- Commercial Law (business contracts, disputes, company matters)

Your job during this call:
1. Greet the caller warmly and ask how you can help
2. Understand the nature of their legal matter
3. Collect: full name, phone number or email, brief description of the matter, urgency level
4. Let them know a solicitor will call them back within 1 business day (or same day if urgent)
5. Confirm the details back to the caller before ending

Rules:
- Keep every response under 40 words. This is a phone call — be concise and clear.
- Warm, professional British English. Never use legal jargon without explaining it.
- Be reassuring — many callers are stressed or worried.
- If asked whether you're human: "I'm Sophie, the firm's AI receptionist. A solicitor will follow up with you personally."
- On the very first turn, greet the caller and ask how you can help today.`

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'XB0fDUnXU5powFXDhCwa'

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  const elevenKey = process.env.ELEVENLABS_API_KEY
  if (!elevenKey) {
    return NextResponse.json({ error: 'ELEVENLABS_API_KEY is not set.' }, { status: 503 })
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

    const agentText = completion.content[0].type === 'text' ? completion.content[0].text : ''

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

    if (!ttsRes.ok) throw new Error(`ElevenLabs: ${(await ttsRes.text()).slice(0, 200)}`)

    const audioBuffer = await ttsRes.arrayBuffer()
    return NextResponse.json({ agentText, audioBase64: Buffer.from(audioBuffer).toString('base64') })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
