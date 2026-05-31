'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE_NOTES = `Client: Mrs Patricia Hughes
Matter: Divorce / Financial Settlement
Date: 31 May 2026, 2pm

- Married 18 years, separated Jan 2025
- Two children: Tom (14), Emma (11) - currently living with client
- Husband earning approx £95k, client works part-time £28k
- Matrimonial home: 42 Birch Road, valued at £420k, £110k mortgage remaining
- Husband wants 50/50 split of property but client says she needs to stay due to kids schooling
- Pension: husband has large defined benefit pension, client has very little
- Client worried about legal costs - asked about funding options
- Husband's solicitors are Hammonds & Co (Bristol)
- Next steps: need Form E completed, financial disclosure from both parties
- Client very stressed - need to send reassuring update
- Limitation: no immediate deadlines but should progress within 3 months`

export default function NotesPage() {
  const [rawNotes, setRawNotes] = useState(EXAMPLE_NOTES)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!rawNotes.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/solicitors/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes }),
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
          <Link href="/admin/solicitors" className="text-slate-500 hover:text-[#00d4ff] text-sm transition-colors">← Solicitor Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Meeting Notes Summariser</h1>
          <p className="text-slate-500 text-xs mt-1">Paste raw meeting notes — AI produces a structured case summary + client email</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-6 flex flex-col">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">Raw Meeting Notes</label>
            <textarea
              value={rawNotes}
              onChange={e => setRawNotes(e.target.value)}
              rows={20}
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#00d4ff]/50 resize-none font-mono leading-relaxed"
              placeholder="Paste meeting notes here — bullet points, free text, or dictation transcripts all work..."
            />
            <button
              onClick={generate}
              disabled={loading || !rawNotes.trim()}
              className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#8b5cf6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Summarising...' : 'Generate Summary →'}
            </button>
          </div>

          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Structured Summary</label>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20 hover:bg-[#f472b6]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy All'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 min-h-[400px]"
            >
              {loading && !output
                ? <span className="animate-pulse text-slate-500">Analysing notes and generating summary...</span>
                : output || <span className="text-slate-600">Your structured summary will appear here. It includes: Matter Overview, Key Facts, Outstanding Issues, Next Steps, and a ready-to-send client email.</span>
              }
            </div>
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for solicitors</p>
          <p className="text-slate-400 text-xs">25 mins post-meeting write-up × 8 meetings/week = <span className="text-white">3+ hours saved weekly</span>. Summary is ready before the client leaves the room.</p>
        </div>
      </div>
    </main>
  )
}
