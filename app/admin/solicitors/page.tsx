import Link from 'next/link'

const AGENTS = [
  {
    href: '/admin/solicitors/intake',
    emoji: '📞',
    title: 'Client Intake Voice Agent',
    description: 'AI receptionist answers calls, qualifies the matter, and collects client details — 24/7.',
    roi: 'Saves 3–4 hrs/week of reception time',
    colour: '#00d4ff',
  },
  {
    href: '/admin/solicitors/drafting',
    emoji: '📄',
    title: 'Document Drafting Assistant',
    description: 'Solicitor enters key facts — AI drafts NDAs, Client Care Letters, Letters Before Action in seconds.',
    roi: 'Cuts drafting from 90 mins to 5 mins',
    colour: '#8b5cf6',
  },
  {
    href: '/admin/solicitors/chatbot',
    emoji: '💬',
    title: 'Client Q&A Chatbot',
    description: 'Embedded on the firm website. Answers FAQs about process, timelines, and costs. Captures leads.',
    roi: 'Deflects 40–60% of routine enquiry calls',
    colour: '#34d399',
  },
  {
    href: '/admin/solicitors/email',
    emoji: '✉️',
    title: 'Case Update Email Generator',
    description: 'Solicitor types brief update notes — AI generates a polished, professionally toned client email.',
    roi: 'Saves 15 mins per email × 20 emails/week',
    colour: '#fbbf24',
  },
  {
    href: '/admin/solicitors/notes',
    emoji: '📋',
    title: 'Meeting Notes Summariser',
    description: 'Paste raw meeting notes — AI produces a structured case summary, next steps, and a client email draft.',
    roi: 'Saves 25 mins per meeting × 8 meetings/week',
    colour: '#f472b6',
  },
]

export default function SolicitorsHub() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center text-lg">
              ⚖️
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">AI Agents for Solicitors</h1>
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
          <span className="px-4 pb-3 text-sm font-semibold text-[#00d4ff] border-b-2 border-[#00d4ff] -mb-px">Solicitor Demos</span>
          <Link href="/admin/accountants" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Accountant Demos</Link>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Estate Agent Demos</Link>
          <Link href="/admin/hr-recruitment" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">HR & Recruitment</Link>
          <Link href="/admin/mortgage-brokers" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Mortgage Brokers</Link>
        </div>

        {/* Intro */}
        <div className="glass-card p-6 mb-8">
          <p className="text-slate-300 text-sm leading-relaxed">
            Five live AI agent demos built for UK solicitor firms. Each one targets a real pain point
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
                  <h2 className="text-white font-bold text-sm mb-1 group-hover:text-[#00d4ff] transition-colors">
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
                <span className="text-xs text-slate-600 group-hover:text-[#00d4ff] transition-colors">
                  Try demo →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ROI Summary */}
        <div className="mt-6 glass-card p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { label: 'Reception intake', value: '4 hrs', sub: 'per week' },
              { label: 'Document drafting', value: '8 hrs', sub: 'per week' },
              { label: 'Case update emails', value: '5 hrs', sub: 'per week' },
              { label: 'Meeting notes', value: '3 hrs', sub: 'per week' },
              { label: 'FAQ chatbot calls', value: '40%', sub: 'deflected' },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <div className="text-[#00d4ff] font-black text-xl">{value}</div>
                <div className="text-slate-400 text-xs">{label}</div>
                <div className="text-slate-600 text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 glass-card p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Want these agents built for your firm?</p>
          <p className="text-white font-semibold text-sm">
            Book a free 30-minute discovery call →{' '}
            <a href="https://milestoneglobalit.co.uk" className="text-[#00d4ff] hover:underline">
              milestoneglobalit.co.uk
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
