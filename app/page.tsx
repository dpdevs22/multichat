import Link from 'next/link'

export default function Page() {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <section className="card space-y-4">
        <h1 className="h1">One hub for creators</h1>
        <p>Aggregate chat, gifts, follows and subs from Twitch, YouTube, TikTok, Facebook, Trovo and Discord.</p>
        <div className="flex gap-3">
          <Link href="/profile" className="btn">Sign up / Sign in</Link>
          <Link href="/creator-chat" className="btn">See Creator Chat</Link>
        </div>
      </section>
      <section className="card">
        <ul className="list-disc pl-6 space-y-2">
          <li>Unified chat & events feed</li>
          <li>Stripe subscriptions per account</li>
          <li>Admin dashboards for creators and analytics</li>
        </ul>
      </section>
    </div>
  )
}
