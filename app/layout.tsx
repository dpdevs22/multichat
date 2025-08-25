import '@/src/styles/globals.css'
import Nav from '@/src/components/Nav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Creator Hub', description: 'Unify your live chat and events across platforms.' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
