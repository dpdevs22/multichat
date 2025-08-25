export function originFromHeaders(headers: Headers) {
  return headers.get('x-forwarded-proto') && headers.get('x-forwarded-host')
    ? `${headers.get('x-forwarded-proto')}://${headers.get('x-forwarded-host')}`
    : headers.get('origin') || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
}
export function redirectUri(origin: string, platform: string) {
  return `${origin}/api/oauth/${platform}/callback`
}
export function randomState() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n=>n.toString(16)).join('')
}
