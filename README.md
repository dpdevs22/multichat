# Creator Hub (Next.js + Supabase + Stripe)

This starter includes:
- Landing, Profile, Creator Chat, Chat
- Admin: Creators list + detail; System analytics
- Stripe checkout/portal/webhook (basic)
- OAuth for Twitch, YouTube (Google), Discord, TikTok Login (start+callback implemented)
- Supabase SQL schema + RLS (`supabase/schema.sql`)
- TikTok worker for live chat/gifts

## Setup
1) Create Supabase project and run `supabase/schema.sql` in the SQL editor.
2) Copy `.env.example` → `.env.local` and fill in values.
3) On Vercel, set the same envs. Set OAuth redirect URIs to:
   - `${NEXT_PUBLIC_URL}/api/oauth/twitch/callback`
   - `${NEXT_PUBLIC_URL}/api/oauth/youtube/callback`
   - `${NEXT_PUBLIC_URL}/api/oauth/discord/callback`
   - `${NEXT_PUBLIC_URL}/api/oauth/tiktok/callback`
4) On `/profile`, sign in via email magic link, then link accounts (buttons call `/api/oauth/*/start?uid=<your-id>`).

> Note: For production, secure the OAuth state/user binding properly and use server-side session-based identification. This demo stores `state → user_id` in Supabase and passes the uid from the client.

## TikTok
- Use the worker in `workers/tiktok/` to ingest live chat/gifts by username (connector limitation). You may also link TikTok via OAuth Login to identify the account.

## Replace SSE demo with realtime
- Swap the `/api/chat/*` SSE endpoints with Supabase Realtime that listens on `chat_messages` and `platform_events` for the signed-in `user_id`.
