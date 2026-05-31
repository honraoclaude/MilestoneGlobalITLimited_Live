'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE_ESIS = `EUROPEAN STANDARDISED INFORMATION SHEET (ESIS)
Lender: Nationwide Building Society
Date: 31 May 2026

SECTION 1 — LENDER
Nationwide Building Society, Nationwide House, Pipers Way, Swindon, SN38 1NW

SECTION 2 — KEY FEATURES OF THE LOAN
Loan amount: £305,000
Term: 25 years
Type: Capital and interest repayment mortgage
Type of interest rate: Fixed rate for initial period, reverting to variable rate

SECTION 3 — INTEREST RATE AND OTHER COSTS
Initial interest rate: 4.89% fixed until 31 July 2028
Reversion rate: Nationwide Base Mortgage Rate (BMR) currently 7.74% p.a. variable
Annual Percentage Rate of Charge (APRC): 6.8%

SECTION 4 — FREQUENCY AND NUMBER OF PAYMENTS
Monthly payments during fixed period: £1,742.00
Monthly payments after reversion to BMR (indicative): £1,891.00
Total number of payments: 300

SECTION 5 — AMOUNT OF EACH INSTALMENT
Fixed period (24 months): £1,742.00 per month
Remaining term (276 months): £1,891.00 per month (indicative, subject to rate changes)

SECTION 6 — TOTAL AMOUNT TO BE REPAID
Total amount repayable: £573,640
(This is the loan plus all interest and fees over the full mortgage term)

SECTION 7 — EARLY REPAYMENT
Early Repayment Charge (ERC):
- Year 1 (before 31 July 2027): 2% of the outstanding balance
- Year 2 (before 31 July 2028): 1% of the outstanding balance
- After 31 July 2028: No early repayment charge applies

SECTION 8 — FLEXIBLE FEATURES
Overpayments: You may overpay up to 10% of the outstanding mortgage balance per calendar year without incurring an Early Repayment Charge.
Payment holidays: Available subject to Nationwide's terms and conditions and account conduct.

SECTION 9 — OTHER RIGHTS OF THE BORROWER
You have the right to repay this mortgage in full at any time, subject to payment of any applicable Early Repayment Charges as detailed above.

SECTION 10 — COMPLAINTS
If you wish to make a complaint, please contact Nationwide Building Society directly. If your complaint is not resolved to your satisfaction, you may refer it to the Financial Ombudsman Service.`

export default function ESISPage() {
  const [esisText, setEsisText] = useState(EXAMPLE_ESIS)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!esisText.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/mortgage-brokers/esis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esisText }),
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
          <Link href="/admin/mortgage-brokers" className="text-slate-500 hover:text-[#8b5cf6] text-sm transition-colors">← Mortgage Broker Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">ESIS Plain English Explainer</h1>
          <p className="text-slate-500 text-xs mt-1">Paste the European Standardised Information Sheet — AI rewrites it in plain English your client will actually understand</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="glass-card p-5">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">ESIS Document (paste here)</label>
            <textarea
              value={esisText}
              onChange={e => setEsisText(e.target.value)}
              rows={28}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#8b5cf6]/50 resize-none font-mono leading-relaxed"
              placeholder="Paste the full ESIS document text here..."
            />
          </div>

          <div className="glass-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Plain English Summary</label>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 min-h-[500px]"
            >
              {loading && !output
                ? <span className="animate-pulse text-slate-500">Translating your ESIS into plain English...</span>
                : output || <span className="text-slate-600">Your plain English mortgage summary will appear here — covering the rate, monthly payments, total cost, what happens when the fixed period ends, early repayment charges, and key risks. Ready to email to your client.</span>
              }
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !esisText.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Translating ESIS...' : 'Explain ESIS in Plain English →'}
        </button>

        <div className="glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for mortgage brokers</p>
          <p className="text-slate-400 text-xs">30 mins per ESIS explanation × 15 completions/month = <span className="text-white">7+ hours saved</span>. Clients who understand their mortgage make fewer panicked calls and complete with confidence.</p>
        </div>
      </div>
    </main>
  )
}
