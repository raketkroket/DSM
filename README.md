# Dedicated Security Management B.V.

Premium multi-page website for Dedicated Security Management B.V., built with semantic HTML, modern CSS, and dependency-free Node.js.

## Local development

Requires Node.js 20 or later.

```powershell
npm start
```

Open `http://127.0.0.1:3000`.

```powershell
npm test
```

Runs API validation and static-route tests.

## Images

Temporary editorial photography is defined once in [images.js](./images.js). Replace the URLs and accompanying `alt` text there when final company images are ready.

## Enquiries

When run locally, the Node server validates and writes enquiries to `data/offerte-aanvragen.jsonl`. The `data/` directory is deliberately ignored by Git because enquiries contain personal information.

For Vercel, the serverless endpoint in [api/offertes.js](./api/offertes.js) forwards validated enquiries to a secure webhook. Configure `SUBMISSION_WEBHOOK_URL` in the Vercel project environment variables with the endpoint of the selected email or CRM provider. The production form deliberately returns a clear configuration message until this value is set; it does not claim to have delivered an enquiry when no persistent delivery service exists.

Never put the webhook URL or provider credentials in client-side files.
