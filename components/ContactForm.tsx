'use client'

import { useState, FormEvent, ChangeEvent } from 'react'

type FormData = {
  name: string
  email: string
  phone: string
  company: string
  serviceInterest: string
  message: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

const serviceOptions = [
  'AI Chatbots for Business',
  'Workflow Automation',
  'AI Consulting',
  'Custom AI Agent Development',
  'Not Sure Yet — Happy to Discuss',
]

const benefits = [
  'Free 30-minute discovery call, no commitment',
  'Tailored AI solution matched to your business',
  'Transparent pricing, no hidden costs',
  'Ongoing support from day one',
]

export default function ContactForm() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceInterest: '',
    message: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="py-24 px-6 bg-[#0f0f1a] relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,212,255,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="section-label mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
            Get In Touch
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Start Your <span className="gradient-text">AI Journey</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Tell us about your business and we&apos;ll get back to you within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Benefits */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-4">What to Expect</h3>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00d4ff]/15 border border-[#00d4ff]/25 flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm">
                  MG
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Milestone Global IT Limited</div>
                  <div className="text-xs text-slate-500">United Kingdom</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                We respond to all enquiries within one business day. For urgent requests,
                mention it in your message.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <div className="glass-card p-10 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14l6 6 10-10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">Thank You!</h3>
                <p className="text-slate-400 max-w-sm">
                  Your message has been received. We&apos;ll be in touch within one business day.
                </p>
                <button
                  onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', company: '', serviceInterest: '', message: '' }) }}
                  className="btn-ghost mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Full Name <span className="text-[#00d4ff]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Email Address <span className="text-[#00d4ff]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@company.co.uk"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Phone + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Phone <span className="text-slate-600 font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+44 7700 900000"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Company <span className="text-slate-600 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Service Interest */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    I&apos;m Interested In <span className="text-[#00d4ff]">*</span>
                  </label>
                  <select
                    name="serviceInterest"
                    value={form.serviceInterest}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="" disabled>Select a service...</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Tell Us About Your Business <span className="text-[#00d4ff]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Briefly describe your business and what you're hoping to achieve with AI..."
                    className="form-input resize-none"
                  />
                </div>

                {/* Error */}
                {status === 'error' && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    {errorMsg}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 8h12M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
