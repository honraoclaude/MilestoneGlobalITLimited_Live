'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const LETTER_TYPES = [
  'Covering Letter for Accounts',
  'HMRC Enquiry Response',
  'Tax Advice Letter',
  'Overdue Fee Reminder',
  'VAT Registration Confirmation',
  'Corporation Tax Computation Cover',
]

const EXAMPLES: Record<string, string> = {
  'Covering Letter for Accounts': `Company name: Brightstone Retail Ltd\nPeriod: Year ended 31 March 2025\nTurnover: £1,240,000\nNet profit: £87,500\nCorporation tax due: £21,875\nDirectors need to approve and sign the accounts\nPayment deadline: 1 January 2026`,
  'HMRC Enquiry Response': `HMRC enquiry reference: HMRC/2025/ENQ/44821\nClient: David Patel (sole trader, IT consultant)\nPoints raised: HMRC querying £18,500 claimed as home office and travel expenses\nClient's position: All expenses incurred wholly and exclusively for business — supporting receipts available\nEvidence to enclose: mileage log, utility bills, business contracts`,
  'Tax Advice Letter': `Client: Sarah & James Morrison\nMatter: Sale of rental property — capital gains tax planning\nProperty value: £420,000 (purchased 2012 for £195,000)\nGain: approx £225,000\nOptions considered: (1) sell in current tax year, (2) transfer to spouse before sale, (3) spread sale across two tax years\nRecommendation: option 2 — transfer half interest to spouse first to use both CGT annual exemptions`,
  'Overdue Fee Reminder': `Client: Westfield Plumbing Ltd\nInvoice: INV-2025-047 dated 14 February 2025\nAmount outstanding: £1,850 + VAT\nPayment terms: 30 days (now 75 days overdue)\nPrevious chaser: sent 15 March 2025\nNext step if unpaid: refer to debt recovery`,
  'VAT Registration Confirmation': `Client: Priya Sharma (sole trader, graphic designer)\nVAT registration number: 345 6789 12\nEffective date of registration: 1 June 2025\nFirst VAT return period: 1 June – 31 August 2025\nReturn due: 7 October 2025\nMTD: client must use compatible software from day one`,
  'Corporation Tax Computation Cover': `Company: TechForward Solutions Ltd\nPeriod: Year ended 31 December 2024\nTaxable profit: £156,000\nCorporation tax at 25%: £39,000\nPayment due: 1 October 2025\nR&D tax relief claimed: £12,400\nNet tax payable: £26,600`,
}

export default function LetterPage() {
  const [letterType, setLetterType] = useState(LETTER_TYPES[0])
  const [clientName, setClientName] = useState('Mr James Wilson')
  const [accountantName, setAccountantName] = useState('Sarah Clarke')
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
      const res = await fetch('/api/accountants/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterType, clientName, accountantName, keyFacts }),
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
          <Link href="/admin/accountants" className="text-slate-500 hover:text-[#10b981] text-sm transition-colors">← Accountant Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Tax & Accounts Letter Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Enter key facts — AI drafts a professional letter instantly</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Letter Type</label>
              <select
                value={letterType}
                onChange={e => setLetterType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50"
              >
                {LETTER_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Client Name</label>
              <input
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Accountant Name</label>
              <input
                value={accountantName}
                onChange={e => setAccountantName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10b981]/50"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Key Facts & Instructions</label>
            <textarea
              value={keyFacts}
              onChange={e => setKeyFacts(e.target.value)}
              rows={6}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#10b981]/50 resize-none font-mono"
              placeholder="Enter the key facts for this letter..."
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !keyFacts.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#8b5cf6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Writing letter...' : 'Generate Letter →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Draft Letter</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-[500px] overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500">Writing letter...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for accountants</p>
          <p className="text-slate-400 text-xs">15–30 mins per letter × 20 letters/week = <span className="text-white">5–10 hours saved</span>. At £150/hr billing rate, that's <span className="text-white">£750–£1,500/week recovered</span>.</p>
        </div>
      </div>
    </main>
  )
}
