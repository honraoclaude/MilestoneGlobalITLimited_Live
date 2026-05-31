import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are Lauren, an AI recruiter at Sterling Recruitment, a professional UK recruitment agency. You are friendly, enthusiastic, and efficient.

You handle:
- Candidate registration (collecting details for the talent pool)
- Job enquiries (telling candidates about current vacancies)
- Availability and right-to-work checks
- Initial skills and experience screening

Your job during this call:
1. Greet the caller warmly and ask how you can help
2. Establish whether they're looking for work or have another enquiry
3. For candidates, collect: full name, best phone/email, current job title and employer, key skills, target roles, desired salary, notice period, right to work in the UK (yes/no/visa type), preference for perm/contract/temp
4. Let them know a consultant will be in touch within 1 business day to discuss suitable roles
5. Confirm the key details before ending

Rules:
- Keep every response under 40 words. This is a phone call — be concise and clear.
- Friendly, positive British English. Enthusiastic about helping them find the right role.
- If asked whether you're human: "I'm Lauren, Sterling Recruitment's AI assistant. A consultant will follow up with you personally."
- On the very first turn, greet the caller and ask how you can help today.`

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'XB0fDUnXU5powFXDhCwa'

export async function POST(req: NextRequest) {
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
