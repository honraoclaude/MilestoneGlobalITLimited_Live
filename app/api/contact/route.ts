import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { insertLead } from '@/lib/db'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize, isValidEmail } from '@/lib/validate'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO_EMAIL = 'honraoclaude@gmail.com'

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req), 10, 60).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const body = await req.json()
    const { name, email, phone, company, serviceInterest, message } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!serviceInterest || typeof serviceInterest !== 'string') {
      return NextResponse.json({ error: 'Service interest is required' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone?.trim() || null
    const cleanCompany = company?.trim() || null
    const cleanMessage = message.trim()

    try {
      insertLead({ name: cleanName, email: cleanEmail, phone: cleanPhone, company: cleanCompany, service: serviceInterest, message: cleanMessage })
    } catch { /* DB failure must not block email delivery */ }

    await resend.emails.send({
      from: 'MGIL Website <onboarding@resend.dev>',
      to: TO_EMAIL,
      replyTo: cleanEmail,
      subject: `New Lead: ${cleanName} — ${serviceInterest}`,
      html: `
        <h2 style="font-family:sans-serif;margin:0 0 16px">New Contact Form Submission</h2>
        <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;width:100%">
          <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:140px">Name</td><td style="padding:8px 12px">${cleanName}</td></tr>
          <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Email</td><td style="padding:8px 12px"><a href="mailto:${cleanEmail}">${cleanEmail}</a></td></tr>
          ${cleanPhone ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Phone</td><td style="padding:8px 12px">${cleanPhone}</td></tr>` : ''}
          ${cleanCompany ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Company</td><td style="padding:8px 12px">${cleanCompany}</td></tr>` : ''}
          <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Service</td><td style="padding:8px 12px">${serviceInterest}</td></tr>
          <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">Message</td><td style="padding:8px 12px;white-space:pre-wrap">${cleanMessage}</td></tr>
        </table>
      `,
    })

    return NextResponse.json(
      { success: true, message: 'Thank you! We will be in touch shortly.' },
      { status: 201 }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
