'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function DIPPage() {
  const [clientName, setClientName] = useState('James & Sophie Thornton')
  const [lender, setLender] = useState('Halifax')
  const [dipAmount, setDipAmount] = useState('£305,000')
  const [property, setProperty] = useState('4-bed semi-detached, Bristol, BS9')
  const [rate, setRate] = useState('4.49% fixed for 2 years')
  const [validUntil, setValidUntil] = useState('14 August 2026')
  const [brokerName, setBrokerName] = useState('Marcus Webb')
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
      const res = await fetch('/api/mortgage-brokers/dip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, lender, dipAmount, property, rate, validUntil, brokerName }),
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
          <Link href="/admin/mortgage-brokers" className="text-slate-500 hover:text-[#10b981] text-sm transition-colors">← Mortgage Broker Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">DIP Cover Letter Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Enter DIP details — AI writes a clear, reassuring plain-English letter for your client</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Client Name</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Lender</label>
              <input value={lender} onChange={e => setLender(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">DIP Amount</label>
              <input value={dipAmount} onChange={e => setDipAmount(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Rate / Product</label>
              <input value={rate} onChange={e => setRate(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Property</label>
              <input value={property} onChange={e => setProperty(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">DIP Valid Until</label>
              <input value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Broker Name</label>
              <input value={brokerName} onChange={e => setBrokerName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50" />
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || !clientName.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#3b82f6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Writing letter...' : 'Generate DIP Cover Letter →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">DIP Cover Letter</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-[500px] overflow-y-auto text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500 text-xs">Writing DIP cover letter...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for mortgage brokers</p>
          <p className="text-slate-400 text-xs">25 mins per DIP letter × 20 DIPs/month = <span className="text-white">8+ hours saved</span>. Plain English letters reduce client callbacks and build trust at a critical moment.</p>
        </div>
      </div>
    </main>
  )
}
