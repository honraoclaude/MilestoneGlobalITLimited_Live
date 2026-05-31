import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are an expert UK accountant specialising in year-end accounts preparation and client onboarding. You generate personalised, comprehensive document request checklists based on each client's specific circumstances.

Always produce output in exactly this structure:

## Year-End Document Checklist
[Client name] | [Business type] | Period ending [date]

### Essential Documents (All Clients)
[Numbered checklist of documents every client must provide]

### Bank & Financial Records
[Numbered checklist of bank statements, loan agreements, HP agreements, credit card statements]

### Sales & Income Records
[Numbered checklist specific to their business type]

### Purchase & Expense Records
[Numbered checklist of invoices, receipts, mileage logs, expenses]

### VAT Records (if VAT registered)
[Include this section only if VAT registered — VAT returns, MTD records]

### Payroll & PAYE Records (if employees)
[Include this section only if employees — P60s, payroll reports, expenses/benefits]

### Additional Items
[Any items specific to their special circumstances — property, investments, foreign income, etc.]

### Key Deadlines
[Filing deadlines based on their business type and period end date]

---

## Client Covering Letter
[A ready-to-send, warm but professional letter to the client explaining what documents are needed and by when. Include a clear deadline 4 weeks from the period end date. Sign as "[Accountant Name]".]

---
Rules:
- Tailor the checklist precisely to the inputs — do not include sections for VAT if not VAT registered
- Be specific — "3 months of bank statements" not just "bank statements"
- End with: "⚠️ ACCOUNTANT REVIEW REQUIRED — Adjust deadlines and items to match your firm's procedures."`

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const { businessType, periodEnd, vatRegistered, hasEmployees, accountantName, clientName, specialItems } = await req.json()

    if (!businessType || !periodEnd) {
      return NextResponse.json({ error: 'businessType and periodEnd are required' }, { status: 400 })
    }

    const userMessage = `Generate a year-end document checklist and client covering letter for the following client:

Client name: ${clientName || '[Client Name]'}
Accountant name: ${accountantName || '[Accountant Name]'}
Business type: ${businessType}
Period ending: ${periodEnd}
VAT registered: ${vatRegistered ? 'Yes' : 'No'}
Has employees/PAYE: ${hasEmployees ? 'Yes' : 'No'}
Special circumstances: ${specialItems?.trim() || 'None'}`

    const messages: Message[] = [{ role: 'user', content: userMessage }]

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          const claudeStream = client.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
            messages,
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
