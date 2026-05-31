'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const EXAMPLE_ROLE = `Job Title: Senior Software Engineer
Location: Bristol (Hybrid, 2 days in office)
Salary: £65,000 – £80,000

Essential Requirements:
- 5+ years software engineering experience
- Strong Python skills (production experience)
- Cloud platform experience (AWS, GCP, or Azure)
- REST API design and microservices architecture
- CI/CD pipeline experience (GitHub Actions or Jenkins)
- Collaborative, team-focused approach

Desirable:
- Experience leading or mentoring junior engineers
- Startup or scale-up background
- Knowledge of infrastructure as code (Terraform)`

const EXAMPLE_CV = `SARAH CHEN
sarah.chen@email.com | 07700 900123 | LinkedIn: /in/sarahchen-dev | Bristol, UK

SUMMARY
Senior Software Engineer with 7 years of experience building scalable Python-based
microservices and APIs in fast-paced environments. Currently at FinTech startup
PayStream, leading a team of 4 engineers.

EXPERIENCE

PayStream Ltd — Senior Engineer (2021–present)
• Led redesign of core payment processing API, reducing latency by 40%
• Migrated legacy monolith to microservices architecture on AWS (ECS + Lambda)
• Introduced GitHub Actions CI/CD pipeline, cutting deployment time from 2h to 12 mins
• Mentors 2 junior engineers through weekly 1-to-1s and code reviews

TechNova UK — Software Engineer (2018–2021)
• Built REST APIs in Python (FastAPI) serving 500k+ daily requests
• Worked closely with product and QA in an Agile/Scrum team of 8
• Contributed to open-source internal tooling (published on GitHub)

SKILLS
Python, FastAPI, Django | AWS (Lambda, ECS, RDS, S3) | Docker, Kubernetes
PostgreSQL, Redis | GitHub Actions, Jenkins | Terraform (basic) | REST, GraphQL

EDUCATION
BSc Computer Science, University of Bristol (2:1) — 2018`

export default function CVPage() {
  const [roleBrief, setRoleBrief] = useState(EXAMPLE_ROLE)
  const [cvText, setCvText] = useState(EXAMPLE_CV)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function assess() {
    if (!roleBrief.trim() || !cvText.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/hr-recruitment/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleBrief, cvText }),
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
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/hr-recruitment" className="text-slate-500 hover:text-[#10b981] text-sm transition-colors">← HR & Recruitment Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">CV Shortlister & Screener</h1>
          <p className="text-slate-500 text-xs mt-1">Paste the role brief and candidate CV — AI produces a structured assessment with fit rating and interview questions</p>
        </div>

        {/* Two input panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="glass-card p-5">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">Role Requirements</label>
            <textarea
              value={roleBrief}
              onChange={e => setRoleBrief(e.target.value)}
              rows={18}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#10b981]/50 resize-none font-mono leading-relaxed"
              placeholder="Paste the job description or list the key requirements..."
            />
          </div>
          <div className="glass-card p-5">
            <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">Candidate CV</label>
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              rows={18}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#10b981]/50 resize-none font-mono leading-relaxed"
              placeholder="Paste the candidate's CV here..."
            />
          </div>
        </div>

        <button
          onClick={assess}
          disabled={loading || !roleBrief.trim() || !cvText.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10b981] to-[#6366f1] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? 'Assessing candidate...' : 'Shortlist & Screen CV →'}
        </button>

        {/* Assessment output */}
        {(output || loading) && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold text-sm">Candidate Assessment</span>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 hover:bg-[#10b981]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy Assessment'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5"
            >
              {output || <span className="animate-pulse text-slate-500 text-xs">Assessing candidate against role requirements...</span>}
            </div>
          </div>
        )}

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for recruiters</p>
          <p className="text-slate-400 text-xs">8 mins per CV review × 50 CVs/week = <span className="text-white">6+ hours saved</span>. Better shortlists mean fewer wasted client interviews — and faster placements.</p>
        </div>
      </div>
    </main>
  )
}
