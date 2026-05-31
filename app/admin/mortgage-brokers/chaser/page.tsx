'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Scenario = {
  chaseType: string
  caseRef: string
  clientName: string
  outstanding: string
  timeOutstanding: string
  urgency: string
}

const SCENARIOS: Record<string, Scenario> = {
  'Chase Solicitor': {
    chaseType: 'Solicitor (Hartley & Webb Solicitors)',
    caseRef: 'CM-2025-1147',
    clientName: 'James & Sophie Thornton',
    outstanding: 'Local authority search results — submitted to council 6 weeks ago',
    timeOutstanding: '6 weeks (expected within 3–4 weeks)',
    urgency: 'Client has an exchange deadline in 3 weeks. If searches are not received this week, exchange will need to be delayed, which could put the chain at risk.',
  },
  'Chase Surveyor': {
    chaseType: 'Surveyor (Premier Valuation Services)',
    caseRef: 'CM-2025-1147',
    clientName: 'James & Sophie Thornton',
    outstanding: 'RICS mortgage valuation report — survey was carried out 10 days ago',
    timeOutstanding: '10 days (expected within 5–7 working days)',
    urgency: 'Halifax cannot issue the formal mortgage offer until the valuation report is received and reviewed. Client is anxious and chasing us daily.',
  },
  'Chase Lender': {
    chaseType: 'Lender (Nationwide Building Society — case team)',
    caseRef: 'CM-2025-0983',
    clientName: 'Rebecca Okafor',
    outstanding: 'Formal mortgage offer letter — full application submitted 4 weeks ago, all documents received and acknowledged',
    timeOutstanding: '4 weeks (Nationwide SLA is 15 working days)',
    urgency: "Client's current 2-year fixed rate deal expires in 6 weeks. If the offer is not issued within the next 10 days, we risk the client reverting to SVR before the new mortgage completes.",
  },
}

export default function ChaserPage() {
  const [scenario, setScenario] = useState<Scenario>(SCENARIOS['Chase Solicitor'])
  const [brokerName, setBrokerName] = useState('Marcus Webb')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  function loadScenario(label: string) {
    setScenario(SCENARIOS[label])
    setOutput('')
  }

  async function generate() {
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/mortgage-brokers/chaser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scenario, brokerName }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') break
          try {
            const { text } = JSON.parse(payload)
            if (text) setOutput(prev => prev + text)
          } catch {}
        }
      }
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : 'Request failed'}`)
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/mortgage-brokers" className="text-slate-500 hover:text-[#f59e0b] text-sm transition-colors">← Mortgage Broker Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Case Progression Chaser</h1>
          <p className="text-slate-500 text-xs mt-1">Select who to chase — AI writes a professional, politely assertive email with case details and urgency</p>
        </div>

        <div className="glass-card p-6 mb-4">
          {/* Quick-load scenarios */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.keys(SCENARIOS).map(label => (
              <button
                key={label}
                onClick={() => loadScenario(label)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors border border-white/5"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Chasing</label>
              <input value={scenario.chaseType} onChange={e => setScenario(s => ({ ...s, chaseType: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Case Reference</label>
              <input value={scenario.caseRef} onChange={e => setScenario(s => ({ ...s, caseRef: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Client Name</label>
              <input value={scenario.clientName} onChange={e => setScenario(s => ({ ...s, clientName: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">What is Outstanding</label>
              <input value={scenario.outstanding} onChange={e => setScenario(s => ({ ...s, outstanding: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">How Long Outstanding</label>
              <input value={scenario.timeOutstanding} onChange={e => setScenario(s => ({ ...s, timeOutstanding: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Broker Name</label>
              <input value={brokerName} onChange={e => setBrokerName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Urgency / Impact of Delay</label>
              <textarea value={scenario.urgency} onChange={e => setScenario(s => ({ ...s, urgency: e.target.value }))} rows={3} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-[#f59e0b]/50 resize-none" />
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f472b6] text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Writing chaser...' : 'Generate Chaser Email →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Chaser Email</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-96 overflow-y-auto text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500 text-xs">Writing chaser email...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for mortgage brokers</p>
          <p className="text-slate-400 text-xs">15 mins per chaser × 20 chasers/week = <span className="text-white">5 hours saved</span>. Consistent, professional chasers keep cases moving and clients informed.</p>
        </div>
      </div>
    </main>
  )
}
