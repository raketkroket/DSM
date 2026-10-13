const menuButton = document.querySelector('.menu');
const navigationLinks = document.querySelector('.links');
const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (motionAllowed) {
  document.documentElement.classList.add('motion-ready');
}

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

document.querySelectorAll('[data-image-key]').forEach((image) => {
  const imageConfig = window.DSM_IMAGES?.[image.dataset.imageKey];
  if (imageConfig) {
    image.src = imageConfig.src;
    image.alt = imageConfig.alt;
  }
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

function setFieldErrors(form, errors = {}) {
  form.querySelectorAll('[data-error-for]').forEach((element) => {
    const fieldName = element.dataset.errorFor;
    const input = form.querySelector(`[name="${fieldName}"]`);
    const message = errors[fieldName] || '';

    element.textContent = message;
    input?.setAttribute('aria-invalid', String(Boolean(message)));
  });
}

async function submitEnquiry(form) {
  const submitButton = form.querySelector('[type="submit"]');
  const formNote = form.querySelector('[data-form-note]');
  const payload = Object.fromEntries(new FormData(form).entries());

  setFieldErrors(form);
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
      setFieldErrors(form, result.errors);
      formNote.textContent = result.message || 'Er ging iets mis. Probeer het opnieuw.';
      return;
    }

    form.reset();
    formNote.textContent = result.message;
  } catch {
    formNote.textContent = 'We kunnen uw aanvraag nu niet versturen. Controleer uw verbinding en probeer het opnieuw.';
  } finally {
    submitButton.disabled = false;
  }
}

document.querySelectorAll('[data-enquiry-form]').forEach((form) => {
  const serviceFields = [...form.querySelectorAll('[name="service"]')];
  const requestedService = new URLSearchParams(window.location.search).get('dienst');
  if (serviceFields.length && requestedService && serviceByQueryValue[requestedService]) {
    const requestedValue = serviceByQueryValue[requestedService];
    const select = serviceFields.find((field) => field.tagName === 'SELECT');

    if (select) {
      select.value = requestedValue;
    } else {
      const radio = serviceFields.find((field) => field.value === requestedValue);
      if (radio) radio.checked = true;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitEnquiry(form);
  });
});

const explorerButtons = document.querySelectorAll('[data-service-name]');
const servicePreview = document.querySelector('[data-service-preview]');

explorerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    explorerButtons.forEach((item) => item.setAttribute('aria-selected', 'false'));
    button.setAttribute('aria-selected', 'true');

    if (!servicePreview) return;

    servicePreview.querySelector('[data-preview-number]').textContent = button.dataset.serviceNumber;
    servicePreview.querySelector('[data-preview-title]').textContent = button.dataset.serviceName;
    servicePreview.querySelector('[data-preview-copy]').textContent = button.dataset.serviceCopy;
    servicePreview.querySelector('[data-preview-link]').href = `offerte.html?dienst=${button.dataset.serviceNumber}`;
    const previewImage = servicePreview.querySelector('img');
    const image = window.DSM_IMAGES?.[button.dataset.imageKey];
    if (image) {
      servicePreview.classList.remove('is-changing');
      void servicePreview.offsetWidth;
      servicePreview.classList.add('is-changing');
      previewImage.src = image.src;
      previewImage.alt = image.alt;
    }
  });
});

if (motionAllowed && 'IntersectionObserver' in window) {
  const revealItems = [...document.querySelectorAll('main > .section, .page-hero, .contact-atelier, .service-explorer')];
  const revealPatterns = ['reveal-up', 'reveal-left', 'reveal-right', 'reveal-scale'];

  revealItems.forEach((element, index) => {
    element.classList.add('reveal', revealPatterns[index % revealPatterns.length]);
  });

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: .13 });

  revealItems.forEach((element) => observer.observe(element));
}

if (motionAllowed && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.service-card, .why-grid article, .service-picker label').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty('--tilt-x', `${x * 3}deg`);
      card.style.setProperty('--tilt-y', `${y * -3}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });

  document.querySelectorAll('.button, .navcta').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      button.style.setProperty('--magnet-x', `${(event.clientX - bounds.left - bounds.width / 2) * .08}px`);
      button.style.setProperty('--magnet-y', `${(event.clientY - bounds.top - bounds.height / 2) * .08}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.removeProperty('--magnet-x');
      button.style.removeProperty('--magnet-y');
    });
  });
}

const quoteForm = document.querySelector('[data-quote-form]');
if (quoteForm) {
  const steps = [...quoteForm.querySelectorAll('[data-step]')];
  const indicator = [...quoteForm.querySelectorAll('[data-step-indicator]')];
  let activeStep = 0;

  const displayStep = (nextStep) => {
    steps.forEach((step, index) => step.hidden = index !== nextStep);
    indicator.forEach((step, index) => {
      step.classList.toggle('active', index === nextStep);
      step.classList.toggle('complete', index < nextStep);
    });
    activeStep = nextStep;
    quoteForm.querySelector('[data-step-heading]').textContent = `Stap ${nextStep + 1} van ${steps.length}`;
  };

  quoteForm.querySelectorAll('[data-next-step]').forEach((button) => {
    button.addEventListener('click', () => {
      const currentStepInputs = [...steps[activeStep].querySelectorAll('[required]')];
      const invalidInput = currentStepInputs.find((input) => !input.checkValidity());
      if (invalidInput) {
        invalidInput.reportValidity();
        return;
      }
      displayStep(activeStep + 1);
    });
  });

  quoteForm.querySelectorAll('[data-previous-step]').forEach((button) => {
    button.addEventListener('click', () => displayStep(activeStep - 1));
  });
}
