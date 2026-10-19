-- Dedicated Security Management — initial schema
-- Run with the Supabase CLI (`supabase db push`) or paste into the SQL editor.


-- ─────────────────────────────────────────────────────────────
-- Administrators
-- Accounts are created in Supabase Auth; a row here grants admin rights.
-- ─────────────────────────────────────────────────────────────
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "Admins can read their own admin row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Content: drafts (admin only) and published versions (public)
-- Kept in separate tables so drafts can never be read anonymously.
-- ─────────────────────────────────────────────────────────────
create table public.content_drafts (
  key text primary key check (key in ('settings', 'home', 'services', 'about', 'faq', 'contact')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.content_published (
  key text primary key check (key in ('settings', 'home', 'services', 'about', 'faq', 'contact')),
  data jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users (id) on delete set null
);

alter table public.content_drafts enable row level security;
alter table public.content_published enable row level security;

create policy "Admins manage drafts"
  on public.content_drafts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Published content is public"
  on public.content_published for select to anon, authenticated
  using (true);

create policy "Admins publish content"
  on public.content_published for insert to authenticated
  with check (public.is_admin());

create policy "Admins update published content"
  on public.content_published for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete published content"
  on public.content_published for delete to authenticated
  using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Media library
-- ─────────────────────────────────────────────────────────────
create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  url text not null,
  alt text not null default '',
  width integer,
  height integer,
  size_bytes integer,
  mime_type text not null default 'image/webp',
  original_name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  uploaded_by uuid references auth.users (id) on delete set null
);

create index media_sort_idx on public.media (sort_order, created_at desc);

alter table public.media enable row level security;

create policy "Admins manage media"
  on public.media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Enquiries (quote requests and contact messages)
-- Inserted only by the server (service role) after validation.
-- ─────────────────────────────────────────────────────────────
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quote', 'contact')),
  status text not null default 'new' check (status in ('new', 'contacted', 'completed')),
  company text not null default '' check (char_length(company) <= 160),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null default '' check (char_length(phone) <= 40),
  service text not null default '' check (char_length(service) <= 120),
  location text not null default '' check (char_length(location) <= 200),
  message text not null check (char_length(message) between 10 and 5000),
  internal_notes text not null default '' check (char_length(internal_notes) <= 10000),
  submission_token uuid not null unique,
  fingerprint text not null,
  ip_hash text not null default '',
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed', 'not_configured')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enquiries_created_idx on public.enquiries (created_at desc);
create index enquiries_status_idx on public.enquiries (status, created_at desc);
create index enquiries_ip_idx on public.enquiries (ip_hash, created_at desc);
create index enquiries_fingerprint_idx on public.enquiries (fingerprint, created_at desc);

alter table public.enquiries enable row level security;

create policy "Admins read enquiries"
  on public.enquiries for select to authenticated
  using (public.is_admin());

create policy "Admins update enquiries"
  on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete enquiries"
  on public.enquiries for delete to authenticated
  using (public.is_admin());

-- Admins may only change workflow fields, never the submitted data.
create or replace function public.protect_enquiry_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() = 'authenticated' then
    new.kind := old.kind;
    new.company := old.company;
    new.name := old.name;
    new.email := old.email;
    new.phone := old.phone;
    new.service := old.service;
    new.location := old.location;
    new.message := old.message;
    new.submission_token := old.submission_token;
    new.fingerprint := old.fingerprint;
    new.ip_hash := old.ip_hash;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger enquiries_protect_fields
  before update on public.enquiries
  for each row execute function public.protect_enquiry_fields();

-- ─────────────────────────────────────────────────────────────
-- Storage bucket for website images (public read, admin write)
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 15728640, array['image/webp', 'image/jpeg', 'image/png', 'image/avif'])
on conflict (id) do nothing;

-- Public files are served through the bucket's public URL; no anonymous listing policy.
create policy "Admins list media files"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "Admins upload media files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "Admins update media files"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "Admins delete media files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
