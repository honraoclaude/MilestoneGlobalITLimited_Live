'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const BUSINESS_TYPES = [
  'Sole Trader',
  'Limited Company',
  'Partnership',
  'LLP (Limited Liability Partnership)',
  'Personal Tax (Non-business)',
]

export default function ChecklistPage() {
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[1])
  const [periodEnd, setPeriodEnd] = useState('31 March 2025')
  const [vatRegistered, setVatRegistered] = useState(true)
  const [hasEmployees, setHasEmployees] = useState(true)
  const [clientName, setClientName] = useState('Brightstone Retail Ltd')
  const [accountantName, setAccountantName] = useState('Sarah Clarke')
  const [specialItems, setSpecialItems] = useState('Director loan account outstanding. Company owns commercial property.')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/accountants/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, periodEnd, vatRegistered, hasEmployees, clientName, accountantName, specialItems }),
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
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/accountants" className="text-slate-500 hover:text-[#fbbf24] text-sm transition-colors">← Accountant Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Year-End Checklist Generator</h1>
          <p className="text-slate-500 text-xs mt-1">Enter client details — AI generates a personalised document checklist + client covering letter</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Client Name</label>
              <input
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Accountant Name</label>
              <input
                value={accountantName}
                onChange={e => setAccountantName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Business Type</label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50"
              >
                {BUSINESS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Period End Date</label>
              <input
                value={periodEnd}
                onChange={e => setPeriodEnd(e.target.value)}
                placeholder="e.g. 31 March 2025"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50"
              />
            </div>
          </div>

          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setVatRegistered(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${vatRegistered ? 'bg-[#fbbf24]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${vatRegistered ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-slate-300 text-sm">VAT Registered</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setHasEmployees(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${hasEmployees ? 'bg-[#fbbf24]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${hasEmployees ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-slate-300 text-sm">Has Employees / PAYE</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Special Circumstances (optional)</label>
            <textarea
              value={specialItems}
              onChange={e => setSpecialItems(e.target.value)}
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#fbbf24]/50 resize-none"
              placeholder="e.g. property income, investments, director loans, R&D claims, foreign income..."
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating checklist...' : 'Generate Checklist & Letter →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Year-End Checklist & Client Letter</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 hover:bg-[#fbbf24]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy All'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-[600px] overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500">Generating personalised checklist...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for accountants</p>
          <p className="text-slate-400 text-xs">30 mins per client checklist × 50 year-end clients = <span className="text-white">25 hours saved annually</span>. Personalised for every client — nothing missed.</p>
        </div>
      </div>
    </main>
  )
}
