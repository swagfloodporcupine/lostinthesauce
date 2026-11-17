-- VibeShift relational marketplace foundation
create extension if not exists pgcrypto;
create type public.account_type as enum ('planner','vendor','admin');
create type public.vendor_category as enum ('dj','live_act','mc','photographer','videographer','sound_pa','sound_engineer','lighting','stage_set','venue');
create type public.booking_status as enum ('inquiry','quoted','pending','confirmed','completed','cancelled');
create type public.event_status as enum ('draft','open','planning','confirmed','completed','cancelled');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', account_type public.account_type not null default 'planner',
 avatar_url text, phone text, city text, bio text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.vendor_listings (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
 slug text not null unique, title text not null, category public.vendor_category not null, description text not null default '',
 city text, rate_from integer check(rate_from is null or rate_from>=0), rate_to integer check(rate_to is null or rate_to>=0),
 cover_image_url text, published boolean not null default false, verified_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(rate_from is null or rate_to is null or rate_to>=rate_from)
);
create index vendor_listings_directory_idx on public.vendor_listings(published,category,city);
create table public.vendor_media (
 id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.vendor_listings(id) on delete cascade,
 media_url text not null, media_type text not null check(media_type in ('image','video','audio')), caption text, sort_order int not null default 0, created_at timestamptz not null default now()
);
create table public.events (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, event_type text, event_date date, start_time time, end_time time, venue_name text, city text,
 guest_count int check(guest_count is null or guest_count>=0), budget_min integer, budget_max integer, brief text,
 status public.event_status not null default 'draft', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(budget_min is null or budget_max is null or budget_max>=budget_min)
);
create table public.event_vendor_requests (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
 listing_id uuid not null references public.vendor_listings(id), requested_by uuid not null references public.profiles(id),
 message text, quote_amount integer check(quote_amount is null or quote_amount>=0),
 status text not null default 'requested' check(status in ('requested','quoted','accepted','declined','withdrawn')),
 created_at timestamptz not null default now(), unique(event_id,listing_id)
);
create table public.bookings (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
 listing_id uuid not null references public.vendor_listings(id), planner_id uuid not null references public.profiles(id), vendor_id uuid not null references public.profiles(id),
 status public.booking_status not null default 'inquiry', total_amount integer check(total_amount is null or total_amount>=0),
 deposit_amount integer check(deposit_amount is null or deposit_amount>=0), terms text, confirmed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conversations (
 id uuid primary key default gen_random_uuid(), event_id uuid references public.events(id) on delete set null,
 planner_id uuid not null references public.profiles(id), vendor_id uuid not null references public.profiles(id), listing_id uuid references public.vendor_listings(id),
 created_at timestamptz not null default now(), unique(event_id,planner_id,vendor_id,listing_id)
);
create table public.messages (
 id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
 sender_id uuid not null references public.profiles(id), body text not null check(length(body) between 1 and 5000), read_at timestamptz, created_at timestamptz not null default now()
);
create index messages_conversation_created_idx on public.messages(conversation_id,created_at);
create table public.reviews (
 id uuid primary key default gen_random_uuid(), booking_id uuid not null unique references public.bookings(id) on delete cascade,
 reviewer_id uuid not null references public.profiles(id), vendor_id uuid not null references public.profiles(id), rating int not null check(rating between 1 and 5),
 body text check(body is null or length(body)<=2000), created_at timestamptz not null default now()
);
create table public.vendor_availability (
 id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.vendor_listings(id) on delete cascade,
 unavailable_on date not null, note text, unique(listing_id,unavailable_on)
);

-- Create a profile from auth metadata. Public sign-up can only create planner/vendor accounts.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,display_name,account_type)
 values(new.id,coalesce(new.raw_user_meta_data->>'display_name',''),
 case when new.raw_user_meta_data->>'account_type'='vendor' then 'vendor'::public.account_type else 'planner'::public.account_type end);
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.vendor_listings enable row level security;
alter table public.vendor_media enable row level security;
alter table public.events enable row level security;
alter table public.event_vendor_requests enable row level security;
alter table public.bookings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.vendor_availability enable row level security;

create policy "Profiles visible to authenticated users" on public.profiles for select to authenticated using(true);
create policy "Users update own profile" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id and account_type<>'admin');
create policy "Published listings public" on public.vendor_listings for select using(published=true or profile_id=auth.uid());
create policy "Vendors manage own listings" on public.vendor_listings for all to authenticated using(profile_id=auth.uid()) with check(profile_id=auth.uid());
create policy "Media follows listing visibility" on public.vendor_media for select using(exists(select 1 from public.vendor_listings l where l.id=listing_id and (l.published or l.profile_id=auth.uid())));
create policy "Vendors manage own media" on public.vendor_media for all to authenticated using(exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid())) with check(exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid()));
create policy "Owners manage events" on public.events for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "Participants view event requests" on public.event_vendor_requests for select to authenticated using(requested_by=auth.uid() or exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()) or exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid()));
create policy "Planner creates event requests" on public.event_vendor_requests for insert to authenticated with check(requested_by=auth.uid() and exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));
create policy "Vendors update quote requests" on public.event_vendor_requests for update to authenticated using(exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid())) with check(exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid()));
create policy "Booking participants view bookings" on public.bookings for select to authenticated using(planner_id=auth.uid() or vendor_id=auth.uid());
create policy "Planner creates booking" on public.bookings for insert to authenticated with check(planner_id=auth.uid() and exists(select 1 from public.events e where e.id=event_id and e.owner_id=auth.uid()));
create policy "Booking participants update bookings" on public.bookings for update to authenticated using(planner_id=auth.uid() or vendor_id=auth.uid()) with check(planner_id=auth.uid() or vendor_id=auth.uid());
create policy "Conversation participants view" on public.conversations for select to authenticated using(planner_id=auth.uid() or vendor_id=auth.uid());
create policy "Planner creates conversation" on public.conversations for insert to authenticated with check(planner_id=auth.uid());
create policy "Participants read messages" on public.messages for select to authenticated using(exists(select 1 from public.conversations c where c.id=conversation_id and (c.planner_id=auth.uid() or c.vendor_id=auth.uid())));
create policy "Participants send own messages" on public.messages for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public.conversations c where c.id=conversation_id and (c.planner_id=auth.uid() or c.vendor_id=auth.uid())));
create policy "Reviews public read" on public.reviews for select using(true);
create policy "Completed booking participants review" on public.reviews for insert to authenticated with check(reviewer_id=auth.uid() and exists(select 1 from public.bookings b where b.id=booking_id and b.status='completed' and (b.planner_id=auth.uid() or b.vendor_id=auth.uid())));
create policy "Availability public read" on public.vendor_availability for select using(true);
create policy "Vendors manage availability" on public.vendor_availability for all to authenticated using(exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid())) with check(exists(select 1 from public.vendor_listings l where l.id=listing_id and l.profile_id=auth.uid()));

-- Public-facing, deliberately limited profile fields for published supplier cards.
create view public.public_vendor_profiles as
 select p.id,p.display_name,p.avatar_url
 from public.profiles p
 where exists(select 1 from public.vendor_listings l where l.profile_id=p.id and l.published=true);
grant select on public.public_vendor_profiles to anon, authenticated;
