import Link from 'next/link'

const AGENTS = [
  {
    href: '/admin/accountants/intake',
    emoji: '📞',
    title: 'Client Intake Voice Agent',
    description: 'Emma, your AI receptionist, answers calls 24/7 — qualifies the client, collects their details, and books a callback.',
    roi: 'Saves 3–4 hrs/week of reception time',
    colour: '#00d4ff',
  },
  {
    href: '/admin/accountants/letter',
    emoji: '✉️',
    title: 'Tax & Accounts Letter Writer',
    description: 'Enter key facts — AI drafts covering letters, HMRC correspondence, tax advice letters, and fee reminders in seconds.',
    roi: 'Cuts letter drafting from 30 mins to 2 mins',
    colour: '#10b981',
  },
  {
    href: '/admin/accountants/report',
    emoji: '📊',
    title: 'Financial Report Summariser',
    description: 'Paste P&L figures or raw notes — AI writes a clear management commentary in plain English your clients will actually read.',
    roi: 'Saves 45 mins per report × 10 reports/month',
    colour: '#8b5cf6',
  },
  {
    href: '/admin/accountants/chatbot',
    emoji: '💬',
    title: 'Client FAQ Chatbot',
    description: 'Embedded on the firm website. Answers questions about deadlines, MTD, VAT, IR35, and more. Books consultations.',
    roi: 'Deflects 40–60% of routine enquiry calls',
    colour: '#34d399',
  },
  {
    href: '/admin/accountants/checklist',
    emoji: '✅',
    title: 'Year-End Checklist Generator',
    description: 'Enter client details — AI generates a personalised document checklist and a ready-to-send client covering letter.',
    roi: 'Saves 30 mins per client × 50 year-ends',
    colour: '#fbbf24',
  },
]

export default function AccountantsHub() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#8b5cf6] flex items-center justify-center text-lg">
              🧾
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">AI Agents for Accountants</h1>
              <p className="text-slate-500 text-xs mt-0.5">Milestone Global IT Limited — Demo Suite</p>
            </div>
          </div>
          <Link href="/admin" className="text-sm text-slate-500 hover:text-[#00d4ff] transition-colors">
            ← Dashboard
          </Link>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border-b border-white/5">
          <Link href="/admin" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Leads</Link>
          <Link href="/admin/phone-agent" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Phone Agent</Link>
          <Link href="/admin/solicitors" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Solicitor Demos</Link>
          <span className="px-4 pb-3 text-sm font-semibold text-[#10b981] border-b-2 border-[#10b981] -mb-px">Accountant Demos</span>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Estate Agent Demos</Link>
          <Link href="/admin/hr-recruitment" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">HR & Recruitment</Link>
        </div>

        {/* Intro */}
        <div className="glass-card p-6 mb-8">
          <p className="text-slate-300 text-sm leading-relaxed">
            Five live AI agent demos built for UK accounting firms. Each one targets a real pain point
            and delivers measurable time savings. Show these to a prospect and they can try them
            in the room — no setup required.
          </p>
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AGENTS.map((agent) => (
            <Link
              key={agent.href}
              href={agent.href}
              className="glass-card p-6 hover:border-white/10 transition-all group block"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${agent.colour}15`, border: `1px solid ${agent.colour}25` }}
                >
                  {agent.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-sm mb-1 group-hover:text-[#10b981] transition-colors">
                    {agent.title}
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">
                    {agent.description}
                  </p>
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ color: agent.colour, background: `${agent.colour}12` }}
                  >
                    <span>💰</span>
                    {agent.roi}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-right">
                <span className="text-xs text-slate-600 group-hover:text-[#10b981] transition-colors">
                  Try demo →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 glass-card p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Want these agents built for your practice?</p>
          <p className="text-white font-semibold text-sm">
            Book a free 30-minute discovery call →{' '}
            <a href="https://milestoneglobalit.co.uk" className="text-[#10b981] hover:underline">
              milestoneglobalit.co.uk
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
