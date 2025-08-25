create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  is_admin boolean default false,
  subscription_status text,
  created_at timestamptz default now()
);

create table if not exists public.linked_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('twitch','youtube','discord','facebook','trovo','tiktok')),
  external_user_id text,
  access_token text,
  refresh_token text,
  username text,
  follower_count int,
  connected_at timestamptz default now()
);

create table if not exists public.streams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  stream_id text,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  stream_id uuid references public.streams(id) on delete set null,
  message_id text,
  timestamp timestamptz not null default now(),
  chatter_name text,
  text text,
  is_action boolean default false
);

create table if not exists public.platform_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  stream_id uuid references public.streams(id) on delete set null,
  event_type text not null check (event_type in ('follow','subscribe','gift','like','share','donation','raid')),
  amount int,
  metadata jsonb,
  timestamp timestamptz not null default now()
);

create table if not exists public.analytics_daily (
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  messages_count int default 0,
  followers_count int default 0,
  gifts_count int default 0,
  subs_count int default 0,
  stream_minutes int default 0,
  primary key (user_id, date)
);

create table if not exists public.oauth_states (
  state text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  created_at timestamptz default now()
);

create or replace view public.profiles_with_stats as
select
  p.id,
  p.display_name,
  array_agg(distinct la.platform) filter (where la.id is not null) as linked_platforms,
  coalesce(sum(la.follower_count),0) as total_followers,
  round(avg(sub.messages_per_stream)::numeric,2) as avg_messages_per_stream
from public.profiles p
left join public.linked_accounts la on la.user_id = p.id
left join (
  select s.user_id, s.id,
    (select count(*) from public.chat_messages m where m.stream_id = s.id) as messages_per_stream
  from public.streams s
) sub on sub.user_id = p.id
group by p.id, p.display_name;

create or replace function public.system_analytics_overview()
returns table(metric text, value bigint)
language sql security definer set search_path = public as $$
  select 'users'::text as metric, count(*)::bigint as value from profiles
  union all select 'linked accounts', count(*) from linked_accounts
  union all select 'chat messages', count(*) from chat_messages
  union all select 'platform events', count(*) from platform_events;
$$;

alter table public.profiles enable row level security;
alter table public.linked_accounts enable row level security;
alter table public.streams enable row level security;
alter table public.chat_messages enable row level security;
alter table public.platform_events enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.oauth_states enable row level security;

create policy "users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "service role can manage profiles" on public.profiles for all using (auth.role() = 'service_role');

create policy "users manage own linked accounts" on public.linked_accounts for all using (auth.uid() = user_id);

create policy "users manage own streams" on public.streams for all using (auth.uid() = user_id);

create policy "users manage own chat messages" on public.chat_messages for all using (auth.uid() = user_id);

create policy "users manage own platform events" on public.platform_events for all using (auth.uid() = user_id);

create policy "users read own analytics" on public.analytics_daily for select using (auth.uid() = user_id);

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select is_admin from public.profiles where id = uid $$;

create policy "admins read all profiles" on public.profiles for select using (public.is_admin(auth.uid()));
create policy "admins read all linked" on public.linked_accounts for select using (public.is_admin(auth.uid()));
create policy "admins read all streams" on public.streams for select using (public.is_admin(auth.uid()));
create policy "admins read all chat" on public.chat_messages for select using (public.is_admin(auth.uid()));
create policy "admins read all events" on public.platform_events for select using (public.is_admin(auth.uid()));
create policy "admins read all analytics" on public.analytics_daily for select using (public.is_admin(auth.uid()));

-- oauth_states: only service role should access (from server routes)
create policy "service manages oauth_states" on public.oauth_states
  for all using (auth.role() = 'service_role');
