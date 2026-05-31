import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Milestone Global IT Limited',
  description: 'Privacy Policy for Milestone Global IT Limited. Learn how we collect, use, and protect your personal data in compliance with UK GDPR.',
}

const sections = [
  {
    title: '1. Who We Are',
    content: `Milestone Global IT Limited ("we", "us", "our") is a UK-based company providing AI agent services including AI chatbots, workflow automation, AI consulting, and custom AI agent development.

For the purposes of UK data protection law, we are the data controller of your personal information.

Contact us: me@milestoneglobalit.co.uk`,
  },
  {
    title: '2. What Data We Collect',
    content: `We collect the following personal data:

Contact Form
• Full name
• Email address
• Phone number (optional)
• Company name (optional)
• Service interest
• Message content

AI Chat Widget
• Conversation messages you submit during a chat session
• Chat sessions are not stored persistently and are not linked to your identity

Website Usage
• IP address and browser information collected automatically by our hosting provider
• No cookies are set by us beyond what is strictly necessary`,
  },
  {
    title: '3. How We Use Your Data',
    content: `We use your personal data for the following purposes:

• To respond to your enquiry and provide the services you have requested
• To contact you about your submission and follow up on your interest in our services
• To improve our website and services

Our lawful basis for processing is legitimate interests (responding to business enquiries) and, where applicable, the performance of a contract.`,
  },
  {
    title: '4. Who We Share Your Data With',
    content: `We share your data only with the following trusted third-party service providers who process data on our behalf:

• Resend (resend.com) — email delivery service used to send us your contact form submissions. Data is processed in accordance with their privacy policy.
• Anthropic (anthropic.com) — AI provider powering our chat widget. Messages you send in the chat widget are processed by Anthropic to generate responses. Anthropic does not store or train on your messages by default. See Anthropic's privacy policy for details.
• Fasthosts (fasthosts.co.uk) — our UK-based web hosting provider.

We do not sell your personal data to any third party.`,
  },
  {
    title: '5. How Long We Keep Your Data',
    content: `We retain your contact form enquiry data for up to 2 years from the date of submission, or until you request deletion.

Chat widget conversations are not stored on our servers and are not retained after your session ends.

We may retain data longer if required by law or for legitimate business purposes such as resolving disputes.`,
  },
  {
    title: '6. Your Rights',
    content: `Under UK GDPR, you have the following rights regarding your personal data:

• Right of access — you can request a copy of the data we hold about you
• Right to rectification — you can ask us to correct inaccurate data
• Right to erasure — you can ask us to delete your data
• Right to restrict processing — you can ask us to limit how we use your data
• Right to data portability — you can request your data in a machine-readable format
• Right to object — you can object to our processing of your data

To exercise any of these rights, please contact us at me@milestoneglobalit.co.uk. We will respond within 30 days.`,
  },
  {
    title: '7. Cookies',
    content: `Our website uses only strictly necessary cookies required for the site to function. We do not use tracking cookies, advertising cookies, or any third-party analytics cookies.

You can control cookies through your browser settings. Disabling cookies may affect certain functionality of the website.`,
  },
  {
    title: '8. Data Security',
    content: `We take appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse. Our website is served over HTTPS and our servers are hosted in the United Kingdom.

However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    title: '9. International Transfers',
    content: `Some of our third-party providers (Anthropic, Resend) may process data outside the UK. Where this occurs, we ensure appropriate safeguards are in place in accordance with UK GDPR requirements, including standard contractual clauses or adequacy decisions.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. The date at the top of this page shows when it was last updated. We encourage you to review this policy periodically.

Continued use of our website after changes are made constitutes your acceptance of the updated policy.`,
  },
  {
    title: '11. Contact & Complaints',
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us at:

Email: me@milestoneglobalit.co.uk
Company: Milestone Global IT Limited
Location: United Kingdom

If you are unhappy with how we have handled your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) — the UK's data protection regulator — at ico.org.uk or by calling 0303 123 1113.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-mgil-bg">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#00d4ff] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to site
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 4L11 8L7 12L3 8Z" fill="white" opacity="0.9" />
              </svg>
            </div>
            <span className="text-sm font-bold gradient-text">Milestone Global IT Limited</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="section-label mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400">
            Last updated: <span className="text-slate-300">31 May 2026</span>
          </p>
          <p className="text-slate-400 mt-3 max-w-2xl">
            This Privacy Policy explains how Milestone Global IT Limited collects, uses, and protects
            your personal data in accordance with the UK General Data Protection Regulation (UK GDPR)
            and the Data Protection Act 2018.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="glass-card p-8">
              <h2 className="text-lg font-bold text-white mb-4">{section.title}</h2>
              <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="btn-ghost">
            ← Back to Milestone Global IT Limited
          </Link>
        </div>
      </div>
    </main>
  )
}
