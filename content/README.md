# Website content

Written by the admin (`/admin`) through the GitHub API — do not edit by hand while the owner is working.

- `live/` — what visitors see: one JSON file per page area, plus `availability.json`. A change here triggers a new deployment.
- `admin/` — concepts (`drafts/`) and the media library (`media.json`). Changes here do not trigger a deployment (see `vercel.json`).

A missing file means "not changed yet": the site then uses the default texts in `src/lib/content/defaults.ts`.
