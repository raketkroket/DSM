# Dedicated Security Management B.V. — website

Corporate website and content management for Dedicated Security Management B.V.

- **Public site**: homepage, services overview, a page per service, about, contact, multi-step quote request, privacy statement.
- **Beveiligingsplanner** (`/beveiligingsplanner`): an interactive tool where visitors choose their location, concerns and the hours they need cover (click-and-drag week grid), see matching services with the reasons, and send the profile straight into a pre-filled quote request. It recommends services only and never shows prices: the client's document contains no rates. Progress is remembered in the visitor's browser.
- **Admin** (`/admin`): login with username and password, dashboard, content editor with draft → preview → publish, photo replacement, media library, availability calendar, brand colours and website settings.

All default copy comes from the client's approved document *Website Dedicated Security Management B.V.*. Contact details (phone, e-mail, address, KvK) are intentionally empty until the owner fills them in under **Beheer → Instellingen**; empty fields are hidden on the site.

**No database.** Like the Marli Nails site, everything the admin saves is a file in this repository, written through the GitHub API; Vercel rebuilds the site from it. Form submissions are e-mailed (Resend) and not stored anywhere else.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Cache Components, TypeScript) |
| Styling / motion | Tailwind CSS 4, Motion (`motion/react`), CSS keyframes for the load sequence |
| Admin login | One account from environment variables: scrypt password hash + HMAC-signed session cookie |
| Admin storage | JSON and WebP files in this repository via the GitHub API (`content/`, `public/uploads/`) |
| E-mail | Resend (free plan) |
| Rate limits | Upstash Redis via the Vercel Marketplace (optional, free); in-memory fallback |
| Images | `next/image`; uploads shrunk in the browser, then `sharp` to WebP (max 2400 px) |
| Hosting | Vercel |

## How saving works

```
content/live/<section>.json        published content — read by the public site at build time
content/live/availability.json     availability calendar
content/admin/drafts/<section>.json  concepts (only while they differ from the live version)
content/admin/media.json           media library: alt texts, order, sizes
public/uploads/<id>.webp           uploaded photos
```

- *Concept opslaan* commits to `content/admin/` — `vercel.json`'s `ignoreCommand` skips a rebuild for those commits.
- *Publiceren*, availability changes and uploads touch `content/live/` or `public/uploads/`, so Vercel rebuilds: the change is live after roughly one to two minutes.
- Every save checks that the files did not change in the meantime (blob sha), so two browser tabs cannot overwrite each other silently.
- A fresh upload is served by `/uploads/[file]` straight from GitHub until the rebuild has made it a static file.
- A missing file means "not edited yet": the defaults in `src/lib/content/defaults.ts` are shown.
- Locally (no `GITHUB_CONTENT_TOKEN`) the admin writes the same files into this checkout, or into `ADMIN_LOCAL_ROOT` when set.

## Local development

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run dev
```

Create a login for local testing with `npm run admin:wachtwoord`. In `.env.local`, write every `$` in `ADMIN_PASSWORD_HASH` as `\$` — Next.js expands `$NAME` in `.env` files. (Vercel stores the value as typed; there no escaping is needed.)

Without `RESEND_API_KEY` the forms answer with a clear "not connected yet" message.

### Checks

```bash
npm run lint        # ESLint
npm run typecheck   # route types + TypeScript
npm test            # unit tests: content, validation, enquiry endpoint, login, admin storage flow
npm run build       # production build
```

## Setup for production

### 1. Admin login

```bash
npm run admin:wachtwoord
```

Type the owner's password twice (hidden). The script prints `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`; put both in Vercel. The password itself is never stored. The username is `ADMIN_USERNAME` (default `yassine128`).

**New password**: run the script again, replace `ADMIN_PASSWORD_HASH` in Vercel and redeploy. Every existing session ends automatically.

### 2. Storage (GitHub token)

GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → *Generate new token*: repository access *Only select repositories* → this repository; permission **Contents: Read and write**. Set it as `GITHUB_CONTENT_TOKEN` (plus `GITHUB_REPO` / `GITHUB_BRANCH` if they differ from `raketkroket/DSM` / `main`; the branch must be the one Vercel deploys to production). Pick the longest expiry your account allows and note the date: an expired token shows on the admin dashboard as *Opslag: actie nodig*.

### 3. E-mail (Resend)

1. Create a free Resend account, ideally with the owner's e-mail address, and an API key → `RESEND_API_KEY`.
2. Without a verified domain, leave `RESEND_FROM_EMAIL` empty: mail is sent from `onboarding@resend.dev`, which only reaches the Resend account's own address. That is enough for the notifications to the owner; the confirmation to the customer is then skipped (the request still succeeds).
3. To send confirmations to customers too, verify the company domain in Resend and set `RESEND_FROM_EMAIL`, e.g. `Dedicated Security Management <website@uw-domein.nl>`.
4. Set the recipient in **Beheer → Instellingen → Meldingen** (or `ENQUIRY_NOTIFICATION_EMAIL`).

If the notification cannot be sent, the visitor sees an error and can try again; nothing is lost silently.

### 4. Optional: Upstash Redis

Vercel → Project → Storage → Marketplace → **Upstash for Redis** (free). It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`; login attempts and form submissions are then limited across all servers instead of per server instance.

### Security

- Login: scrypt (N = 32768), constant-time comparison, the same answer for a wrong username or password, 5 failed attempts per address per 15 minutes and 20 per hour for the account.
- Session: HMAC-signed cookie (`HttpOnly`, `SameSite=Strict`, `Secure`, `__Host-` prefix in production), ends after a day without activity and always after a week; a new password invalidates all sessions. The proxy checks it on every `/admin` request and every page and server action checks it again.
- Storage: the GitHub token stays on the server and can only write `content/live`, `content/admin` and `public/uploads/*.webp` (whitelist in `src/lib/server/storage.ts`). Content is sanitised (allowed image paths, safe links, hex colours) before it is saved.
- Forms: server-side validation, size limit, honeypot, minimum fill time, one e-mail per submission token, duplicate messages ignored for 24 h, 5 submissions per 15 minutes per hashed IP.

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and e-mail links |
| `ADMIN_USERNAME` | Admin username (default `yassine128`) |
| `ADMIN_PASSWORD_HASH` | From `npm run admin:wachtwoord` |
| `ADMIN_SESSION_SECRET` | From `npm run admin:wachtwoord` (at least 32 characters) |
| `GITHUB_CONTENT_TOKEN` | Fine-grained token, Contents read/write on this repository |
| `GITHUB_REPO`, `GITHUB_BRANCH` | Optional, default `raketkroket/DSM` and `main` |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Optional sender on a verified domain |
| `ENQUIRY_NOTIFICATION_EMAIL` | Recipient when none is set in the admin |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Optional Upstash Redis (added by Vercel) |
| `ENQUIRY_HASH_SALT` | Optional salt for IP hashing |

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Next.js; no build overrides needed). Production must deploy from the branch in `GITHUB_BRANCH`.
2. Add the environment variables above for *Production*.
3. Deploy, then sign in at `/admin` and complete the checklist on the dashboard (contact details, notification e-mail, own photos). The dashboard shows whether storage, e-mail and rate limiting work.
4. Point the domain to Vercel and update `NEXT_PUBLIC_SITE_URL`.

## Content management

- **Content**: every text, button, list and photo on the site is editable per page area. Changes are saved as a concept; *Voorbeeld* opens a preview with the concept, *Publiceren* puts it live. *Verwerpen* restores the published version.
- **Photos**: choose from the media library inside the editor, upload directly from the picker, set alt text and click the preview to set the focal point (how the photo is cropped on different screens).
- **Mediabibliotheek**: upload (drag & drop, any size up to 15 MB: large photos are shrunk in the browser first), edit alt text, see where a photo is used, replace a photo everywhere it is used, reorder, and delete photos that are no longer in use.
- **Diensten**: services can be added, removed and reordered (Content → Diensten). Each service gets its own page at `/diensten/<webadres>`; new ones start empty, so fill in the copy and photo before publishing. Removed services disappear from the menu, sitemap, planner and quote form.
- **Kleuren** (Instellingen → Kleuren): primary, deep, text and background colour. Each picker shows the contrast against its counterpart and warns below 4.5 : 1; *Standaard* restores the original palette.
- **Beschikbaarheid**: a calendar where the owner marks days as *Beschikbaar*, *Beperkt beschikbaar* or *Volgeboekt*, optionally with a short note. Click a day, drag across a range or Ctrl/Shift-click to add days, then pick a status. The contact page shows the calendar (only while future days are filled in) and the quote form offers an optional *Gewenste startdatum*, which is included in the e-mail.
- **Aanvragen** arrive by e-mail only, with the customer as reply-to.

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
content/                 everything the admin saves (see "How saving works")
src/app/(site)/          public pages (static, cached content)
src/app/admin/           login, dashboard, content, photos, media, availability, settings, preview
src/app/api/             form endpoints (quote, contact)
src/app/uploads/         serves fresh uploads until the next deployment
src/components/          site, home, service, about, contact, forms, admin, motion
src/lib/content/         content types, defaults from the client document, merge + sanitise, cached getter
src/lib/admin/           session helpers, editor schema, server actions
src/lib/server/          password hashing, session cookie, GitHub/local storage, rate limits
src/lib/enquiry/         validation schema, handler, e-mail templates
scripts/admin-password.mjs  creates the login secrets
tests/                   unit tests (Vitest)
```

## Still to provide by the client

- Contact details, KvK number, social links (admin → Instellingen).
- Own photography.
- Review of the privacy statement (`/privacy`) by the company before launch.
