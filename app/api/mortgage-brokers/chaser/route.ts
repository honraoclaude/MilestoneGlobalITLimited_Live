import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are an expert UK mortgage case manager at Clearstone Mortgages. You write professional, politely assertive case progression chase emails.

Your emails are:
- Concise and clear — never aggressive or demanding
- Specific about what is outstanding and how long it has been outstanding
- Clear about the impact of the delay on the client (exchange deadline at risk, mortgage offer expiry, rate expiry)
- Direct in requesting action, with a specific response deadline
- Signed off from the named broker

Output the email only — subject line, body, and sign-off. No preamble or explanation outside the email itself.`

export async function POST(req: Request) {
  const { chaseType, caseRef, clientName, outstanding, timeOutstanding, urgency, brokerName } = await req.json()

  const stream = await anthropic.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{
      role: 'user',
      content: `Write a case progression chaser email with these details:
Chasing: ${chaseType}
Case Reference: ${caseRef}
Client: ${clientName}
What is outstanding: ${outstanding}
How long outstanding: ${timeOutstanding}
Urgency / impact of delay: ${urgency}
Broker name: ${brokerName}, Clearstone Mortgages`,
    }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
        }
      }
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
