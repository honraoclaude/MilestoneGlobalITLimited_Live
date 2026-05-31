'use client'

import Link from 'next/link'

const AGENTS = [
  {
    href: '/admin/mortgage-brokers/intake',
    colour: '#3b82f6',
    icon: '📞',
    title: 'Client Intake Voice Agent',
    desc: 'Alex — AI mortgage consultant. Conducts full fact-find: employment, income, deposit, debts, credit history, property type.',
    roi: '40 mins saved per enquiry',
    tag: 'Voice · Haiku',
  },
  {
    href: '/admin/mortgage-brokers/affordability',
    colour: '#6366f1',
    icon: '📊',
    title: 'Affordability Summary Writer',
    desc: 'Paste client income & financial details → structured lender-ready summary with LTV, income multiples, stress test, and risk flags.',
    roi: '40 mins saved per case',
    tag: 'Text · Sonnet',
  },
  {
    href: '/admin/mortgage-brokers/dip',
    colour: '#10b981',
    icon: '📋',
    title: 'DIP Cover Letter Writer',
    desc: 'Enter DIP details → professional plain-English letter explaining what the Decision in Principle means and next steps for the client.',
    roi: '25 mins saved per DIP',
    tag: 'Text · Sonnet',
  },
  {
    href: '/admin/mortgage-brokers/chaser',
    colour: '#f59e0b',
    icon: '📬',
    title: 'Case Progression Chaser',
    desc: 'Select who to chase (solicitor, surveyor, lender) → professional chaser email with case details, urgency, and response deadline.',
    roi: '15 mins saved per chaser',
    tag: 'Text · Haiku',
  },
  {
    href: '/admin/mortgage-brokers/esis',
    colour: '#8b5cf6',
    icon: '📄',
    title: 'ESIS Plain English Explainer',
    desc: 'Paste the European Standardised Information Sheet → plain English summary covering rate, payments, ERC, SVR reversion, and key risks.',
    roi: '30 mins saved per completion',
    tag: 'Text · Sonnet',
  },
]

export default function MortgageBrokersPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border-b border-white/5 flex-wrap">
          <Link href="/admin" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Leads</Link>
          <Link href="/admin/phone-agent" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Phone Agent</Link>
          <Link href="/admin/solicitors" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Solicitor Demos</Link>
          <Link href="/admin/accountants" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Accountant Demos</Link>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">Estate Agent Demos</Link>
          <Link href="/admin/hr-recruitment" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">HR & Recruitment</Link>
          <span className="px-4 pb-3 text-sm font-semibold text-[#3b82f6] border-b-2 border-[#3b82f6] -mb-px">Mortgage Brokers</span>
        </div>

        {/* Header */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f620, #6366f120)', border: '1px solid #3b82f630' }}>🏠</div>
            <div>
              <h1 className="text-white font-black text-2xl mb-1">Clearstone Mortgages — AI Demo Suite</h1>
              <p className="text-slate-400 text-sm">5 AI agents built for UK mortgage brokers. Each demo is ready to show to any broker in a prospect meeting — pre-loaded with realistic UK mortgage data.</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">Clearstone Mortgages</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">UK Mortgage Market</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">40+ hrs/week saved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map(agent => (
            <Link key={agent.href} href={agent.href} className="glass-card p-5 hover:border-white/20 transition-all group block">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${agent.colour}15`, border: `1px solid ${agent.colour}30` }}>
                  {agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#3b82f6] transition-colors">{agent.title}</h3>
                  <span className="text-xs text-slate-600">{agent.tag}</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">{agent.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: agent.colour }}>{agent.roi}</span>
                <span className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors">Try demo →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Summary ROI */}
        <div className="mt-6 glass-card p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { label: 'Fact-find saved', value: '10 hrs', sub: 'per week' },
              { label: 'Case summaries', value: '10 hrs', sub: 'per week' },
              { label: 'DIP letters', value: '8 hrs', sub: 'per month' },
              { label: 'Chase emails', value: '5 hrs', sub: 'per week' },
              { label: 'ESIS explainers', value: '7 hrs', sub: 'per month' },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <div className="text-[#3b82f6] font-black text-xl">{value}</div>
                <div className="text-slate-400 text-xs">{label}</div>
                <div className="text-slate-600 text-xs">{sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
