export function checkBodySize(req: Request, maxBytes = 50_000): boolean {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > maxBytes) return false
  return true
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
