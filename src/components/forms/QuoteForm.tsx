'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { z } from 'zod';
import { EASE } from '@/components/motion/ease';
import { ArrowBadge, buttonClass } from '@/components/site/Button';
import { fieldErrors, OTHER_SERVICE, quoteFields, type FieldErrors } from '@/lib/enquiry/schema';
import { Consent, Field, FormAlert, Honeypot, TextArea, TextInput } from './fields';
import { useSubmission } from './useSubmission';

type ServiceOption = { slug: string; title: string; shortTitle: string };

type Values = {
  service: string;
  location: string;
  message: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  website: string;
};

const STEPS = [
  { title: 'Dienst', fields: ['service'] as const },
  { title: 'Opdracht', fields: ['location', 'message'] as const },
  { title: 'Gegevens', fields: ['company', 'name', 'email', 'phone', 'consent'] as const },
  { title: 'Controle', fields: [] as const },
];

const stepSchemas = [
  z.object({ service: quoteFields.service }),
  z.object({ location: quoteFields.location, message: quoteFields.message }),
  z.object({
    company: quoteFields.company,
    name: quoteFields.name,
    email: quoteFields.email,
    phone: quoteFields.phone,
    consent: z.literal(true, { error: 'Geef toestemming om uw gegevens te verwerken.' }),
  }),
];

export function QuoteForm({
  services,
  privacyNote,
  confirmationTitle,
  confirmationText,
}: {
  services: ServiceOption[];
  privacyNote: string;
  confirmationTitle: string;
  confirmationText: string;
}) {
  const params = useSearchParams();
  const preset = services.find((service) => service.slug === params.get('dienst'))?.title ?? '';
  const [step, setStep] = useState(preset ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<Values>({
    service: preset,
    location: '',
    message: '',
    company: '',
    name: '',
    email: '',
    phone: '',
    consent: false,
    website: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const { status, message, serverErrors, submit, clearError } = useSubmission('/api/offerte');
  const heading = useRef<HTMLHeadingElement>(null);

  const allErrors = { ...serverErrors, ...errors };
  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    clearError(key);
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  };

  const validateStep = (index: number) => {
    const schema = stepSchemas[index];
    if (!schema) return true;
    const result = schema.safeParse(values);
    if (result.success) return true;
    setErrors(fieldErrors(result.error));
    requestAnimationFrame(() => {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
    });
    return false;
  };

  const next = () => {
    if (validateStep(step)) goTo(step + 1);
  };

  const send = async () => {
    for (let index = 0; index < stepSchemas.length; index++) {
      if (!validateStep(index)) {
        goTo(index);
        return;
      }
    }
    const result = await submit({ ...values });
    if (!result.ok) {
      // Return to the first step that the server flagged.
      const flagged = STEPS.findIndex((item) => item.fields.some((field) => field in result.errors));
      if (flagged >= 0) goTo(flagged);
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex min-h-[32rem] flex-col justify-center"
        role="status"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-navy text-white">
          <Check className="h-6 w-6" />
        </span>
        <h2 className="display-sm mt-8 text-navy">{confirmationTitle}</h2>
        <p className="mt-4 max-w-[30rem] text-[1.05rem] leading-relaxed text-muted">{message || confirmationText}</p>
        <dl className="mt-8 grid max-w-[30rem] gap-3 rounded-2xl border border-line bg-paper p-5 text-[0.92rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Dienst</dt>
            <dd className="text-right text-navy">{values.service}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Locatie</dt>
            <dd className="text-right text-navy">{values.location}</dd>
          </div>
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonClass('primary')}>
            Terug naar home
          </Link>
          <Link href="/diensten" className={buttonClass('secondary')}>
            Bekijk onze diensten
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 3) next();
        else void send();
      }}
      className="relative"
    >
      <Honeypot value={values.website} onChange={(value) => set('website', value)} />

      {/* Progress */}
      <ol className="grid grid-cols-4 gap-2" aria-label="Voortgang">
        {STEPS.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              disabled={index > step}
              onClick={() => index < step && goTo(index)}
              aria-current={index === step ? 'step' : undefined}
              className="group w-full text-left disabled:cursor-default"
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full origin-left bg-navy transition-transform duration-700 ease-[var(--ease-arch)]"
                  style={{ transform: `scaleX(${index <= step ? 1 : 0})` }}
                />
              </span>
              <span className={`mt-3 block font-mono text-[0.64rem] tracking-[0.14em] uppercase ${index === step ? 'text-navy' : 'text-muted'}`}>
                {String(index + 1).padStart(2, '0')} <span className="hidden sm:inline">{item.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="relative mt-10 min-h-[26rem]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.fieldset
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="min-w-0"
          >
            <legend className="sr-only">{STEPS[step].title}</legend>
            <h2 ref={heading} tabIndex={-1} className="display-sm text-navy outline-none">
              {step === 0 && 'Welke beveiligingsdienst zoekt u?'}
              {step === 1 && 'Vertel ons over de opdracht.'}
              {step === 2 && 'Hoe kunnen wij u bereiken?'}
              {step === 3 && 'Controleer uw aanvraag.'}
            </h2>

            {step === 0 && (
              <div className="mt-8">
                <div role="radiogroup" aria-label="Gewenste beveiligingsdienst" aria-invalid={allErrors.service ? true : undefined} className="grid gap-2.5 sm:grid-cols-2">
                  {[...services.map((service) => service.title), OTHER_SERVICE].map((title, index) => {
                    const selected = values.service === title;
                    return (
                      <label
                        key={title}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-[border-color,background-color] duration-300 ${
                          selected ? 'border-navy bg-navy text-white' : 'border-line-strong bg-white text-ink hover:border-navy/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="service"
                          value={title}
                          checked={selected}
                          onChange={() => set('service', title)}
                          className="sr-only"
                        />
                        <span className={`font-mono text-[0.64rem] ${selected ? 'text-steel-soft' : 'text-steel'}`}>{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-[0.98rem] leading-snug">{title}</span>
                        <span
                          className={`ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? 'border-white bg-white text-navy' : 'border-line-strong'}`}
                          aria-hidden
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {allErrors.service && (
                  <p role="alert" className="mt-3 text-[0.85rem] text-danger">
                    {allErrors.service}
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="mt-8 grid gap-6">
                <Field id="location" label="Locatie van de opdracht" error={allErrors.location} hint="Bijvoorbeeld plaats, adres of type locatie.">
                  <TextInput id="location" value={values.location} onChange={(event) => set('location', event.target.value)} error={allErrors.location} hint="Bijvoorbeeld plaats, adres of type locatie." autoComplete="address-level2" />
                </Field>
                <Field id="message" label="Omschrijving van de aanvraag" error={allErrors.message} hint="Denk aan de periode, gewenste tijden, aantal bezoekers of bijzonderheden.">
                  <TextArea id="message" value={values.message} onChange={(event) => set('message', event.target.value)} error={allErrors.message} hint="Denk aan de periode, gewenste tijden, aantal bezoekers of bijzonderheden." maxLength={5000} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field id="company" label="Bedrijfsnaam" error={allErrors.company}>
                    <TextInput id="company" value={values.company} onChange={(event) => set('company', event.target.value)} error={allErrors.company} autoComplete="organization" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field id="name" label="Naam contactpersoon" error={allErrors.name}>
                    <TextInput id="name" value={values.name} onChange={(event) => set('name', event.target.value)} error={allErrors.name} autoComplete="name" />
                  </Field>
                </div>
                <Field id="email" label="E-mailadres" error={allErrors.email}>
                  <TextInput id="email" type="email" inputMode="email" value={values.email} onChange={(event) => set('email', event.target.value)} error={allErrors.email} autoComplete="email" />
                </Field>
                <Field id="phone" label="Telefoonnummer" error={allErrors.phone}>
                  <TextInput id="phone" type="tel" inputMode="tel" value={values.phone} onChange={(event) => set('phone', event.target.value)} error={allErrors.phone} autoComplete="tel" />
                </Field>
                <div className="sm:col-span-2">
                  <Consent checked={values.consent} onChange={(value) => set('consent', value)} error={allErrors.consent} note={privacyNote} />
                </div>
              </div>
            )}

            {step === 3 && (
              <dl className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
                {[
                  ['Gewenste dienst', values.service, 0],
                  ['Locatie', values.location, 1],
                  ['Omschrijving', values.message, 1],
                  ['Bedrijfsnaam', values.company, 2],
                  ['Contactpersoon', values.name, 2],
                  ['E-mailadres', values.email, 2],
                  ['Telefoonnummer', values.phone, 2],
                ].map(([label, value, target]) => (
                  <div key={label as string} className="grid gap-1 px-5 py-4 sm:grid-cols-[11rem_1fr_auto] sm:gap-4">
                    <dt className="text-[0.85rem] text-muted">{label}</dt>
                    <dd className="text-[0.95rem] break-words whitespace-pre-line text-navy">{value as string}</dd>
                    <button type="button" onClick={() => goTo(target as number)} className="justify-self-start text-[0.85rem] text-steel underline-offset-4 hover:text-navy hover:underline sm:justify-self-end">
                      Wijzig
                    </button>
                  </div>
                ))}
              </dl>
            )}
          </motion.fieldset>
        </AnimatePresence>
      </div>

      {status === 'error' && message && (
        <div className="mt-6">
          <FormAlert tone="error">{message}</FormAlert>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
        {step > 0 ? (
          <button type="button" onClick={() => goTo(step - 1)} className="inline-flex items-center gap-2 text-[0.95rem] text-muted hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Vorige
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={status === 'submitting'} className={buttonClass('primary', 'pr-2.5')} aria-live="polite">
          {status === 'submitting' ? (
            <>
              <span>Versturen…</span>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
            </>
          ) : (
            <>
              <span>{step < 3 ? 'Volgende stap' : 'Verstuur aanvraag'}</span>
              <ArrowBadge />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
