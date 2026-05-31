'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Msg = { role: 'user' | 'assistant'; content: string }

const WELCOME = "Hello! I'm the virtual assistant for Hopkins & Partners Solicitors. How can I help you today? I can answer questions about our services, fees, and processes."

const SUGGESTIONS = [
  'How long does conveyancing take?',
  'How much does a will cost?',
  'What happens in a divorce?',
  'Do you handle no-win no-fee cases?',
]

export default function ChatbotPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs])

  async function send(text?: string) {
    const userText = (text ?? input).trim()
    if (!userText || streaming) return
    setInput('')

    const userMsg: Msg = { role: 'user', content: userText }
    const history = [...msgs, userMsg]
    setMsgs(history)
    setStreaming(true)

    const assistantMsg: Msg = { role: 'assistant', content: '' }
    setMsgs([...history, assistantMsg])

    try {
      const res = await fetch('/api/solicitors/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })) }),
      })

      if (!res.body) throw new Error('No response')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let full = ''

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
            if (text) { full += text; setMsgs([...history, { role: 'assistant', content: full }]) }
          } catch {}
        }
      }
    } catch {
      setMsgs([...history, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' }])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/solicitors" className="text-slate-500 hover:text-[#00d4ff] text-sm transition-colors">← Solicitor Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Client Q&A Chatbot</h1>
          <p className="text-slate-500 text-xs mt-1">As seen on Hopkins & Partners Solicitors website (demo)</p>
        </div>

        {/* Mock firm website frame */}
        <div className="glass-card overflow-hidden">
          {/* Mock website header */}
          <div className="bg-slate-900 px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#1a3a5c] flex items-center justify-center text-xs">⚖️</div>
              <span className="text-white text-sm font-semibold">Hopkins & Partners Solicitors</span>
            </div>
            <div className="flex gap-4 text-slate-500 text-xs">
              <span>Services</span><span>About</span><span className="text-[#00d4ff]">Contact</span>
            </div>
          </div>

          {/* Chat area */}
          <div className="p-4">
            <div ref={scrollRef} className="h-80 overflow-y-auto space-y-3 mb-4 pr-1">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#1a3a5c] border border-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">⚖️</div>
                  )}
                  <div className={`max-w-[80%] text-xs px-3 py-2.5 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#00d4ff]/15 text-[#00d4ff] rounded-tr-sm'
                      : 'bg-white/5 text-slate-300 rounded-tl-sm'
                  }`}>
                    {m.content || <span className="animate-pulse text-slate-500">● ● ●</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors border border-white/5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask a question..."
                disabled={streaming}
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#00d4ff]/50 disabled:opacity-50"
              />
              <button
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#00d4ff]/15 text-[#00d4ff] text-sm font-semibold border border-[#00d4ff]/20 hover:bg-[#00d4ff]/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for solicitors</p>
          <p className="text-slate-400 text-xs">Deflects <span className="text-white">40–60% of routine enquiry calls</span>. Captures leads at 2am when staff aren't available. Qualifies interest before a solicitor's time is spent.</p>
        </div>
      </div>
    </main>
  )
}
