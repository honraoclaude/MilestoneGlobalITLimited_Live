import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM = `You are Alex, a professional mortgage consultant at Clearstone Mortgages. You are friendly, reassuring, and knowledgeable. Your job is to conduct an initial fact-find with potential clients.

Collect the following information in a natural conversational way:
- Full name and best contact number/email
- Employment type (employed, self-employed, or contractor)
- Annual income (and partner/joint applicant income if applicable)
- Deposit amount saved
- Target property value (or remortgage balance if remortgaging)
- Monthly outgoings: car finance, loans, credit cards, childcare costs
- Any credit issues in the last 6 years (missed payments, defaults, CCJs, IVAs)
- Property type: residential purchase, remortgage, or buy-to-let
- First-time buyer status

Keep responses under 40 words. Be warm and reassuring — many clients find finances stressful. Collect one or two pieces of information per turn. On the first turn, greet the caller warmly, introduce yourself as Alex from Clearstone Mortgages, and ask how you can help today.`

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

    const history = [...messages]
    if (userText) history.push({ role: 'user', content: userText })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: history.length > 0 ? history : [{ role: 'user', content: 'begin' }],
    })

    const agentText = response.content[0].type === 'text' ? response.content[0].text : ''

    const ttsRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/onwK4e9ZLuTAKqWW03F9', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenKey,
        'Content-Type': 'application/json',
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
