-- Availability calendar and preferred start date on quote requests.

create table public.availability (
  day date primary key,
  status text not null check (status in ('available', 'limited', 'unavailable')),
  note text not null default '' check (char_length(note) <= 200),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.availability enable row level security;

-- Visitors see the published calendar; only admins can change it.
create policy "Availability is public"
  on public.availability for select to anon, authenticated
  using (true);

create policy "Admins add availability"
  on public.availability for insert to authenticated
  with check (public.is_admin());

create policy "Admins update availability"
  on public.availability for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins delete availability"
  on public.availability for delete to authenticated
  using (public.is_admin());

-- Optional preferred start date chosen in the quote form.
alter table public.enquiries add column preferred_date date;

-- Submitted data stays read-only for admins, including the new column.
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
    new.preferred_date := old.preferred_date;
    new.submission_token := old.submission_token;
    new.fingerprint := old.fingerprint;
    new.ip_hash := old.ip_hash;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
