type Entry = { count: number; reset: number }
const store = new Map<string, Entry>()

export function checkRateLimit(key: string, limit = 20, windowSec = 60): { allowed: boolean } {
  const now = Date.now()
  const entry = store.get(key)
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowSec * 1000 })
    return { allowed: true }
  }
  if (entry.count >= limit) return { allowed: false }
  entry.count++
  return { allowed: true }
}

export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
