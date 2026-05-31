'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.9" />
              <path d="M7 4L11 8L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-white font-black text-lg">Admin Dashboard</span>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="text-white font-bold text-xl mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-6">Milestone Global IT Limited</p>

          <form action={action} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="form-input w-full"
                placeholder="Enter admin password"
              />
            </div>

            {state?.error && (
              <p className="text-red-400 text-sm">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full justify-center mt-1"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
