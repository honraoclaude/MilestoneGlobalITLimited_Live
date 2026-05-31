'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE_NOTES: Record<string, string> = {
  'Buyer — seemed very interested': `Viewer loved the kitchen extension and the garden size. Said the location was perfect for the school run. Main concern was whether the loft could be converted in future. Partner couldn't attend but will view next week. Budget is £580k. Said they'd discuss tonight.`,
  'Buyer — needs more thought': `Viewer liked the layout but felt the master bedroom was smaller than expected. Mentioned they're also viewing two other properties this week. Liked the street and neighbours. Said parking could be an issue for them as they have two cars. Politely non-committal.`,
  'Tenant — keen to proceed': `Tenant loved the flat — said it was exactly what they were looking for. Moving from London, start date flexible but ideally 1 June. Currently renting, can give one month notice. Earns £42k, no pets. Asked about whether landlord would allow a small shelf installation.`,
}

export default function FollowupPage() {
  const [propertyAddress, setPropertyAddress] = useState('14 Birchwood Avenue, Clifton, Bristol BS8 3TQ')
  const [viewerName, setViewerName] = useState('Mr & Mrs Patel')
  const [agentName, setAgentName] = useState('Tom Hartley')
  const [viewingNotes, setViewingNotes] = useState(EXAMPLE_NOTES['Buyer — seemed very interested'])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!viewingNotes.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/estate-agents/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyAddress, viewerName, agentName, viewingNotes }),
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
          <Link href="/admin/estate-agents" className="text-slate-500 hover:text-[#f472b6] text-sm transition-colors">← Estate Agent Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Viewing Follow-up Email Generator</h1>
          <p className="text-slate-500 text-xs mt-1">Enter viewing notes — AI writes a warm, personalised follow-up email instantly</p>
        </div>

        <div className="glass-card p-6 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Viewer Name</label>
              <input value={viewerName} onChange={e => setViewerName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f472b6]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Agent Name</label>
              <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f472b6]/50" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Property Address</label>
              <input value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f472b6]/50" />
            </div>
          </div>

          {/* Quick-load examples */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(EXAMPLE_NOTES).map(label => (
              <button
                key={label}
                onClick={() => { setViewingNotes(EXAMPLE_NOTES[label]); setOutput('') }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors border border-white/5"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Viewing Notes & Feedback</label>
            <textarea
              value={viewingNotes}
              onChange={e => setViewingNotes(e.target.value)}
              rows={5}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-[#f472b6]/50 resize-none"
              placeholder="What did the viewer say? What did they like or have concerns about? Any next steps mentioned?"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !viewingNotes.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#f59e0b] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Writing email...' : 'Generate Follow-up Email →'}
          </button>
        </div>

        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Follow-up Email</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20 hover:bg-[#f472b6]/20 transition-colors">
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
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for estate agents</p>
          <p className="text-slate-400 text-xs">15 mins per follow-up × 30 viewings/week = <span className="text-white">7+ hours saved</span>. Personalised follow-ups convert more viewings into offers.</p>
        </div>
      </div>
    </main>
  )
}
