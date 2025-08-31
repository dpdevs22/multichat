export function originFromHeaders(h: Headers): string {
  const host = h.get('x-forwarded-host') || h.get('host') || ''
  const proto = (h.get('x-forwarded-proto') || 'https').split(',')[0]
  return `${proto}://${host}`
}

export function redirectUri(origin: string, platform: 'twitch'|'youtube'|'discord'|'tiktok') {
  return `${origin}/api/oauth/${platform}/callback`
}
