const quickLinks = [
  { label: 'Services', href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-[#00d4ff]/08 pt-14 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.9" />
                  <path d="M7 4L11 8L13 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-black gradient-text leading-none">Milestone Global IT Limited</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
              Intelligent AI solutions for local and national businesses. Helping you
              automate, grow, and thrive with cutting-edge AI agent technology.
            </p>
            {/* Social placeholders — update hrefs when profiles are live */}
            <div className="flex gap-3">
              {[
                { label: 'LI', name: 'LinkedIn' },
                { label: 'TW', name: 'X / Twitter' },
                { label: 'GH', name: 'GitHub' },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.name}
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-xs text-slate-500 hover:text-[#00d4ff] transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-500 hover:text-[#00d4ff] transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <rect x="2" y="3" width="12" height="10" rx="2" stroke="#00d4ff" strokeWidth="1.3" />
                  <path d="M2 6l6 4 6-4" stroke="#00d4ff" strokeWidth="1.3" />
                </svg>
                info@milestoneglobalit.co.uk
              </li>
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="7" r="3" stroke="#8b5cf6" strokeWidth="1.3" />
                  <path d="M8 10c-3 0-5 1.5-5 3" stroke="#8b5cf6" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                United Kingdom
              </li>
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="8" r="6" stroke="#00d4ff" strokeWidth="1.3" />
                  <path d="M8 5v3l2 2" stroke="#00d4ff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Mon–Fri, 9am–6pm GMT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} Milestone Global IT Limited. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-[#00d4ff] transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-[#00d4ff] transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
