const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { server, validateInquiry } = require('../server');

let baseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test('rejects incomplete enquiry data', () => {
  const { errors } = validateInquiry({ name: '', email: 'invalid', message: '' });

  assert.deepEqual(errors, {
    name: 'Vul uw volledige naam in.',
    email: 'Vul een geldig e-mailadres in.',
    message: 'Vertel kort waarmee we kunnen helpen.'
  });
});

test('accepts a valid enquiry and saves it', async () => {
  const response = await fetch(`${baseUrl}/api/offertes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Aanvrager',
      company: 'Voorbeeld B.V.',
      email: 'test@example.nl',
      phone: '0612345678',
      service: 'Objectbewaking',
      message: 'Graag een voorstel voor objectbewaking.'
    })
  });

  assert.equal(response.status, 201);
  assert.match((await response.json()).message, /aanvraag ontvangen/);
});

test('serves the quote page', async () => {
  const response = await fetch(`${baseUrl}/offerte.html`);

  assert.equal(response.status, 200);
  assert.match(await response.text(), /Verstuur aanvraag/);
});

test('serves the shared image catalogue', async () => {
  const response = await fetch(`${baseUrl}/images.js`);

  assert.equal(response.status, 200);
  assert.match(await response.text(), /DSM_IMAGES/);
});
