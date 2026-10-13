'use strict';

const { createServer } = require('node:http');
const { appendFile, mkdir, readFile } = require('node:fs/promises');
const { extname, join, normalize } = require('node:path');

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY_SIZE = 20_000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const INQUIRIES_DIRECTORY = join(__dirname, 'data');
const INQUIRIES_FILE = join(INQUIRIES_DIRECTORY, 'offerte-aanvragen.jsonl');
const STATIC_FILES = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/diensten.html', 'diensten.html'],
  ['/over-ons.html', 'over-ons.html'],
  ['/contact.html', 'contact.html'],
  ['/offerte.html', 'offerte.html'],
  ['/style.css', 'style.css'],
  ['/form.css', 'form.css'],
  ['/images.js', 'images.js'],
  ['/script.js', 'script.js']
]);
const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};
const SERVICES = new Set([
  'Bouwplaatsbeveiliging',
  'Evenementenbeveiliging',
  'Receptiediensten',
  'Recreatiebeveiliging',
  'Objectbewaking',
  'Winkelsurveillance',
  'Cameratoezicht',
  'Beveiliging op maat',
  'Veiligheidskundigen'
]);
const requestLog = new Map();

function send(response, statusCode, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  });
  response.end(body);
}

function clientAddress(request) {
  return request.socket.remoteAddress || 'unknown';
}

function isRateLimited(address) {
  const now = Date.now();
  const events = (requestLog.get(address) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (events.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestLog.set(address, events);
    return true;
  }

  events.push(now);
  requestLog.set(address, events);
  return false;
}

function cleanText(value, maximumLength) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maximumLength) : '';
}

function validateInquiry(payload) {
  const inquiry = {
    name: cleanText(payload.name, 100),
    company: cleanText(payload.company, 120),
    email: cleanText(payload.email, 254).toLowerCase(),
    phone: cleanText(payload.phone, 40),
    service: cleanText(payload.service, 80),
    message: cleanText(payload.message, 2_000)
  };

  const errors = {};
  if (inquiry.name.length < 2) errors.name = 'Vul uw volledige naam in.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) errors.email = 'Vul een geldig e-mailadres in.';
  if (!inquiry.message) errors.message = 'Vertel kort waarmee we kunnen helpen.';
  if (inquiry.service && !SERVICES.has(inquiry.service)) errors.service = 'Kies een dienst uit de lijst.';

  return { errors, inquiry };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_SIZE) {
        reject(new Error('request-too-large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

async function handleInquiry(request, response) {
  if (isRateLimited(clientAddress(request))) {
    send(response, 429, JSON.stringify({ message: 'U heeft te veel aanvragen verstuurd. Probeer het over enkele minuten opnieuw.' }));
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(request));
  } catch (error) {
    const message = error.message === 'request-too-large'
      ? 'De aanvraag is te groot.'
      : 'De aanvraag kon niet worden verwerkt.';
    send(response, 400, JSON.stringify({ message }));
    return;
  }

  const { errors, inquiry } = validateInquiry(payload);
  if (Object.keys(errors).length > 0) {
    send(response, 422, JSON.stringify({ message: 'Controleer de gemarkeerde velden.', errors }));
    return;
  }

  const entry = JSON.stringify({
    ...inquiry,
    receivedAt: new Date().toISOString()
  });

  try {
    await mkdir(INQUIRIES_DIRECTORY, { recursive: true });
    await appendFile(INQUIRIES_FILE, `${entry}\n`, { encoding: 'utf8', mode: 0o600 });
  } catch (error) {
    console.error('Unable to save enquiry:', error);
    send(response, 500, JSON.stringify({ message: 'De aanvraag kon niet worden opgeslagen. Probeer het later opnieuw.' }));
    return;
  }

  send(response, 201, JSON.stringify({ message: 'Bedankt. We hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op.' }));
}

async function serveStaticFile(pathname, response) {
  const fileName = STATIC_FILES.get(pathname);
  if (!fileName) {
    send(response, 404, JSON.stringify({ message: 'Pagina niet gevonden.' }));
    return;
  }

  const filePath = normalize(join(__dirname, fileName));
  try {
    const content = await readFile(filePath);
    send(response, 200, content, CONTENT_TYPES[extname(fileName)]);
  } catch (error) {
    console.error(`Unable to serve ${fileName}:`, error);
    send(response, 500, JSON.stringify({ message: 'De pagina kon niet worden geladen.' }));
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'POST' && url.pathname === '/api/offertes') {
    await handleInquiry(request, response);
    return;
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    if (request.method === 'HEAD') {
      response.writeHead(200);
      response.end();
      return;
    }
    await serveStaticFile(url.pathname, response);
    return;
  }

  send(response, 405, JSON.stringify({ message: 'Methode niet toegestaan.' }));
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Dedicated Security Management draait op http://${HOST}:${PORT}`);
  });
}

module.exports = { server, validateInquiry };
