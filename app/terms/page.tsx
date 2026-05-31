import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Milestone Global IT Limited',
  description: 'Terms and Conditions for services provided by Milestone Global IT Limited.',
}

const sections = [
  {
    title: '1. About Us',
    content: `These Terms and Conditions govern your use of the website at milestoneglobalit.co.uk and any services provided by Milestone Global IT Limited ("we", "us", "our").

By accessing our website or engaging our services, you agree to these terms. If you do not agree, please do not use our website or services.

Contact: me@milestoneglobalit.co.uk`,
  },
  {
    title: '2. Our Services',
    content: `We provide the following services to businesses:

• AI Chatbots for Business — custom AI chatbots for customer support and lead generation
• Workflow Automation — end-to-end business process automation using AI agents
• AI Consulting — strategic guidance on AI adoption and implementation
• Custom AI Agent Development — bespoke AI agents built to your specifications

All services are subject to a separate written agreement or statement of work agreed between you and us prior to commencement.`,
  },
  {
    title: '3. Quotes & Pricing',
    content: `Prices displayed on this website (e.g. "from £1,500") are indicative starting prices only and do not constitute a binding offer. Final pricing will be confirmed in a written proposal or statement of work.

All prices are exclusive of VAT unless otherwise stated. VAT will be added at the prevailing UK rate where applicable.

We reserve the right to update our pricing at any time. Price changes will not affect projects already agreed in writing.`,
  },
  {
    title: '4. Engagement & Payment',
    content: `For all projects:

• A written proposal or statement of work will be provided before work commences
• A deposit (typically 50%) is required before work begins unless otherwise agreed
• The remaining balance is due on project completion or as specified in the proposal
• Invoices are payable within 14 days of the invoice date
• Late payments may incur interest at 8% above the Bank of England base rate under the Late Payment of Commercial Debts Act 1998`,
  },
  {
    title: '5. Delivery & Timelines',
    content: `Estimated timelines will be outlined in the project proposal. Timelines are estimates and may be affected by:

• Delays in receiving required information, access, or approvals from you
• Third-party service availability
• Scope changes requested during the project

We will communicate any significant delays as soon as they become apparent. Timeline extensions caused by your delays will not constitute a breach of contract on our part.`,
  },
  {
    title: '6. Client Responsibilities',
    content: `To enable us to deliver our services, you agree to:

• Provide accurate and complete information as reasonably requested
• Respond to queries and requests for approval in a timely manner
• Ensure you hold appropriate rights to any materials, data, or content you provide to us
• Comply with all applicable laws in your use of the services and any systems we deliver`,
  },
  {
    title: '7. Intellectual Property',
    content: `Upon full payment of all amounts due, all custom deliverables created specifically for you (code, content, configurations) will be owned by you.

We retain ownership of any pre-existing tools, frameworks, methodologies, or intellectual property used in delivering the services. We grant you a non-exclusive, perpetual licence to use these as incorporated into your deliverables.

We may reference your company name as a client for marketing purposes unless you request otherwise in writing.`,
  },
  {
    title: '8. Confidentiality',
    content: `Both parties agree to keep confidential any non-public information disclosed during the course of the engagement. This includes business processes, technical systems, pricing, and strategic information.

This obligation does not apply to information that is publicly available, already known to the receiving party, or required to be disclosed by law.`,
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by law:

• Our total liability to you for any claim arising from our services shall not exceed the total fees paid by you in the 12 months preceding the claim
• We are not liable for indirect, consequential, or incidental losses including lost profits, lost data, or business interruption
• We are not liable for failures caused by third-party services (including AI providers, cloud services, or APIs) outside our reasonable control

Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be limited by law.`,
  },
  {
    title: '10. Warranties & Disclaimers',
    content: `We warrant that our services will be performed with reasonable skill and care.

AI-powered systems, including chatbots and automation agents, may occasionally produce inaccurate, incomplete, or unexpected outputs. We do not warrant that AI outputs will be error-free. You are responsible for reviewing and validating AI-generated content before relying on it for business decisions.

The website is provided "as is" without warranties of any kind regarding uptime, accuracy, or fitness for a particular purpose.`,
  },
  {
    title: '11. Termination',
    content: `Either party may terminate a project engagement by giving 14 days' written notice. On termination:

• You will pay for all work completed up to the termination date
• We will deliver all completed work to you upon receipt of payment
• Any deposit paid is non-refundable unless termination is due to our material breach

We reserve the right to terminate immediately if you breach these terms or fail to make payment.`,
  },
  {
    title: '12. Governing Law',
    content: `These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales.

Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: '13. Changes to These Terms',
    content: `We may update these Terms and Conditions from time to time. The date at the top of this page shows when they were last updated.

For ongoing projects, material changes will be communicated to you directly. Continued use of our website or services after changes are posted constitutes acceptance of the updated terms.`,
  },
]

export default function Terms() {
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
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Terms & Conditions
          </h1>
          <p className="text-slate-400">
            Last updated: <span className="text-slate-300">31 May 2026</span>
          </p>
          <p className="text-slate-400 mt-3 max-w-2xl">
            Please read these Terms and Conditions carefully before using our website or engaging our services.
            By proceeding, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-6">
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
