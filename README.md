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


## Webhook ingestion & normalization
This repo now includes example webhook endpoints to ingest events from platforms:
- `/api/webhooks/twitch` — basic Twitch EventSub handler (challenge + notifications)
- `/api/webhooks/youtube` — example handler for YouTube push messages (PubSubHubbub)
- `/api/webhooks/discord` — example handler for events from a Discord bot/process

These endpoints normalize provider payloads and insert into Supabase (`chat_messages` / `platform_events`)
using the service role (`SUPABASE_SERVICE_ROLE`). For production, you should:
- Verify signatures for each provider (Twitch EventSub signature header, Discord signature if using interactions, YouTube verification).
- Rate-limit and authenticate sources.
- Optionally use Supabase Edge Functions to do provider-specific normalization and validation close to the DB.

An example Supabase Edge Function scaffold is included at `supabase/functions/normalize_event/index.ts`.


## Implemented: Full webhook & bot examples

### Twitch EventSub
- `app/api/webhooks/twitch` now performs HMAC SHA256 verification using `TWITCH_EVENTSUB_SECRET`.
- For webhook subscription, create EventSub subscriptions in Twitch dev console or via the API, using the same callback URL:
  - `${NEXT_PUBLIC_URL}/api/webhooks/twitch`
- When Twitch sends the verification challenge, the endpoint responds with the challenge string.
- You *must* set `TWITCH_EVENTSUB_SECRET` in your environment (choose a random secret) and use it when creating subscriptions.

### Discord bot forwarder
- `workers/discord/bot.js` is a simple Discord bot (discord.js) that forwards messages to `/api/webhooks/discord`.
- To attribute messages to a creator, the bot accepts an in-message token (`!owner: <creator-id>`) in this demo. In production, map Discord channels/guilds to creator `user_id` server-side.
- Set `DISCORD_BOT_TOKEN` and `WEBHOOK_ENDPOINT` and run the bot on a VM or small process.

### YouTube PubSubHubbub
- `app/api/webhooks/youtube` handles GET verification (hub.challenge) and POST notifications forwarded from a middle layer.
- `app/api/webhooks/youtube/subscribe` helps you subscribe to a channel's video feed (use `channelId` in POST JSON).
- For live chat events (superchat, memberships), you may need to poll the YouTube LiveChat API or run a middle layer that parses live chat and forwards normalized JSON to this webhook.

