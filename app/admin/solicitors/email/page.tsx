'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const CASE_TYPES = ['Conveyancing', 'Family Law', 'Employment', 'Wills & Probate', 'Personal Injury', 'Commercial']

const EXAMPLE_NOTES: Record<string, string> = {
  'Conveyancing': 'Searches came back clear. Mortgage offer received from Barclays. Seller has confirmed they can complete on 27 June. We need client to sign the transfer deed and return by 20 June. Completion statement to follow.',
  'Family Law': 'Hearing at Bristol Family Court on 14 June was adjourned - judge requested updated financial disclosure from both parties. New hearing listed for 9 July at 10am. Client needs to provide updated bank statements from all accounts for the last 12 months.',
  'Employment': 'ET1 claim submitted to tribunal. Respondent has 28 days to respond (deadline 15 July). ACAS early conciliation certificate attached to claim. Advised client this is routine and to not contact their former employer directly.',
  'Wills & Probate': 'Grant of probate received today. Estate valued at £340,000. IHT already paid. We can now begin transferring assets. Property at 14 Oak Lane needs to go to beneficiary Jane Smith. Remind client to close deceased bank accounts.',
  'Personal Injury': 'Medical report received from Dr Patel confirming 6-month recovery. Liability admitted by defendant insurers. Opening offer of £8,500 received — well below the £22,000 we estimate. Advised client to reject and we will counter.',
}

export default function EmailPage() {
  const [caseType, setCaseType] = useState(CASE_TYPES[0])
  const [clientName, setClientName] = useState('Mr James Wilson')
  const [solicitorName, setSolicitorName] = useState('Sarah Thompson')
  const [updateNotes, setUpdateNotes] = useState(EXAMPLE_NOTES[CASE_TYPES[0]])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUpdateNotes(EXAMPLE_NOTES[caseType] ?? '')
    setOutput('')
  }, [caseType])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!updateNotes.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/solicitors/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseType, clientName, solicitorName, updateNotes }),
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
          <h1 className="text-white font-black text-xl">Case Update Email Generator</h1>
          <p className="text-slate-500 text-xs mt-1">Enter brief notes — AI drafts a professional client email instantly</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Case Type</label>
              <select
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4ff]/50"
              >
                {CASE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Client Name</label>
              <input
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4ff]/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Solicitor Name</label>
              <input
                value={solicitorName}
                onChange={e => setSolicitorName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00d4ff]/50"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Update Notes (bullet points or free text)</label>
            <textarea
              value={updateNotes}
              onChange={e => setUpdateNotes(e.target.value)}
              rows={5}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#00d4ff]/50 resize-none"
              placeholder="Enter what happened and what happens next..."
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !updateNotes.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Writing email...' : 'Generate Email →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Client Email</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 hover:bg-[#fbbf24]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="max-h-96 overflow-y-auto text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500 text-xs">Writing email...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for solicitors</p>
          <p className="text-slate-400 text-xs">15 mins per email × 20 emails/week = <span className="text-white">5 hours saved</span>. At £150/hr billing rate, that's <span className="text-white">£750/week recovered</span>.</p>
        </div>
      </div>
    </main>
  )
}
