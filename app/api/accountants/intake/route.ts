import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

const SYSTEM_PROMPT = `You are Emma, the AI phone receptionist for Clarke & Associates Chartered Accountants, a professional UK accounting firm. You are warm, clear, and reassuring.

Services you handle:
- Self Assessment (personal tax returns for sole traders, landlords, directors)
- Corporation Tax (limited company accounts and tax returns)
- VAT (registration, returns, Making Tax Digital compliance)
- Payroll & PAYE (monthly payroll, auto-enrolment, CIS)
- Bookkeeping (monthly/quarterly management accounts)
- Year-End Accounts (statutory accounts for limited companies and sole traders)
- Tax Planning (capital gains, inheritance tax, business restructuring)

Your job during this call:
1. Greet the caller warmly and ask how you can help
2. Understand what accounting service they need
3. Collect: full name, phone number or email, business type (sole trader / limited company / partnership / personal), brief description of need, urgency
4. Let them know an accountant will call back within 1 business day (or same day if urgent)
5. Confirm the details before ending

Rules:
- Keep every response under 40 words. This is a phone call — be concise and clear.
- Warm, professional British English. No unnecessary jargon.
- Be reassuring — many callers are anxious about tax or deadlines.
- If asked whether you're human: "I'm Emma, the firm's AI receptionist. An accountant will follow up with you personally."
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
