'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type Msg = { role: 'user' | 'assistant'; content: string }
type Status = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'ended'

function b64ToBlob(b64: string): Blob {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: 'audio/mpeg' })
}

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Ready to connect',
  connecting: 'Connecting...',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
  ended: 'Call ended',
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function MortgageIntakePage() {
  const [status, setStatus] = useState<Status>('idle')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [error, setError] = useState<string | null>(null)
  const [secs, setSecs] = useState(0)

  const statusRef = useRef<Status>('idle')
  const recRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  function setS(s: Status) { statusRef.current = s; setStatus(s) }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs])

  useEffect(() => {
    if (status === 'idle' || status === 'ended') return
    const t = setInterval(() => setSecs(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  async function sendToAgent(userText: string, history: Msg[]) {
    setS('thinking')
    try {
      const res = await fetch('/api/mortgage-brokers/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')

      const { agentText, audioBase64 } = data
      const next: Msg[] = [
        ...history,
        ...(userText ? [{ role: 'user' as const, content: userText }] : []),
        { role: 'assistant' as const, content: agentText },
      ]
      setMsgs(next)
      setS('speaking')

      const audio = new Audio(URL.createObjectURL(b64ToBlob(audioBase64)))
      audioRef.current = audio
      audio.onended = () => { if (statusRef.current !== 'ended') startListening(next) }
      await audio.play()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed')
      setS('ended')
    }
  }

  function startListening(history: Msg[]) {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { setError('Speech recognition requires Chrome or Edge.'); setS('ended'); return }

    const r = new SR()
    recRef.current = r
    r.lang = 'en-GB'
    r.continuous = false
    r.interimResults = false
    r.onresult = (e: any) => {
      const text: string = e.results[0][0].transcript.trim()
      if (text) sendToAgent(text, history)
      else startListening(history)
    }
    r.onerror = (e: any) => {
      if (statusRef.current === 'ended') return
      if (e.error === 'no-speech') startListening(history)
      else { setError(`Microphone: ${e.error}`); setS('ended') }
    }
    r.start()
    setS('listening')
  }

  async function startCall() {
    setS('connecting'); setMsgs([]); setError(null); setSecs(0)
    await sendToAgent('', [])
  }

  function endCall() {
    setS('ended')
    recRef.current?.abort()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
  }

  const isActive = status !== 'idle' && status !== 'ended'

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/mortgage-brokers" className="text-slate-500 hover:text-[#3b82f6] text-sm transition-colors">← Mortgage Broker Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Client Intake Voice Agent</h1>
          <p className="text-slate-500 text-xs mt-1">Alex — AI mortgage consultant at Clearstone Mortgages</p>
        </div>

        <div className="glass-card p-8">
          <div className="flex flex-col items-center gap-5 mb-6">
            <div className="relative flex items-center justify-center">
              {status === 'speaking' && <div className="absolute w-32 h-32 rounded-full bg-[#3b82f6]/10 animate-ping" />}
              {status === 'listening' && <div className="absolute w-28 h-28 rounded-full border-2 border-[#3b82f6]/40 animate-pulse" />}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center text-3xl shadow-lg shadow-[#3b82f6]/20">
                🏠
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-bold">Alex</div>
              <div className="text-slate-400 text-sm">AI Mortgage Consultant · Clearstone Mortgages</div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : status === 'ended' ? 'bg-red-500' : 'bg-slate-600'}`} />
                <span className="text-slate-400 text-xs">{STATUS_LABEL[status]}</span>
                {isActive && <span className="text-slate-600 text-xs">{fmt(secs)}</span>}
              </div>
            </div>
          </div>

          {msgs.length > 0 && (
            <div ref={scrollRef} className="max-h-56 overflow-y-auto space-y-2 mb-6 p-3 rounded-xl bg-black/20 border border-white/5">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-xs px-3 py-2 rounded-xl leading-relaxed ${m.role === 'user' ? 'bg-[#3b82f6]/15 text-[#3b82f6] rounded-tr-sm' : 'bg-white/5 text-slate-300 rounded-tl-sm'}`}>
                    <span className="font-semibold opacity-60 mr-1.5">{m.role === 'user' ? 'You' : 'Alex'}</span>{m.content}
                  </div>
                </div>
              ))}
              {status === 'thinking' && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-slate-500 text-xs px-3 py-2 rounded-xl rounded-tl-sm"><span className="animate-pulse">● ● ●</span></div>
                </div>
              )}
            </div>
          )}

          {error && <div className="mb-5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>}

          <div className="flex flex-col items-center gap-4">
            {status === 'idle' && (
              <>
                <button onClick={startCall} className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-green-500/30">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.28-.28.68-.36 1.02-.18 1.12.44 2.34.68 3.58.68.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.58 3.57.14.34.06.74-.18 1.01L6.6 10.8z"/></svg>
                </button>
                <p className="text-slate-600 text-xs text-center max-w-[240px]">Call Alex to experience how AI handles mortgage enquiries — try asking about getting a mortgage to buy your first home.</p>
              </>
            )}
            {isActive && (
              <div className="flex items-center gap-10">
                <div className={`flex flex-col items-center gap-1 transition-opacity ${status === 'listening' ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-12 h-12 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center ${status === 'listening' ? 'animate-pulse' : ''}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" fill="#3b82f6"/><path d="M5 10a7 7 0 0 0 14 0" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="21" x2="15" y2="21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <span className="text-[#3b82f6] text-xs">{status === 'listening' ? 'Speak now' : status === 'thinking' ? 'Thinking' : 'Speaking'}</span>
                </div>
                <button onClick={endCall} className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-red-500/25">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.28-.28.68-.36 1.02-.18 1.12.44 2.34.68 3.58.68.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.58 3.57.14.34.06.74-.18 1.01L6.6 10.8z" transform="rotate(135 12 12)"/></svg>
                </button>
              </div>
            )}
            {status === 'ended' && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-slate-500 text-sm">Call ended · {fmt(secs)}</p>
                <button onClick={startCall} className="px-5 py-2.5 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] text-sm font-semibold border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 transition-colors">Call Again</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for mortgage brokers</p>
          <p className="text-slate-400 text-xs">40 mins per fact-find × 15 enquiries/week = <span className="text-white">10+ hours saved</span>. Clients registered instantly, even out of hours. No missed enquiries.</p>
        </div>
      </div>
    </main>
  )
}
