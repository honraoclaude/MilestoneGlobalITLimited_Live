'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const VapiVoiceAgent = dynamic(() => import('@/components/VapiVoiceAgent'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-8 flex items-center justify-center" style={{ height: '400px' }}>
        <p className="text-slate-500 text-sm">Loading voice agent…</p>
      </div>
      <div className="glass-card" style={{ height: '480px' }} />
    </div>
  ),
})

export default function VoiceAgentPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.9" />
              <path d="M7 4L11 8L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-black text-xl leading-none">Voice Agent Demo</h1>
            <p className="text-slate-500 text-xs mt-0.5">Alex — Milestone Global IT</p>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border-b border-white/5 overflow-x-auto">
          <Link href="/admin" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Leads</Link>
          <span className="px-4 pb-3 text-sm font-semibold text-[#00d4ff] border-b-2 border-[#00d4ff] -mb-px whitespace-nowrap">Voice Agent</span>
          <Link href="/admin/solicitors" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Solicitor Demos</Link>
          <Link href="/admin/accountants" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Accountant Demos</Link>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Estate Agent Demos</Link>
          <Link href="/admin/hr-recruitment" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">HR &amp; Recruitment</Link>
          <Link href="/admin/mortgage-brokers" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Mortgage Brokers</Link>
        </div>

        <VapiVoiceAgent />

      </div>
    </main>
  )
}
