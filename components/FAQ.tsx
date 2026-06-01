'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Is my data safe?',
    a: 'Yes. All data is processed using enterprise-grade AI infrastructure and stays within the UK by default. We never use your business data to train AI models, and all client information is handled in line with UK GDPR. Every solution we build includes role-based access controls and encrypted data handling.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Most projects go live in 2–8 weeks depending on complexity. A chatbot or voice agent is typically live within 2 weeks. A more complex workflow automation with CRM integration takes 4–8 weeks. We work in short sprints so you see progress from week one — not just at the end.',
  },
  {
    q: 'Do I need technical staff to use or maintain this?',
    a: 'No. Everything we build is designed to be managed by non-technical staff. You interact with a simple dashboard — no code, no command lines. We handle all the infrastructure, updates, and maintenance. Your team just uses the tool.',
  },
  {
    q: 'Will this work with the systems I already use?',
    a: 'In most cases, yes. Our agents and automations can connect to CRMs (like Salesforce, HubSpot), email (Gmail, Outlook), calendars, and most business software via APIs. During the free discovery call we map your existing systems and confirm what integrations are feasible.',
  },
  {
    q: 'How much does it cost?',
    a: 'Projects start from £1,500 for a chatbot and from £2,000 for workflow automation. AI consulting starts at £500/day. Custom agent development is priced on enquiry depending on scope. All pricing is agreed upfront — no surprise invoices. We also offer monthly support retainers for ongoing maintenance.',
  },
  {
    q: 'What happens after the project launches?',
    a: 'We include a handover session, full documentation, and 30 days of post-launch support in every project. After that, you can choose a monthly support retainer or contact us on a pay-as-you-go basis. Most clients stay on a retainer because the AI needs tuning as their business evolves.',
  },
  {
    q: 'Can I see it working before I commit to anything?',
    a: 'Yes. The free 30-minute discovery call includes a live demonstration tailored to your industry. You see exactly what the AI can do for your specific business before any decision is made. There is no commitment required to book a call.',
  },
  {
    q: 'We are a small business — is this for us?',
    a: 'Absolutely. We work predominantly with UK SMEs — estate agents, solicitors, accountants, recruiters, and similar professional services firms with 1–50 staff. The ROI is often greatest in smaller teams where every hour of admin saved has a direct impact on capacity and revenue.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6 bg-[#0f0f1a] relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="section-label mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Common <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Everything you need to know before getting started.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="glass-card overflow-hidden transition-all"
              style={{ borderColor: open === i ? 'rgba(0,212,255,0.2)' : undefined }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              >
                <span className="text-white font-semibold text-sm md:text-base leading-snug">
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200"
                  style={{
                    background: open === i ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke={open === i ? '#00d4ff' : '#64748b'} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              {open === i && (
                <div className="px-6 pb-5">
                  <div className="h-px bg-white/5 mb-4" />
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm mb-4">Still have questions?</p>
          <a href="#contact" className="btn-primary text-sm py-3 px-7">
            Talk to Us
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
