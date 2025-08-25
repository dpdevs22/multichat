'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabaseClient'

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [tiktokUser, setTikTokUser] = useState('')

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=> setUserId(data.user?.id ?? null))
  }, [])

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <section className="card space-y-4">
        <h2 className="h2">Authentication</h2>
        {userId ? (
          <div className="space-y-2">
            <div className="text-sm text-neutral-400">User ID: {userId}</div>
            <button className="btn" onClick={()=>supabase.auth.signOut().then(()=>location.reload())}>Sign out</button>
          </div>
        ) : (
          <div className="space-y-2">
            <input className="input" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <button className="btn" onClick={async ()=>{
              const { error } = await supabase.auth.signInWithOtp({ email })
              alert(error ? error.message : 'Check your email for magic link')
            }}>Send magic link</button>
          </div>
        )}

        <h2 className="h2 mt-6">Subscription</h2>
        <div className="flex gap-2">
          <form method="POST" action="/api/stripe/create-checkout-session">
            <button className="btn" type="submit">Start Subscription</button>
          </form>
          <form method="POST" action="/api/stripe/create-portal-session">
            <button className="btn" type="submit">Manage Billing</button>
          </form>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="h2">Link Accounts</h2>
        {!userId && <div className="text-sm text-red-400">Sign in to link your accounts.</div>}
        <div className="grid gap-2">
          {['twitch','youtube','discord'].map(p => (
            <button key={p} className="btn w-full capitalize" disabled={!userId} onClick={async ()=>{
              const res = await fetch(`/api/oauth/${p}/start?uid=${userId}`, { redirect: 'follow' })
              if (res.redirected) window.location.href = res.url
              else alert(await res.text())
            }}>Link {p}</button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="block text-sm">TikTok username (for live connector)</label>
          <div className="flex gap-2">
            <input className="input" placeholder="tiktok_username" value={tiktokUser} onChange={e=>setTikTokUser(e.target.value)} />
            <button className="btn" onClick={async ()=>{
              if (!userId) return alert('Sign in first')
              const { error } = await supabase.from('linked_accounts').insert({ user_id: userId, platform: 'tiktok', username: tiktokUser })
              alert(error ? error.message : 'Saved')
            }}>Save</button>
          </div>
          <button className="btn w-full" disabled={!userId} onClick={async ()=>{
            const res = await fetch(`/api/oauth/tiktok/start?uid=${userId}`, { redirect: 'follow' })
            if (res.redirected) window.location.href = res.url
            else alert(await res.text())
          }}>Link TikTok (OAuth login)</button>
        </div>
      </section>
    </div>
  )
}
