'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Vapi from '@vapi-ai/web'
import Link from 'next/link'

const VAPI_PUBLIC_KEY = '6a200379-e2c7-4eef-bdb4-2ef01cf979fc'
const ASSISTANT_ID = 'cc61c50c-8929-41c0-8d5f-885ef7c761e6'

type TranscriptEntry = { role: 'user' | 'assistant'; text: string; id: number }
type CallStatus = 'idle' | 'connecting' | 'active' | 'ended'

const STATUS_LABELS: Record<CallStatus, string> = {
  idle: 'Ready',
  connecting: 'Connecting…',
  active: 'Live',
  ended: 'Call ended',
}

const STATUS_COLOURS: Record<CallStatus, string> = {
  idle: '#64748b',
  connecting: '#fbbf24',
  active: '#34d399',
  ended: '#f87171',
}

export default function VoiceAgentPage() {
  const vapiRef = useRef<Vapi | null>(null)
  const [status, setStatus] = useState<CallStatus>('idle')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [leadSaved, setLeadSaved] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const entryId = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY)
    vapiRef.current = vapi

    vapi.on('call-start', () => {
      setStatus('active')
      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    })

    vapi.on('call-end', () => {
      setStatus('ended')
      setIsSpeaking(false)
      if (timerRef.current) clearInterval(timerRef.current)
    })

    vapi.on('speech-start', () => setIsSpeaking(true))
    vapi.on('speech-end', () => setIsSpeaking(false))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('message', (msg: any) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.transcript?.trim()) {
        setTranscript((prev) => [
          ...prev,
          { role: msg.role, text: msg.transcript.trim(), id: entryId.current++ },
        ])
      }
      if (msg.type === 'tool-calls') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasSaveLead = msg.toolCallList?.some((t: any) => t.function?.name === 'save_lead')
        if (hasSaveLead) setLeadSaved(true)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on('error', (err: any) => {
      console.error('VAPI error', err)
      setStatus('ended')
      if (timerRef.current) clearInterval(timerRef.current)
    })

    return () => {
      vapi.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const startCall = useCallback(() => {
    setStatus('connecting')
    setTranscript([])
    setLeadSaved(false)
    setDuration(0)
    vapiRef.current?.start(ASSISTANT_ID)
  }, [])

  const stopCall = useCallback(() => {
    vapiRef.current?.stop()
  }, [])

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const isActive = status === 'active'
  const isConnecting = status === 'connecting'

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.9" />
                <path d="M7 4L11 8L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-black text-xl leading-none">Voice Agent Demo</h1>
              <p className="text-slate-500 text-xs mt-0.5">Alex — Milestone Global IT</p>
            </div>
          </div>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border-b border-white/5 overflow-x-auto">
          <Link href="/admin" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Leads</Link>
          <span className="px-4 pb-3 text-sm font-semibold text-[#00d4ff] border-b-2 border-[#00d4ff] -mb-px whitespace-nowrap">Voice Agent</span>
          <Link href="/admin/solicitors" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Solicitor Demos</Link>
          <Link href="/admin/accountants" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Accountant Demos</Link>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Estate Agent Demos</Link>
          <Link href="/admin/hr-recruitment" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">HR &amp; Recruitment</Link>
          <Link href="/admin/mortgage-brokers" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap">Mortgage Brokers</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Call panel */}
          <div className="glass-card p-8 flex flex-col items-center gap-6">

            {/* Status */}
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: STATUS_COLOURS[status],
                  boxShadow: isActive ? `0 0 8px ${STATUS_COLOURS[status]}` : 'none',
                  animation: isActive || isConnecting ? 'pulse 2s infinite' : 'none',
                }}
              />
              <span className="text-sm text-slate-400 font-medium">{STATUS_LABELS[status]}</span>
              {isActive && (
                <span className="text-sm text-slate-500 font-mono ml-1">{formatDuration(duration)}</span>
              )}
            </div>

            {/* Mic button */}
            <button
              onClick={isActive ? stopCall : startCall}
              disabled={isConnecting}
              className="relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #f87171, #ef4444)'
                  : 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
                boxShadow: isActive
                  ? '0 0 40px rgba(248,113,113,0.4)'
                  : '0 0 40px rgba(0,212,255,0.3)',
              }}
            >
              {/* Speaking pulse rings */}
              {isActive && isSpeaking && (
                <>
                  <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'rgba(248,113,113,0.5)' }} />
                  <span className="absolute -inset-3 rounded-full animate-ping opacity-10" style={{ background: 'rgba(248,113,113,0.3)', animationDelay: '0.15s' }} />
                </>
              )}
              {isConnecting ? (
                <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : isActive ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" rx="2" fill="white" />
                  <rect x="14" y="4" width="4" height="16" rx="2" fill="white" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="2" width="6" height="12" rx="3" fill="white" />
                  <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="21" x2="16" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>

            <p className="text-slate-500 text-sm text-center">
              {isActive ? 'Click to end the call' : isConnecting ? 'Connecting to Alex…' : 'Click to start a demo call with Alex'}
            </p>

            {/* Lead saved badge */}
            {leadSaved && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 w-full justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#34d399" strokeWidth="1.4" />
                  <path d="M5 8l2 2 4-4" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-green-400 font-medium">Lead saved to dashboard</span>
              </div>
            )}

            {/* Instructions */}
            <div className="w-full pt-2 border-t border-white/5">
              <p className="text-xs text-slate-600 text-center leading-relaxed">
                Alex will greet you, answer questions about our services, and collect your contact details to save as a lead.
              </p>
            </div>
          </div>

          {/* Transcript panel */}
          <div className="glass-card flex flex-col overflow-hidden" style={{ height: '480px' }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Live Transcript</span>
              {transcript.length > 0 && (
                <button
                  onClick={() => setTranscript([])}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-600 text-sm text-center">
                    {isActive ? 'Listening…' : 'Transcript will appear here during the call'}
                  </p>
                </div>
              ) : (
                transcript.map((entry) => (
                  <div key={entry.id} className={`flex gap-2 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {entry.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        entry.role === 'user'
                          ? 'bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] text-white rounded-br-sm'
                          : 'bg-[#151525] border border-white/5 text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {entry.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
