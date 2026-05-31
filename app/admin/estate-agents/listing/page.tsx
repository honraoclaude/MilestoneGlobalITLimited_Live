'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const PROPERTY_TYPES = ['Detached House', 'Semi-detached House', 'Terraced House', 'Flat / Apartment', 'Bungalow', 'Commercial Property']

const EXAMPLE_FEATURES: Record<string, string> = {
  'Detached House': `Private driveway for 3 cars and detached double garage\nSouth-facing rear garden approx 80ft, mature planting, patio area\nOpen-plan kitchen/diner with bi-fold doors to garden, quartz worktops, integrated appliances\nLarge sitting room with original feature fireplace\nMaster bedroom with en-suite and fitted wardrobes\nLoft converted to 4th bedroom/office with Velux windows\nUnderfloor heating throughout ground floor\nClose to outstanding-rated primary school (0.4 miles), train station (0.7 miles)`,
  'Semi-detached House': `Off-road parking for 2 cars\nWest-facing rear garden with lawn and decked entertaining area\nKitchen/diner extended to rear, granite worktops, range cooker\nThrough lounge with bay window to front\nFamily bathroom fully tiled with separate shower enclosure\nCatched loft with potential to convert (subject to planning)\nGas central heating, combi boiler replaced 2022\nQuiet residential street, walking distance to local shops and secondary school`,
  'Flat / Apartment': `Second floor apartment with lift access\nPrivate allocated parking space in secure underground car park\nOpen-plan living/dining with large Juliet balcony\nModern fitted kitchen with integrated appliances\nPrincipal bedroom with fitted wardrobes\nContemporary bathroom with walk-in shower\nShare of freehold, 987 years remaining\nConcierge service, communal roof terrace`,
  'Terraced House': `Victorian terraced house retaining many period features\nPull-through lounge with original fireplaces and stripped floorboards\nRear kitchen extension with skylights and bi-fold doors\nCourt yard garden, low maintenance, rear access\nMaster double bedroom to front with fitted storage\nLoft space with boarding (scope to convert)\nNew combi boiler 2023, full rewire 2021\nPrime location: 5 mins walk to high street and tube station`,
  'Bungalow': `Level access throughout — ideal for downsizers or those with mobility needs\nLarge plot with established front and rear gardens, greenhouse\nSitting room with feature fireplace and French doors to garden\nExtended kitchen/breakfast room with vaulted ceiling\nTwo generous double bedrooms, both with fitted wardrobes\nWet room fully tiled, walk-in level-access shower\nDouble garage with utility area and electric door\nQuiet cul-de-sac position, close to village amenities`,
  'Commercial Property': `Ground floor retail/office unit on busy high street\nApprox 1,200 sq ft of flexible open-plan space\nShop frontage with dual display windows\nKitchenette and staff WC facilities\nSeparate storage/stock room to rear\nNew 10-year full repairing lease available\nRatable value £18,500 — small business rates relief may apply\nHigh footfall location near major bus routes`,
}

export default function ListingPage() {
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0])
  const [bedrooms, setBedrooms] = useState('4')
  const [bathrooms, setBathrooms] = useState('2')
  const [area, setArea] = useState('Clifton, Bristol')
  const [askingPrice, setAskingPrice] = useState('£575,000')
  const [keyFeatures, setKeyFeatures] = useState(EXAMPLE_FEATURES[PROPERTY_TYPES[0]])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setKeyFeatures(EXAMPLE_FEATURES[propertyType] ?? '')
    setOutput('')
  }, [propertyType])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  async function generate() {
    if (!keyFeatures.trim()) return
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/estate-agents/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyType, bedrooms, bathrooms, area, askingPrice, keyFeatures }),
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
          <Link href="/admin/estate-agents" className="text-slate-500 hover:text-[#f59e0b] text-sm transition-colors">← Estate Agent Demos</Link>
        </div>

        <div className="mb-6">
          <h1 className="text-white font-black text-xl">Property Listing Writer</h1>
          <p className="text-slate-500 text-xs mt-1">Enter property details — AI writes a compelling, Rightmove-ready listing in seconds</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input panel */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Property Type</label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50"
              >
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Bedrooms</label>
                <input value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Bathrooms</label>
                <input value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Area / Location</label>
                <input value={area} onChange={e => setArea(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Asking Price</label>
                <input value={askingPrice} onChange={e => setAskingPrice(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#f59e0b]/50" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Key Features & Notes</label>
              <textarea
                value={keyFeatures}
                onChange={e => setKeyFeatures(e.target.value)}
                rows={12}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs focus:outline-none focus:border-[#f59e0b]/50 resize-none font-mono leading-relaxed"
                placeholder="List the key features, room descriptions, garden, parking, location highlights..."
              />
            </div>
            <button
              onClick={generate}
              disabled={loading || !keyFeatures.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#f472b6] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Writing listing...' : 'Generate Listing →'}
            </button>
          </div>

          {/* Output panel */}
          <div className="glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Rightmove-Ready Listing</label>
              {output && !loading && (
                <button onClick={copy} className="text-xs px-3 py-1.5 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20 hover:bg-[#f59e0b]/20 transition-colors">
                  {copied ? '✓ Copied' : 'Copy All'}
                </button>
              )}
            </div>
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-black/20 rounded-xl p-4 border border-white/5 min-h-[400px]"
            >
              {loading && !output
                ? <span className="animate-pulse text-slate-500">Writing your listing...</span>
                : output || <span className="text-slate-600">Your listing will appear here — a headline description (200–300 words) followed by key features bullets, ready to paste into Rightmove or Zoopla.</span>
              }
            </div>
          </div>
        </div>

        <div className="mt-4 glass-card p-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">ROI for estate agents</p>
          <p className="text-slate-400 text-xs">25 mins per listing × 20 listings/month = <span className="text-white">8+ hours saved</span>. Better descriptions generate more viewings — viewings generate offers.</p>
        </div>
      </div>
    </main>
  )
}
