'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE = `Client: James & Sophie Thornton
Employment: James — Employed, Senior Software Engineer, £78,000/year
Sophie — Employed, Primary School Teacher, £34,000/year
Joint income: £112,000/year
Deposit saved: £45,000
Target property value: £380,000
Monthly outgoings: car finance £320, credit card minimum £50
Childcare costs: £800/month (ends in 18 months when youngest starts school)
Other debts: none
Credit history: both clean — no missed payments, defaults, or CCJs
Property type: Residential purchase — first home
First-time buyers: Yes`

export default function AffordabilityPage() {
  const [clientDetails, setClientDetails] = useState(EXAMPLE)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!clientDetails.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/mortgage-brokers/affordability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientDetails }),
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/mortgage-brokers" className="text-slate-500 hover:text-[#6366f1] text-sm transition-colors">← Mortgage Broker Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Affordability Summary Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Enter client income, deposit, and financial details — AI produces a structured lender-ready affordability summary</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="glass-card p-5">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">Client Financial Details</label>
            <textarea
              value={clientDetails}
              onChange={e => setClientDetails(e.target.value)}
              rows={20}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#6366f1]/50 resize-none font-mono leading-relaxed"
              placeholder="Enter client employment, income, deposit, debts, credit history, property type..."
            />
          </div>

          <div className="glass-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Affordability Summary</label>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 min-h-[400px]"
            >
              {loading && !output
                ? <span className="animate-pulse text-slate-500">Calculating affordability summary...</span>
                : output || <span className="text-slate-600">Your affordability summary will appear here — income multiples, LTV analysis, stress-test estimate, risk flags, and recommended lender tier.</span>
              }
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !clientDetails.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Calculating...' : 'Generate Affordability Summary →'}
        </button>

        <div className="glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for mortgage brokers</p>
          <p className="text-slate-400 text-xs">40 mins per affordability summary × 15 cases/week = <span className="text-white">10 hours saved</span>. Consistent, lender-ready summaries every time.</p>
        </div>
      </div>
    </main>
  )
}
