// Applies the migrations to an in-memory Postgres (PGlite) with minimal stand-ins for
// Supabase's auth and storage schemas, then checks the row-level security rules per role.
// Run with: npm run test:db
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'migrations');
const migration = readdirSync(dir)
  .filter((file) => file.endsWith('.sql'))
  .sort()
  .map((file) => readFileSync(join(dir, file), 'utf8'))
  .join('\n');
const db = new PGlite();

await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth; create schema storage;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user::text) $$;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated, service_role;
  grant execute on all functions in schema auth to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  grant all on storage.objects to anon, authenticated, service_role;
`);
await db.exec(migration);

const ADMIN = '11111111-1111-4111-8111-111111111111';
const USER = '22222222-2222-4222-8222-222222222222';
await db.exec(`
  insert into auth.users values ('${ADMIN}', 'admin@example.nl'), ('${USER}', 'user@example.nl');
  insert into public.admins (user_id, email) values ('${ADMIN}', 'admin@example.nl');
  insert into public.content_published (key, data) values ('home', '{"x":1}');
  insert into public.content_drafts (key, data) values ('home', '{"x":2}');
  insert into public.enquiries (kind, name, email, message, submission_token, fingerprint)
    values ('quote', 'Test', 't@example.nl', 'Een aanvraag van voldoende lengte', gen_random_uuid(), 'f1');
`);

let failures = 0;
async function as(role, sub, sql) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub ?? ''}', false); select set_config('request.jwt.claim.role', '${role}', false); set role ${role};`);
  try {
    const result = await db.query(sql);
    return { rows: result.rows, affected: result.affectedRows ?? 0 };
  } catch (error) {
    return { error: error.message };
  } finally {
    await db.exec('reset role;');
  }
}
function check(label, condition, detail) {
  if (!condition) failures++;
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${condition ? '' : `  -> ${JSON.stringify(detail)}`}`);
}

let r;
r = await as('anon', null, 'select * from public.content_published');
check('anon reads published content', r.rows?.length === 1, r);
r = await as('anon', null, 'select * from public.content_drafts');
check('anon cannot read drafts', r.rows?.length === 0, r);
r = await as('anon', null, 'select * from public.enquiries');
check('anon cannot read enquiries', r.rows?.length === 0, r);
r = await as('anon', null, `insert into public.enquiries (kind, name, email, message, submission_token, fingerprint) values ('contact','Spam','s@x.nl','Spam bericht met tekst', gen_random_uuid(), 'f2')`);
check('anon cannot insert enquiries', Boolean(r.error), r);
r = await as('anon', null, `insert into public.content_published (key, data) values ('faq','{}')`);
check('anon cannot publish', Boolean(r.error), r);
r = await as('anon', null, 'select public.is_admin() as admin');
check('anon is not admin', r.rows?.[0]?.admin === false, r);

r = await as('authenticated', USER, 'select * from public.content_drafts');
check('non-admin user cannot read drafts', r.rows?.length === 0, r);
r = await as('authenticated', USER, 'select * from public.enquiries');
check('non-admin user cannot read enquiries', r.rows?.length === 0, r);
r = await as('authenticated', USER, `update public.content_published set data = '{"hacked":true}' where key = 'home'`);
check('non-admin user cannot change published content', r.affected === 0 || Boolean(r.error), r);
r = await as('authenticated', USER, `insert into public.admins (user_id, email) values ('${USER}', 'user@example.nl')`);
check('non-admin user cannot make themselves admin', Boolean(r.error), r);
r = await as('authenticated', USER, `insert into storage.objects (bucket_id, name) values ('media', 'x.webp')`);
check('non-admin user cannot upload media', Boolean(r.error), r);

r = await as('authenticated', ADMIN, 'select * from public.content_drafts');
check('admin reads drafts', r.rows?.length === 1, r);
r = await as('authenticated', ADMIN, `insert into public.content_drafts (key, data) values ('about', '{}')`);
check('admin writes drafts', !r.error, r);
r = await as('authenticated', ADMIN, `insert into public.content_published (key, data) values ('about', '{}') on conflict (key) do update set data = excluded.data`);
check('admin publishes', !r.error, r);
r = await as('authenticated', ADMIN, `insert into public.content_drafts (key, data) values ('not-a-section', '{}')`);
check('unknown content keys are rejected', Boolean(r.error), r);
r = await as('authenticated', ADMIN, 'select * from public.enquiries');
check('admin reads enquiries', r.rows?.length === 1, r);
r = await as('authenticated', ADMIN, `update public.enquiries set status = 'contacted', internal_notes = 'gebeld', email = 'changed@x.nl', message = 'veranderd bericht' returning status, internal_notes, email, message`);
check('admin updates workflow fields only (submitted data protected)', r.rows?.[0]?.status === 'contacted' && r.rows?.[0]?.internal_notes === 'gebeld' && r.rows?.[0]?.email === 't@example.nl' && r.rows?.[0]?.message === 'Een aanvraag van voldoende lengte', r);
r = await as('authenticated', ADMIN, `update public.enquiries set status = 'archived'`);
check('invalid status rejected', Boolean(r.error), r);
r = await as('authenticated', ADMIN, `insert into storage.objects (bucket_id, name) values ('media', 'x.webp')`);
check('admin uploads media', !r.error, r);
r = await as('authenticated', ADMIN, `insert into public.media (path, url) values ('2026/a.webp', 'https://x/a.webp')`);
check('admin manages media rows', !r.error, r);
r = await as('anon', null, 'select * from public.media');
check('anon cannot list the media table', r.rows?.length === 0, r);

r = await as('service_role', null, `insert into public.enquiries (kind, name, email, message, submission_token, fingerprint) values ('contact','Jan','j@x.nl','Bericht met voldoende tekst', gen_random_uuid(), 'f3')`);
check('service role (server) can store enquiries', !r.error, r);

// Availability calendar
r = await as('authenticated', ADMIN, `insert into public.availability (day, status, note) values ('2026-11-02', 'available', ''), ('2026-11-03', 'limited', 'Alleen avond')`);
check('admin sets availability', !r.error, r);
r = await as('anon', null, 'select day, status from public.availability order by day');
check('anon reads availability', r.rows?.length === 2, r);
r = await as('anon', null, `insert into public.availability (day, status) values ('2026-11-04', 'available')`);
check('anon cannot write availability', Boolean(r.error), r);
r = await as('authenticated', USER, `update public.availability set status = 'unavailable'`);
check('non-admin user cannot change availability', r.affected === 0 || Boolean(r.error), r);
r = await as('authenticated', ADMIN, `insert into public.availability (day, status) values ('2026-11-05', 'maybe')`);
check('invalid availability status rejected', Boolean(r.error), r);
r = await as('authenticated', ADMIN, `update public.enquiries set preferred_date = '2030-01-01' returning preferred_date`);
check('admin cannot alter a submitted preferred date', r.rows?.length > 0 && r.rows.every((row) => row.preferred_date === null), r);

console.log(failures ? `\n${failures} check(s) failed` : '\nAll RLS checks passed');
await db.close();
process.exitCode = failures ? 1 : 0;
