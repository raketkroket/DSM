'use strict';

const { validateInquiry } = require('../server');

module.exports = async function handleInquiry(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ message: 'Methode niet toegestaan.' });
    return;
  }

  const { errors, inquiry } = validateInquiry(request.body || {});
  if (Object.keys(errors).length > 0) {
    response.status(422).json({ message: 'Controleer de gemarkeerde velden.', errors });
    return;
  }

  const webhookUrl = process.env.SUBMISSION_WEBHOOK_URL;
  if (!webhookUrl) {
    response.status(503).json({
      message: 'Het online formulier is nog niet geconfigureerd. Neem rechtstreeks contact met ons op via e-mail.'
    });
    return;
  }

  let webhookResponse;
  try {
    webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...inquiry, receivedAt: new Date().toISOString(), source: 'DSM website' })
    });
  } catch (error) {
    console.error('Unable to deliver enquiry webhook:', error);
    response.status(502).json({ message: 'De aanvraag kon niet worden verstuurd. Probeer het later opnieuw.' });
    return;
  }

  if (!webhookResponse.ok) {
    response.status(502).json({ message: 'De aanvraag kon niet worden verstuurd. Probeer het later opnieuw.' });
    return;
  }

  response.status(201).json({
    message: 'Bedankt. We hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op.'
  });
};
