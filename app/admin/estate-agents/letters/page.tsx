'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const LETTER_TYPES = [
  'Memorandum of Sale',
  'Offer Confirmation to Vendor',
  'Solicitor Instruction Letter',
  'Sale Progression Chase',
  'Completion Congratulations Letter',
]

const EXAMPLES: Record<string, string> = {
  'Memorandum of Sale': `Property: 14 Birchwood Avenue, Clifton, Bristol BS8 3TQ\nAgreed price: £565,000\nBuyer: Mr & Mrs Patel (first-time buyers, mortgage in principle from HSBC)\nVendor: Mr & Mrs Davies\nBuyer's solicitor: TBC — will confirm within 48 hours\nVendor's solicitor: Lester Aldridge LLP, Bournemouth\nTarget completion: approximately 10–12 weeks\nSpecial conditions: vendor requires 6-week notice to vacate`,
  'Offer Confirmation to Vendor': `Vendor: Mr & Mrs Davies, 14 Birchwood Avenue, Clifton, Bristol\nProperty: 14 Birchwood Avenue, Clifton, Bristol BS8 3TQ\nAsking price: £575,000\nOffer received: £565,000 from Mr & Mrs Patel\nBuyer position: first-time buyers, mortgage agreed in principle, no chain\nRecommendation: we recommend accepting — clean chain, motivated buyers`,
  'Solicitor Instruction Letter': `Solicitor firm: Lester Aldridge LLP\nOur ref: HCO/2025/1447\nProperty: 14 Birchwood Avenue, Clifton, Bristol BS8 3TQ\nVendor: Mr & Mrs Davies\nBuyer: Mr & Mrs Patel\nAgreed price: £565,000\nPlease proceed with the sale. Memorandum of Sale enclosed. Buyer's solicitor TBC — to follow within 48 hours.`,
  'Sale Progression Chase': `Property: 14 Birchwood Avenue, Clifton, Bristol BS8 3TQ\nParties: Davies (vendor) to Patel (buyer)\nChasing: buyer's solicitor — searches submitted 3 weeks ago, no update received\nOur ref: HCO/2025/1447\nDeadline pressure: vendor has found onward purchase and needs to exchange within 4 weeks\nRequest: urgent update on search results and any queries raised`,
  'Completion Congratulations Letter': `Buyers: Mr & Mrs Patel\nProperty: 14 Birchwood Avenue, Clifton, Bristol BS8 3TQ\nCompletion date: 31 May 2025\nPurchase price: £565,000\nKeys: collected from our office at 1:30pm\nAgent: Tom Hartley`,
}

export default function LettersPage() {
  const [letterType, setLetterType] = useState(LETTER_TYPES[0])
  const [agentName, setAgentName] = useState('Tom Hartley')
  const [keyFacts, setKeyFacts] = useState(EXAMPLES[LETTER_TYPES[0]])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setKeyFacts(EXAMPLES[letterType] ?? '')
    setOutput('')
  }, [letterType])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!keyFacts.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/estate-agents/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterType, agentName, keyFacts }),
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
          <Link href="/admin/estate-agents" className="text-slate-500 hover:text-[#8b5cf6] text-sm transition-colors">← Estate Agent Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Offer & Progression Letter Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Select letter type + enter key facts — AI drafts the letter in seconds</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Letter Type</label>
              <select
                value={letterType}
                onChange={e => setLetterType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6]/50"
              >
                {LETTER_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Agent Name</label>
              <input
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6]/50"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Key Facts</label>
            <textarea
              value={keyFacts}
              onChange={e => setKeyFacts(e.target.value)}
              rows={7}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#8b5cf6]/50 resize-none font-mono"
              placeholder="Enter the key facts for this letter..."
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !keyFacts.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#f472b6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Drafting letter...' : 'Generate Letter →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Draft Letter</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-[500px] overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500">Drafting letter...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for estate agents</p>
          <p className="text-slate-400 text-xs">20 mins per letter × 15 letters/week = <span className="text-white">5 hours saved</span>. Faster progression letters mean faster exchanges — and faster commission.</p>
        </div>
      </div>
    </main>
  )
}
