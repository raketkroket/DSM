# Dedicated Security Management B.V. — website

Corporate website and content management for Dedicated Security Management B.V.

- **Public site**: homepage, services overview, nine dedicated service pages, about, contact, multi-step quote request, privacy statement.
- **Beveiligingsplanner** (`/beveiligingsplanner`): an interactive tool where visitors choose their location, concerns and the hours they need cover (click-and-drag week grid), see matching services with the reasons, and send the profile straight into a pre-filled quote request. It recommends services only and never shows prices: the client's document contains no rates. Progress is remembered in the visitor's browser.
- **Admin** (`/admin`): secure login, dashboard, content editor with draft → preview → publish, media library, enquiry management and website settings.

All default copy comes from the client's approved document *Website Dedicated Security Management B.V.*. Contact details (phone, e-mail, address, KvK) are intentionally empty until the owner fills them in under **Beheer → Instellingen**; empty fields are hidden on the site.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, TypeScript) |
| Styling / motion | Tailwind CSS 4, Motion (`motion/react`), CSS keyframes for the load sequence |
| Data, auth, files | Supabase (Postgres + RLS, Auth, Storage) |
| E-mail | Resend |
| Images | `next/image` + `sharp` optimisation on upload (WebP, max 2400 px) |
| Hosting | Vercel |

Published content is cached (`'use cache'` + `cacheTag('site-content')`) and refreshed the moment an admin publishes, so public pages stay static and fast.

## Local development

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev
```

Without Supabase variables the public site runs on the built-in default content; the forms then answer with a clear "not connected yet" message and the admin login explains what is missing.

### Checks

```bash
npm run lint        # ESLint
npm run typecheck   # route types + TypeScript
npm test            # unit tests: content merge/sanitising, validation, enquiry endpoint
npm run test:db     # applies the SQL migration to an in-memory Postgres and checks every RLS rule
npm run build       # production build
```

## Supabase setup

1. Create a Supabase project (region EU recommended).
2. Apply the schema: either `supabase db push` with the Supabase CLI, or paste `supabase/migrations/20261019120000_initial_schema.sql` into **SQL editor** and run it. This creates the tables, row-level security policies, the enquiry-protection trigger and the public `media` storage bucket.
3. **Create the administrator account** in **Authentication → Users → Add user** (e-mail + strong password, "Auto confirm"). Then grant admin rights in the SQL editor:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'beheer@uw-domein.nl';
   ```

   Only users listed in `public.admins` can sign in to `/admin`; every page, server action and database query re-checks this.
4. **Authentication → URL configuration**: set *Site URL* to your domain and add `https://<your-domain>/admin/auth/bevestigen` to *Redirect URLs* (also `http://localhost:3000/admin/auth/bevestigen` for local testing). Password-recovery links land there.
5. Recommended: **Authentication → Sign In / Providers → Email**: disable *Allow new users to sign up* (admins are created manually), and configure custom SMTP so recovery e-mails come from your own domain.
6. Copy the project URL, anon key and service-role key into the environment variables.

### Security model

| Data | Anonymous visitors | Signed-in non-admin | Admin | Server (service role) |
| --- | --- | --- | --- | --- |
| Published content | read | read | read / write | — |
| Draft content | — | — | read / write | — |
| Enquiries | — | — | read, update status/notes, delete | insert (after validation) |
| Media table / storage writes | — | — | full | — |
| Media files (public URLs) | read | read | read | — |

Submitted enquiry data cannot be altered by admins (a trigger only allows status and internal notes to change). The form endpoints validate on the server, reject oversized bodies, use a honeypot and minimum fill time against bots, deduplicate retries (per-submission token) and identical messages (24 h), and rate-limit per hashed IP (5 per 15 minutes).

## E-mail (Resend)

1. Add and verify your sending domain in Resend.
2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (an address on the verified domain).
3. Set the recipient for new enquiries in **Beheer → Instellingen → Meldingen** (or `ENQUIRY_NOTIFICATION_EMAIL` as fallback).

Each enquiry triggers a notification to the business (reply-to set to the requester) and a confirmation to the requester. The result is stored per enquiry (`sent`, `failed` or `not_configured`) and shown in the admin, so a delivery problem is visible instead of silent.

> E-mail delivery has not been tested yet: it needs a verified Resend domain and API key. Send a test enquiry after configuring and check both mailboxes.

## Environment variables

See `.env.example`.

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | all | Canonical URL for metadata, sitemap, e-mail and recovery links |
| `NEXT_PUBLIC_SUPABASE_URL` | all | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | all | Public anon key (safe in the browser; RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Stores validated enquiries. **Never expose.** |
| `ENQUIRY_HASH_SALT` | server only | Optional salt for IP hashing |
| `RESEND_API_KEY` | server only | Resend API key |
| `RESEND_FROM_EMAIL` | server only | Sender on a verified domain |
| `ENQUIRY_NOTIFICATION_EMAIL` | server only | Fallback recipient for new enquiries |

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Next.js; no build overrides needed).
2. Add the environment variables above for *Production* (and *Preview* if you use preview deployments with a separate Supabase project).
3. Deploy, then sign in at `/admin` and complete the checklist on the dashboard (contact details, notification e-mail, own photos).
4. Point the domain to Vercel and update `NEXT_PUBLIC_SITE_URL` plus the Supabase redirect URLs to the final domain.

## Content management

- **Content**: every text, button, list and photo on the site is editable per page area. Changes are saved as a concept; *Voorbeeld* opens a preview with the concept, *Publiceren* puts it live. *Verwerpen* restores the published version.
- **Photos**: choose from the media library inside the editor, upload directly from the picker, set alt text and click the preview to set the focal point (how the photo is cropped on different screens).
- **Mediabibliotheek**: upload (drag & drop, max 15 MB, optimised to WebP), edit alt text, see where a photo is used, replace a photo everywhere it is used, reorder, and delete photos that are no longer in use.
- **Aanvragen**: filter by status, type, service or search; open a request to change its status (nieuw / gecontacteerd / afgerond), keep internal notes, reply by e-mail (pre-filled) or call.
- The nine service pages have fixed URLs (`/diensten/<slug>`); their copy, photos and SEO fields are editable.

## Photography

The site ships with temporary, self-hosted stock photography from Pexels and Unsplash (`public/images/stock/`). Sources,
photographers and licences are listed in [PHOTO_CREDITS.md](./PHOTO_CREDITS.md). People and places shown are not DSM
staff, clients or locations; the footer says so automatically while any stock photo is published.

To replace them: **Beheer → Foto’s vervangen** lists every image slot that still shows a temporary photo. Upload a company
photo straight into a slot (it is optimised to WebP and placed as a concept), then publish.

## Design system

- Palette: warm off-white `#F6F5F2`, white, soft grey `#E9EAEB`, deep navy `#14243A`, anthracite `#24282D` (tokens in `src/app/globals.css`).
- Type: Instrument Sans for headlines, Inter for text and labels.
- Motion: CSS load sequence (headline rises word by word, photography settles), scroll-triggered reveals and parallax via Motion; all of it respects `prefers-reduced-motion`.

## Project structure

```
src/app/(site)/          public pages (static, cached content)
src/app/admin/           login, recovery, dashboard, content, media, enquiries, preview
src/app/api/             form endpoints (quote, contact)
src/components/          site, home, service, about, contact, forms, admin, motion
src/lib/content/         content types, defaults from the client document, merge + sanitise, cached getter
src/lib/admin/           auth helpers, editor schema, server actions
src/lib/enquiry/         validation schema, handler, e-mail templates
supabase/migrations/     database schema and policies
supabase/tests/          RLS verification against an in-memory Postgres
tests/                   unit tests (Vitest)
```

## Still to provide by the client

- Contact details, KvK number, social links and logo (admin → Instellingen).
- Own photography.
- Review of the privacy statement (`/privacy`) by the company before launch.
