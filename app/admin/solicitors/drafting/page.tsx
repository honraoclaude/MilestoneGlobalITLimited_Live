'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const DOC_TYPES = [
  'NDA (Non-Disclosure Agreement)',
  'Client Care Letter',
  'Letter Before Action',
  'Settlement Agreement',
  'Contract for Services',
]

const EXAMPLES: Record<string, string> = {
  'NDA (Non-Disclosure Agreement)': `Disclosing party: Acme Tech Ltd (company number 12345678)\nReceiving party: Beta Consulting Ltd (company number 87654321)\nPurpose: Exploring a potential software development partnership\nDuration: 2 years\nExclusions: Publicly available information, independently developed`,
  'Client Care Letter': `Client: Mr James Wilson\nMatter: Residential conveyancing — purchase of 14 Oak Avenue, Bristol, BS1 2AB\nPurchase price: £340,000\nOur fees: £1,200 + VAT + disbursements\nEstimated completion: 10–14 weeks\nSolicitor handling: Sarah Thompson`,
  'Letter Before Action': `Our client: ABC Supplies Ltd\nDebt owed by: XYZ Contractors Ltd\nAmount: £8,500 for unpaid invoices (INV-2024-089, INV-2024-102)\nDue since: 14 January 2025 (90 days overdue)\nResponse required within: 14 days`,
  'Settlement Agreement': `Employee: David Chen, Senior Developer\nEmployer: TechStart Ltd\nTermination date: 30 June 2025\nSettlement amount: £12,000\nMatters to settle: Unfair dismissal claim, holiday pay\nEmployee's solicitor: independent advice required`,
  'Contract for Services': `Service provider: Bright Digital Ltd\nClient: Meadow Healthcare Group\nServices: Website redesign and ongoing maintenance\nFees: £15,000 for initial build, then £500/month retainer\nDuration: Initial project 12 weeks, retainer rolling monthly\nIP: All deliverables owned by client on full payment`,
}

export default function DraftingPage() {
  const [docType, setDocType] = useState(DOC_TYPES[0])
  const [keyFacts, setKeyFacts] = useState(EXAMPLES[DOC_TYPES[0]])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setKeyFacts(EXAMPLES[docType] ?? '')
    setOutput('')
  }, [docType])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!keyFacts.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/solicitors/drafting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType, keyFacts }),
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
          <Link href="/admin/solicitors" className="text-slate-500 hover:text-[#00d4ff] text-sm transition-colors">← Solicitor Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Document Drafting Assistant</h1>
          <p className="text-slate-500 text-xs mt-1">Enter key facts — AI drafts the document in seconds</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00d4ff]/50"
              >
                {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Key Facts & Instructions</label>
              <textarea
                value={keyFacts}
                onChange={e => setKeyFacts(e.target.value)}
                rows={6}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#00d4ff]/50 resize-none font-mono"
                placeholder="Enter the key facts for this document..."
              />
            </div>
            <button
              onClick={generate}
              disabled={loading || !keyFacts.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Drafting...' : 'Generate Draft →'}
            </button>
          </div>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Draft Document</span>
              {output && !loading && (
                <button
                  onClick={copy}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 hover:bg-[#00d4ff]/20 transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-[500px] overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500">Drafting document...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for solicitors</p>
          <p className="text-slate-400 text-xs">Cuts first-draft time from <span className="text-white">90 minutes to under 5 minutes</span>. Solicitor reviews and finalises — AI does the heavy lifting.</p>
        </div>
      </div>
    </main>
  )
}
