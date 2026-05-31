'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const SECTORS = ['Technology', 'Finance', 'Legal', 'Healthcare', 'Sales & Marketing', 'Engineering', 'HR & Admin', 'Other']
const WORK_TYPES = ['Permanent', 'Contract', 'Temporary', 'Part-time', 'Hybrid / Remote']

const EXAMPLE_SKILLS: Record<string, string> = {
  'Technology': `5+ years software engineering experience\nStrong Python and cloud (AWS/GCP/Azure)\nExperience with microservices and REST APIs\nCI/CD pipelines (GitHub Actions, Jenkins)\nAgile/Scrum environment\nTeam lead experience preferred but not essential\nStartup or scale-up background a plus\nBenefits: 25 days holiday, private health, stock options, flexible working`,
  'Finance': `ACA/ACCA/CIMA qualified or part-qualified\nManagement accounts production experience\nStrong Excel and financial modelling skills\nExperience with Xero, Sage, or similar\nVariance analysis and board reporting\nFP&A exposure desirable\nSME or owner-managed business experience preferred\nBenefits: study support, pension, 24 days holiday`,
  'Legal': `Qualified solicitor (2–5 PQE)\nResidential or commercial conveyancing experience\nCase management system experience (e.g. Insight, Eclipse)\nClient-facing and confident communicator\nHighly organised with strong attention to detail\nBenefits: competitive salary, bonus, private medical, hybrid working`,
  'Healthcare': `Registered Nurse (NMC registered) or equivalent\nMin 2 years post-qualification experience\nCommunity or primary care experience preferred\nEnhanced DBS required\nSystems: SystmOne or EMIS experience helpful\nPassionate about patient outcomes\nBenefits: NHS pension, CPD support, flexible shifts`,
  'Sales & Marketing': `3+ years B2B sales experience\nSaaS or technology sector preferred\nProven track record of hitting and exceeding quota\nExperience with Salesforce or HubSpot CRM\nStrong written and verbal communication\nNew business hunting rather than account management focus\nBenefits: uncapped commission, car allowance, 25 days holiday`,
  'Engineering': `HND/Degree in Mechanical or Electrical Engineering\nExperience in manufacturing or industrial environments\nCAD software proficiency (SolidWorks or AutoCAD)\nLean/continuous improvement exposure\nHealth & safety awareness\nFull UK driving licence preferred\nBenefits: company vehicle, overtime available, pension`,
  'HR & Admin': `CIPD Level 5 qualified or working towards\nGeneralist HR experience covering the full employee lifecycle\nER case management experience essential\nStrong knowledge of UK employment law\nHRIS experience (Workday, BambooHR, or similar)\nConfident advising managers at all levels\nBenefits: hybrid working, 28 days holiday, wellbeing budget`,
  'Other': `Please describe the key skills, experience required, qualifications, and any specific requirements for this role.\n\nAlso include any benefits or selling points of the role.`,
}

export default function JDPage() {
  const [jobTitle, setJobTitle] = useState('Senior Software Engineer')
  const [sector, setSector] = useState(SECTORS[0])
  const [location, setLocation] = useState('Bristol (Hybrid)')
  const [salaryRange, setSalaryRange] = useState('£65,000 – £80,000')
  const [workType, setWorkType] = useState(WORK_TYPES[0])
  const [keySkills, setKeySkills] = useState(EXAMPLE_SKILLS[SECTORS[0]])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setKeySkills(EXAMPLE_SKILLS[sector] ?? '')
    setOutput('')
  }, [sector])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!keySkills.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/hr-recruitment/jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, sector, location, salaryRange, workType, keySkills }),
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
          <Link href="/admin/hr-recruitment" className="text-slate-500 hover:text-[#6366f1] text-sm transition-colors">← HR & Recruitment Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Job Description Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Enter role details — AI writes a compelling, inclusive JD ready to post</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input panel */}
          <div className="glass-card p-6 flex flex-col gap-3">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Job Title</label>
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6366f1]/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Sector</label>
                <select value={sector} onChange={e => setSector(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6366f1]/50">
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Work Type</label>
                <select value={workType} onChange={e => setWorkType(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6366f1]/50">
                  {WORK_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6366f1]/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Salary Range</label>
                <input value={salaryRange} onChange={e => setSalaryRange(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#6366f1]/50" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Key Skills, Requirements & Benefits</label>
              <textarea
                value={keySkills}
                onChange={e => setKeySkills(e.target.value)}
                rows={12}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#6366f1]/50 resize-none font-mono leading-relaxed"
                placeholder="List key skills, experience required, qualifications, and benefits..."
              />
            </div>
            <button
              onClick={generate}
              disabled={loading || !keySkills.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#10b981] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Writing JD...' : 'Generate Job Description →'}
            </button>
          </div>

          {/* Output panel */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Job Description</label>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 hover:bg-[#6366f1]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy All'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 min-h-[400px]"
            >
              {loading && !output
                ? <span className="animate-pulse text-slate-500">Writing your job description...</span>
                : output || <span className="text-slate-600">Your job description will appear here — role overview, responsibilities, requirements, desirable skills, and a compelling benefits section. Ready to paste into Indeed, LinkedIn, or your website.</span>
              }
            </div>
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for recruiters</p>
          <p className="text-slate-400 text-xs">35 mins per JD × 20 roles/month = <span className="text-white">11+ hours saved</span>. Better JDs attract better candidates — fewer irrelevant applications.</p>
        </div>
      </div>
    </main>
  )
}
