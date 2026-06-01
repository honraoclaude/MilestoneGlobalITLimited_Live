import { NextRequest, NextResponse } from 'next/server'
import { insertLead } from '@/lib/db'
import { checkBodySize } from '@/lib/validate'

type ToolCall = {
  id: string
  type: string
  function: {
    name: string
    arguments: string | Record<string, string>
  }
}

export async function POST(req: NextRequest) {
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const body = await req.json()
    const toolCallList: ToolCall[] = body?.message?.toolCallList ?? []

    const results = toolCallList.map((toolCall) => {
      if (toolCall.function?.name !== 'save_lead') {
        return { toolCallId: toolCall.id, result: 'Unknown tool' }
      }

      try {
        const args = typeof toolCall.function.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments

        const { name, email, service, message } = args

        if (name && email && service) {
          insertLead({
            name: String(name).trim(),
            email: String(email).trim(),
            phone: null,
            company: null,
            service: String(service).trim(),
            message: message ? String(message).trim() : 'Submitted via voice agent',
          })
        }

        return {
          toolCallId: toolCall.id,
          result: 'Lead saved successfully. The team will be in touch within one business day.',
        }
      } catch {
        return { toolCallId: toolCall.id, result: 'Failed to save lead' }
      }
    })

    return NextResponse.json({ results })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
