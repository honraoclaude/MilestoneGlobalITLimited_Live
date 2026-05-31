'use client'

import { useTransition } from 'react'
import { updateLeadStatus } from './actions'

const STATUS_COLOURS: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  contacted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  won: 'bg-green-500/15 text-green-400 border-green-500/25',
  lost: 'bg-red-500/15 text-red-400 border-red-500/25',
}

export default function StatusSelect({ id, status }: { id: number; status: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateLeadStatus(id, e.target.value))}
      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-opacity ${STATUS_COLOURS[status] ?? STATUS_COLOURS.new} ${pending ? 'opacity-50' : ''}`}
      style={{ background: 'transparent' }}
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="won">Won</option>
      <option value="lost">Lost</option>
    </select>
  )
}
