import Link from 'next/link'
import { getLeads } from '@/lib/db'
import { logout } from './actions'
import StatusSelect from './StatusSelect'

function formatDate(iso: string) {
  const d = new Date(iso + 'Z')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminPage() {
  const leads = await getLeads()

  const total = leads.length
  const counts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    won: leads.filter(l => l.status === 'won').length,
    lost: leads.filter(l => l.status === 'lost').length,
  }

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
              <h1 className="text-white font-black text-xl leading-none">Leads Dashboard</h1>
              <p className="text-slate-500 text-xs mt-0.5">Milestone Global IT Limited</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-500 hover:text-[#00d4ff] transition-colors">
              Sign out →
            </button>
          </form>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border-b border-white/5">
          <span className="px-4 pb-3 text-sm font-semibold text-[#00d4ff] border-b-2 border-[#00d4ff] -mb-px">
            Leads
          </span>
          <Link href="/admin/phone-agent" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Phone Agent Demo
          </Link>
          <Link href="/admin/solicitors" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Solicitor Demos
          </Link>
          <Link href="/admin/accountants" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Accountant Demos
          </Link>
          <Link href="/admin/estate-agents" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Estate Agent Demos
          </Link>
          <Link href="/admin/hr-recruitment" className="px-4 pb-3 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            HR & Recruitment
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: total, colour: '#00d4ff' },
            { label: 'New', value: counts.new, colour: '#60a5fa' },
            { label: 'Contacted', value: counts.contacted, colour: '#fbbf24' },
            { label: 'Won', value: counts.won, colour: '#34d399' },
          ].map(({ label, value, colour }) => (
            <div key={label} className="glass-card p-5 text-center">
              <div className="text-3xl font-black mb-1" style={{ color: colour }}>{value}</div>
              <div className="text-slate-400 text-xs font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Leads table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">All Leads</span>
            <span className="text-slate-500 text-xs">{total} total</span>
          </div>

          {leads.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500 text-sm">
              No leads yet — they will appear here as soon as someone submits the contact form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Name', 'Email', 'Company', 'Service', 'Date', 'Message', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                    >
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{lead.name}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${lead.email}`} className="text-[#00d4ff] hover:underline">
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{lead.company ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{lead.service}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-xs">
                        <span className="block truncate" title={lead.message}>{lead.message}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect id={lead.id} status={lead.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
