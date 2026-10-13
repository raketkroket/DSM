const menuButton = document.querySelector('.menu');
const navigationLinks = document.querySelector('.links');

menuButton?.addEventListener('click', () => {
  const isOpen = navigationLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.links a').forEach((link) => {
  link.addEventListener('click', () => {
    navigationLinks?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const serviceByQueryValue = {
  '1': 'Bouwplaatsbeveiliging',
  '2': 'Evenementenbeveiliging',
  '3': 'Receptiediensten',
  '4': 'Recreatiebeveiliging',
  '5': 'Objectbewaking',
  '6': 'Winkelsurveillance',
  '7': 'Cameratoezicht',
  '8': 'Beveiliging op maat',
  '9': 'Veiligheidskundigen'
};

const enquiryForm = document.getElementById('contactForm');

function setFieldErrors(errors = {}) {
  document.querySelectorAll('[data-error-for]').forEach((element) => {
    const fieldName = element.dataset.errorFor;
    const input = document.getElementById(fieldName === 'service' ? 'dienst' : fieldName);
    const message = errors[fieldName] || '';

    element.textContent = message;
    input?.setAttribute('aria-invalid', String(Boolean(message)));
  });
}

if (enquiryForm) {
  const serviceSelect = document.getElementById('dienst');
  const requestedService = new URLSearchParams(window.location.search).get('dienst');
  if (requestedService && serviceByQueryValue[requestedService]) {
    serviceSelect.value = serviceByQueryValue[requestedService];
  }

  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFieldErrors();

    const submitButton = enquiryForm.querySelector('[type="submit"]');
    const formNote = document.getElementById('formNote');
    const payload = Object.fromEntries(new FormData(enquiryForm).entries());

    submitButton.disabled = true;
    formNote.textContent = 'Uw aanvraag wordt verstuurd...';

    try {
      const response = await fetch('/api/offertes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        setFieldErrors(result.errors);
        formNote.textContent = result.message || 'Er ging iets mis. Probeer het opnieuw.';
        return;
      }

      enquiryForm.reset();
      formNote.textContent = result.message;
    } catch (error) {
      formNote.textContent = 'We kunnen uw aanvraag nu niet versturen. Controleer uw verbinding en probeer het opnieuw.';
    } finally {
      submitButton.disabled = false;
    }
  });
}
