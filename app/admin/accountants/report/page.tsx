'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE_DATA = `Company: Brightstone Retail Ltd
Period: 6 months ended 31 March 2025 (vs 6 months ended 31 March 2024)

PROFIT & LOSS
                        Current     Prior
Turnover:               £620,000    £540,000
Cost of goods sold:     £372,000    £313,200
Gross profit:           £248,000    £226,800
Gross margin:           40%         42%

Overheads:
  Staff costs:          £95,000     £82,000
  Rent & rates:         £28,000     £28,000
  Marketing:            £18,500     £11,000
  Other overheads:      £24,300     £21,400
Total overheads:        £165,800    £142,400

Operating profit:       £82,200     £84,400
Interest:               £4,800      £3,200
Net profit before tax:  £77,400     £81,200

BALANCE SHEET HIGHLIGHTS
Cash at bank:           £34,500     £61,200
Debtors:               £88,000     £62,000
Stock:                 £115,000    £94,000
Bank loan outstanding: £120,000    £140,000

Notes: New warehouse opened February 2025 — additional rent £4,000/month from Feb.
Marketing spend increased for product launch. Three new staff hired Q4.`

export default function ReportPage() {
  const [rawData, setRawData] = useState(EXAMPLE_DATA)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!rawData.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/accountants/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData }),
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/accountants" className="text-slate-500 hover:text-[#10b981] text-sm transition-colors">← Accountant Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Financial Report Summariser</h1>
          <p className="text-slate-500 text-xs mt-1">Paste P&L figures or raw financial notes — AI writes a management commentary in plain English</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-6 flex flex-col">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">Financial Data & Notes</label>
            <textarea
              value={rawData}
              onChange={e => setRawData(e.target.value)}
              rows={20}
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#8b5cf6]/50 resize-none font-mono leading-relaxed"
              placeholder="Paste P&L figures, balance sheet data, or financial notes here..."
            />
            <button
              onClick={generate}
              disabled={loading || !rawData.trim()}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#10b981] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Analysing...' : 'Generate Commentary →'}
            </button>
          </div>

          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Management Commentary</label>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy All'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 min-h-[400px]"
            >
              {loading && !output
                ? <span className="animate-pulse text-slate-500">Analysing figures and generating commentary...</span>
                : output || <span className="text-slate-600">Your management commentary will appear here. It includes: Performance Highlights, Revenue & Gross Profit, Overheads & Net Profit, Cash Position, Key Ratios, Risks & Opportunities, and Recommendations.</span>
              }
            </div>
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for accountants</p>
          <p className="text-slate-400 text-xs">45 mins per management commentary × 10 reports/month = <span className="text-white">7+ hours saved monthly</span>. Clients get insights they actually understand.</p>
        </div>
      </div>
    </main>
  )
}
