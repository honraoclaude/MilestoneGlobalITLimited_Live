'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE_NOTES: Record<string, string> = {
  'Active search — CVs sent': `Submitted 4 CVs to you yesterday (see attached). All have been shortlisted against your brief. Two are available immediately; two have 4-week notice periods. Market note: strong Python engineers in Bristol are in short supply at this salary level — these 4 are the best currently active. Recommend interviewing all 4 quickly before they receive other offers. Next step: please confirm interview slots for next week.`,
  'Post-interview feedback': `Thank you for interviewing Sarah Chen and Marcus Webb last week. Sarah received strong feedback — excellent technical depth and great cultural fit. Marcus was technically solid but the team felt his communication style may not suit the fast-paced environment. We recommend progressing Sarah to a final stage. We have 2 further CVs ready to submit if you'd like to keep a pipeline. Next step: please confirm if you'd like to proceed with Sarah and I'll arrange the next stage.`,
  'Search update — slow market': `We are 2 weeks into the search for your Senior Finance Manager role. We have screened 34 candidates to date, with 6 progressed to telephone interview. The market for qualified candidates at this salary band is competitive — we are seeing CIMA/ACCA candidates being countered by current employers. We'd recommend considering either a slight salary uplift or opening the role to candidates who are part-qualified with strong relevant experience. Happy to discuss. Next step: call to review options on Thursday?`,
}

export default function ClientUpdatePage() {
  const [clientName, setClientName] = useState('Mark Thompson')
  const [company, setCompany] = useState('Brightwave Tech Ltd')
  const [role, setRole] = useState('Senior Software Engineer')
  const [recruiterName, setRecruiterName] = useState('Lauren Sterling')
  const [updateNotes, setUpdateNotes] = useState(EXAMPLE_NOTES['Active search — CVs sent'])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!updateNotes.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/hr-recruitment/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, company, role, recruiterName, updateNotes }),
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
          <Link href="/admin/hr-recruitment" className="text-slate-500 hover:text-[#fbbf24] text-sm transition-colors">← HR & Recruitment Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Client Update Email Generator</h1>
          <p className="text-slate-500 text-xs mt-1">Enter your notes — AI writes a professional update email for the hiring manager</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Client Name</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Role Being Filled</label>
              <input value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Recruiter Name</label>
              <input value={recruiterName} onChange={e => setRecruiterName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#fbbf24]/50" />
            </div>
          </div>

          {/* Quick-load scenarios */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(EXAMPLE_NOTES).map(label => (
              <button
                key={label}
                onClick={() => { setUpdateNotes(EXAMPLE_NOTES[label]); setOutput('') }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors border border-white/5"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Update Notes</label>
            <textarea
              value={updateNotes}
              onChange={e => setUpdateNotes(e.target.value)}
              rows={6}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#fbbf24]/50 resize-none"
              placeholder="What happened this week? CVs submitted, interview feedback, market conditions, next steps..."
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !updateNotes.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-black font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Writing email...' : 'Generate Client Update →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Client Update Email</span>
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
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for recruiters</p>
          <p className="text-slate-400 text-xs">20 mins per update × 15 clients/week = <span className="text-white">5 hours saved</span>. Informed clients make faster decisions — and stop calling for updates.</p>
        </div>
      </div>
    </main>
  )
}
