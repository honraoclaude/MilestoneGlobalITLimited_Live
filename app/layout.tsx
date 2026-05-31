import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  metadataBase: new URL('https://milestoneglobalit.co.uk'),
  title: 'Milestone Global IT Limited — AI Agent Services for UK Businesses',
  description:
    'Milestone Global IT Limited builds custom AI chatbots, workflow automations, and AI agents for UK businesses. Save hours every week. Free consultation available.',
  keywords:
    'AI agents, AI chatbots, workflow automation, AI consulting, UK AI company, Milestone Global IT, business automation UK',
  openGraph: {
    title: 'Milestone Global IT Limited — AI Agent Services for UK Businesses',
    description:
      'Custom AI chatbots, workflow automation, and AI agents for UK businesses. Save hours every week. Free consultation available.',
    url: 'https://milestoneglobalit.co.uk',
    siteName: 'Milestone Global IT Limited',
    images: [
      {
        url: '/A.jpg',
        width: 1200,
        height: 630,
        alt: 'Milestone Global IT Limited — AI Agent Services for UK Businesses',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Milestone Global IT Limited — AI Agent Services for UK Businesses',
    description:
      'Custom AI chatbots, workflow automation, and AI agents for UK businesses. Save hours every week.',
    images: ['/A.jpg'],
  },
  verification: {
    google: 'google0ce8d791806dcacc',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://milestoneglobalit.co.uk',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://milestoneglobalit.co.uk/#organization',
      name: 'Milestone Global IT Limited',
      url: 'https://milestoneglobalit.co.uk',
      logo: 'https://milestoneglobalit.co.uk/A.jpg',
      email: 'me@milestoneglobalit.co.uk',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'GB',
      },
      sameAs: [],
      description:
        'UK-based AI agent services company providing custom AI chatbots, workflow automation, AI consulting, and custom AI agent development for businesses.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://milestoneglobalit.co.uk/#website',
      url: 'https://milestoneglobalit.co.uk',
      name: 'Milestone Global IT Limited',
      publisher: { '@id': 'https://milestoneglobalit.co.uk/#organization' },
    },
    {
      '@type': 'Service',
      name: 'AI Chatbots for Business',
      provider: { '@id': 'https://milestoneglobalit.co.uk/#organization' },
      description: 'Custom AI chatbots for customer support, lead qualification, and 24/7 business engagement.',
      areaServed: 'GB',
      offers: { '@type': 'Offer', price: '1500', priceCurrency: 'GBP', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'Service',
      name: 'Workflow Automation',
      provider: { '@id': 'https://milestoneglobalit.co.uk/#organization' },
      description: 'End-to-end automation of business processes using AI agents. Connects CRMs, ERPs, email, and more.',
      areaServed: 'GB',
      offers: { '@type': 'Offer', price: '2000', priceCurrency: 'GBP', availability: 'https://schema.org/InStock' },
    },
    {
      '@type': 'Service',
      name: 'AI Consulting',
      provider: { '@id': 'https://milestoneglobalit.co.uk/#organization' },
      description: 'Strategic guidance on AI adoption, ROI analysis, and roadmap planning for UK businesses.',
      areaServed: 'GB',
      offers: { '@type': 'Offer', price: '500', priceCurrency: 'GBP', priceSpecification: { '@type': 'UnitPriceSpecification', unitText: 'DAY' } },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-GB" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-mgil-bg text-slate-200 font-sans antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
