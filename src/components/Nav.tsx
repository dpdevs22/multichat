'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const links = [
  { href: '/', label: 'Home' },
  { href: '/profile', label: 'Profile' },
  { href: '/creator-chat', label: 'Creator Chat' },
  { href: '/chat', label: 'Chat' },
  { href: '/admin/creators', label: 'Creators (Admin)' },
  { href: '/admin/analytics', label: 'Analytics (Admin)' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="font-bold">Project Red Labs</div>
        <div className="flex gap-2 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={clsx('px-3 py-1 rounded-lg hover:bg-white/10', pathname===l.href && 'bg-white/10')}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
