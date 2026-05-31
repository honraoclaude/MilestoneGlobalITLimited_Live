'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const LETTER_TYPES = [
  'Job Offer Letter',
  'Post-Interview Rejection',
  'Application Acknowledgement',
  'Reference Request',
  'Candidate Placement Confirmation',
]

const EXAMPLES: Record<string, string> = {
  'Job Offer Letter': `Candidate: Sarah Chen\nRole: Senior Software Engineer\nCompany: Brightwave Tech Ltd\nStart date: 14 July 2025\nSalary: £72,000 per annum\nHoliday: 25 days + bank holidays\nProbation period: 3 months\nReporting to: Head of Engineering, James Park\nOffer conditional on: references and right-to-work check`,
  'Post-Interview Rejection': `Candidate: Marcus Webb\nRole applied for: Senior Software Engineer at Brightwave Tech Ltd\nInterview date: 3 June 2025\nReason (internal only): Strong technical skills but communication style not suited to fast-paced team\nMessage to candidate: Positive interview, very close decision, encourage him to stay in touch for future roles`,
  'Application Acknowledgement': `Candidate: David Okonkwo\nRole applied for: Finance Manager at Meridian Group\nDate application received: 4 June 2025\nTimeline: Shortlisting within 5 working days\nContact for queries: Lauren Sterling, Sterling Recruitment`,
  'Reference Request': `Candidate: Sarah Chen\nRole: Senior Software Engineer at Brightwave Tech Ltd\nReference to: Dr. Alex Patel, Engineering Director at PayStream Ltd\nRelationship: Sarah's direct manager for 3 years\nPlease confirm: employment dates, job title, performance, reason for leaving, would you rehire?`,
  'Candidate Placement Confirmation': `Candidate: Sarah Chen\nPlaced into: Senior Software Engineer at Brightwave Tech Ltd\nStart date: 14 July 2025\nSalary: £72,000\nRecruiter: Lauren Sterling\nFee: 15% of first year salary — invoice to follow\nReminder to candidate: confirm start date directly with Brightwave HR, bring ID documents on first day`,
}

export default function HRLettersPage() {
  const [letterType, setLetterType] = useState(LETTER_TYPES[0])
  const [recruiterName, setRecruiterName] = useState('Lauren Sterling')
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
      const res = await fetch('/api/hr-recruitment/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterType, recruiterName, keyFacts }),
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
          <Link href="/admin/hr-recruitment" className="text-slate-500 hover:text-[#f472b6] text-sm transition-colors">← HR & Recruitment Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Offer & Rejection Letter Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Select letter type + enter key facts — AI drafts the right letter with the right tone</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Letter Type</label>
              <select
                value={letterType}
                onChange={e => setLetterType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f472b6]/50"
              >
                {LETTER_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Recruiter Name</label>
              <input
                value={recruiterName}
                onChange={e => setRecruiterName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f472b6]/50"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Key Facts</label>
            <textarea
              value={keyFacts}
              onChange={e => setKeyFacts(e.target.value)}
              rows={8}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#f472b6]/50 resize-none font-mono"
              placeholder="Enter the key facts for this letter..."
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !keyFacts.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#6366f1] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Drafting letter...' : 'Generate Letter →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Draft Letter</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20 hover:bg-[#f472b6]/20 transition-colors">
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
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for recruiters</p>
          <p className="text-slate-400 text-xs">20 mins per letter × 20 letters/week = <span className="text-white">6+ hours saved</span>. Correctly worded rejections protect the agency's reputation. Fast offers win placements.</p>
        </div>
      </div>
    </main>
  )
}
