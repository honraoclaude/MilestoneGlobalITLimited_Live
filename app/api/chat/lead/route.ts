import { NextRequest, NextResponse } from 'next/server'
import { insertLead } from '@/lib/db'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { name, email, phone, company, service, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !service?.trim())
      return NextResponse.json({ error: 'name, email and service are required' }, { status: 400 })

    insertLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      service: service.trim(),
      message: message?.trim() || 'Submitted via chat widget',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
