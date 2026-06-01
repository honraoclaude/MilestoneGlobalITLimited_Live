import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

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

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

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

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
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
