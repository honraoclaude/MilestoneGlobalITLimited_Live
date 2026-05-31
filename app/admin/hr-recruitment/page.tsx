import Link from 'next/link'

const AGENTS = [
  {
    href: '/admin/hr-recruitment/jd',
    emoji: '📋',
    title: 'Job Description Writer',
    description: 'Enter job title, sector, and key skills — AI writes a compelling, inclusive JD ready to post on job boards.',
    roi: 'Saves 35 mins × 20 JDs/month = 11+ hrs',
    colour: '#6366f1',
  },
  {
    href: '/admin/hr-recruitment/cv',
    emoji: '🔍',
    title: 'CV Shortlister & Screener',
    description: 'Paste the role brief and a CV — AI produces a structured assessment with fit rating and tailored interview questions.',
    roi: 'Saves 8 mins × 50 CVs/week = 6+ hrs',
    colour: '#10b981',
  },
  {
    href: '/admin/hr-recruitment/intake',
    emoji: '📞',
    title: 'Candidate Intake Voice Agent',
    description: 'Lauren, your AI recruiter, handles candidate registration calls — collects skills, salary, notice period, and right to work.',
    roi: 'Saves 25 mins × 20 registrations/week = 8+ hrs',
    colour: '#00d4ff',
  },
  {
    href: '/admin/hr-recruitment/client',
    emoji: '✉️',
    title: 'Client Update Email Generator',
    description: 'Enter your update notes — AI writes a professional email keeping the hiring manager informed and confident in the search.',
    roi: 'Saves 20 mins × 15 clients/week = 5 hrs',
    colour: '#fbbf24',
  },
  {
    href: '/admin/hr-recruitment/letters',
    emoji: '📄',
    title: 'Offer & Rejection Letter Writer',
    description: 'Offer letters, rejections, acknowledgements, reference requests — drafted with the right tone in seconds.',
    roi: 'Saves 20 mins × 20 letters/week = 6+ hrs',
    colour: '#f472b6',
  },
]

export default function HRRecruitmentHub() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#10b981] flex items-center justify-center text-lg">
              🤝
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">AI Agents for HR & Recruitment</h1>
              <p className="text-slate-500 text-xs mt-0.5">Milestone Global IT Limited — Demo Suite</p>
            </div>
          </div>
          <Link href="/admin" className="text-sm text-slate-500 hover:text-[#00d4ff] transition-colors">
            ← Dashboard
          </Link>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border-b border-white/5 flex-wrap">
          <Link href="/admin" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Leads</Link>
          <Link href="/admin/phone-agent" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Phone Agent</Link>
          <Link href="/admin/solicitors" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Solicitor Demos</Link>
          <Link href="/admin/accountants" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Accountant Demos</Link>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Estate Agent Demos</Link>
          <span className="px-4 pb-3 text-sm font-semibold text-[#6366f1] border-b-2 border-[#6366f1] -mb-px">HR & Recruitment</span>
          <Link href="/admin/mortgage-brokers" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Mortgage Brokers</Link>
        </div>

        {/* Intro */}
        <div className="glass-card p-6 mb-8">
          <p className="text-slate-300 text-sm leading-relaxed">
            Five live AI agent demos built for UK recruitment agencies and HR teams. Each one targets
            a real pain point and delivers measurable time savings. Show these to a prospect and they
            can try them in the room — no setup required.
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
                  <h2 className="text-white font-bold text-sm mb-1 group-hover:text-[#6366f1] transition-colors">
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
                <span className="text-xs text-slate-600 group-hover:text-[#6366f1] transition-colors">
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
              { label: 'JD writing', value: '11 hrs', sub: 'per month' },
              { label: 'CV shortlisting', value: '6 hrs', sub: 'per week' },
              { label: 'Candidate intake', value: '8 hrs', sub: 'per week' },
              { label: 'Client update emails', value: '5 hrs', sub: 'per week' },
              { label: 'Offer & rejection letters', value: '6 hrs', sub: 'per week' },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <div className="text-[#6366f1] font-black text-xl">{value}</div>
                <div className="text-slate-400 text-xs">{label}</div>
                <div className="text-slate-600 text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 glass-card p-6 text-center">
          <p className="text-slate-400 text-sm mb-2">Want these agents built for your agency?</p>
          <p className="text-white font-semibold text-sm">
            Book a free 30-minute discovery call →{' '}
            <a href="https://milestoneglobalit.co.uk" className="text-[#6366f1] hover:underline">
              milestoneglobalit.co.uk
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
