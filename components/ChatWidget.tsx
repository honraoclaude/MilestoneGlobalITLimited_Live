'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const SAVE_LEAD_RE = /<SAVE_LEAD>([\s\S]*?)<\/SAVE_LEAD>/

function extractAndStripLead(text: string): { clean: string; lead: Record<string, string> | null } {
  const match = SAVE_LEAD_RE.exec(text)
  if (!match) return { clean: text, lead: null }
  try {
    const lead = JSON.parse(match[1])
    return { clean: text.replace(match[0], '').trim(), lead }
  } catch {
    return { clean: text.replace(match[0], '').trim(), lead: null }
  }
}

// Strip the tag (including partial mid-stream) before rendering
function displayContent(text: string): string {
  return text
    .replace(/<SAVE_LEAD>[\s\S]*?<\/SAVE_LEAD>/g, '')
    .replace(/<SAVE_LEAD>[\s\S]*$/, '')
    .trim()
}

const WELCOME: Message = {
  role: 'assistant',
  content:
    "Hi! I'm the Milestone Global IT AI assistant. I can answer questions about our AI agent services, pricing, and how we can help your business. What would you like to know?",
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [leadSaved, setLeadSaved] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  async function sendMessage(content: string) {
    if (!content.trim() || streaming) return

    const userMsg: Message = { role: 'user', content: content.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setStreaming(true)

    // Add empty assistant message that will be filled by stream
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok) {
        throw new Error('Failed to connect to AI')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            // Check final assistant message for lead capture tag
            setMessages((prev) => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last.role !== 'assistant') return prev
              const { clean, lead } = extractAndStripLead(last.content)
              if (lead) {
                fetch('/api/chat/lead', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(lead),
                }).then(() => setLeadSaved(true)).catch(() => {})
              }
              updated[updated.length - 1] = { ...last, content: clean }
              return updated
            })
            setStreaming(false)
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.text,
                }
                return updated
              })
            }
          } catch {
            // skip malformed chunk
          }
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errMsg}`,
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div
          className="glass-card flex flex-col overflow-hidden"
          style={{
            width: 'min(380px, calc(100vw - 32px))',
            height: '520px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.12)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0f0f1a]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="3" fill="white" opacity="0.9" />
                  <path d="M2 7h2M10 7h2M7 2v2M7 10v2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-white leading-none">Milestone Global IT AI</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-slate-500">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Lead saved banner */}
          {leadSaved && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                <circle cx="7" cy="7" r="6" stroke="#34d399" strokeWidth="1.4" />
                <path d="M4 7l2 2 4-4" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-green-400">Your details have been saved — we'll be in touch shortly.</span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center shrink-0 mr-2 mt-1">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="2" fill="white" opacity="0.9" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] text-white rounded-br-sm'
                      : 'bg-[#151525] border border-white/5 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {(msg.role === 'assistant' ? displayContent(msg.content) : msg.content) || (
                    // Typing indicator for empty streaming message
                    <span className="flex items-center gap-1 py-0.5">
                      {[0, 1, 2].map((j) => (
                        <span
                          key={j}
                          className="w-1.5 h-1.5 rounded-full bg-slate-400"
                          style={{ animation: `dot-bounce 1.4s ease-in-out ${j * 0.2}s infinite` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/5 bg-[#0f0f1a]/60">
            <div className="flex items-center gap-2 bg-[#151525] rounded-xl border border-white/8 px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                placeholder="Ask about our services..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="text-center text-xs text-slate-700 mt-1.5">
              Powered by Milestone Global IT · Claude
            </p>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 animate-float"
        style={{
          background: open
            ? 'rgba(15,15,26,0.9)'
            : 'linear-gradient(135deg,#00d4ff,#8b5cf6)',
          border: open ? '1px solid rgba(0,212,255,0.3)' : 'none',
          boxShadow: '0 8px 32px rgba(0,212,255,0.25)',
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3l12 12M15 3L3 15" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M19 11.5C19 15.09 15.87 18 12 18a8.3 8.3 0 01-2.56-.4L6 19l.9-2.9A5.96 5.96 0 015 12C5 8.41 8.13 5.5 12 5.5s7 2.91 7 6z"
              fill="white"
              opacity="0.95"
            />
            <circle cx="9" cy="12" r="1.2" fill="#00d4ff" />
            <circle cx="12" cy="12" r="1.2" fill="#00d4ff" />
            <circle cx="15" cy="12" r="1.2" fill="#00d4ff" />
          </svg>
        )}
      </button>
    </div>
  )
}
