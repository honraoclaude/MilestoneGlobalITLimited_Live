'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Msg = { role: 'user' | 'assistant'; content: string }

const WELCOME = "Hello! I'm the virtual assistant for Hartley & Co Estate Agents. How can I help you today? I can answer questions about buying, selling, or renting a property."

const SUGGESTIONS = [
  'How long does it take to sell a house?',
  'What are your fees?',
  'Can I book a free valuation?',
  'What is stamp duty?',
]

export default function EstateAgentChatbotPage() {
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
    setMsgs([...history, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/estate-agents/chatbot', {
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
          <Link href="/admin/estate-agents" className="text-slate-500 hover:text-[#f59e0b] text-sm transition-colors">← Estate Agent Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Client Enquiry Chatbot</h1>
          <p className="text-slate-500 text-xs mt-1">As seen on Hartley & Co Estate Agents website (demo)</p>
        </div>

        <div className="glass-card overflow-hidden">
          {/* Mock website header */}
          <div className="bg-slate-900 px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#f59e0b]/20 flex items-center justify-center text-xs">🏡</div>
              <span className="text-white text-sm font-semibold">Hartley & Co Estate Agents</span>
            </div>
            <div className="flex gap-4 text-slate-500 text-xs">
              <span>Properties</span><span>Sell</span><span className="text-[#f59e0b]">Contact</span>
            </div>
          </div>

          <div className="p-4">
            <div ref={scrollRef} className="h-80 overflow-y-auto space-y-3 mb-4 pr-1">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#f59e0b]/20 border border-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">🏡</div>
                  )}
                  <div className={`max-w-[80%] text-xs px-3 py-2.5 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#f59e0b]/15 text-[#f59e0b] rounded-tr-sm'
                      : 'bg-white/5 text-slate-300 rounded-tl-sm'
                  }`}>
                    {m.content || <span className="animate-pulse text-slate-500">● ● ●</span>}
                  </div>
                </div>
              ))}
            </div>

            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors border border-white/5">
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
                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#f59e0b]/50 disabled:opacity-50"
              />
              <button
                onClick={() => send()}
                disabled={streaming || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] text-sm font-semibold border border-[#f59e0b]/20 hover:bg-[#f59e0b]/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for estate agents</p>
          <p className="text-slate-400 text-xs">Deflects <span className="text-white">40–60% of routine enquiry calls</span>. Books valuations and viewings at midnight. Qualifies buyers before an agent's time is spent.</p>
        </div>
      </div>
    </main>
  )
}
