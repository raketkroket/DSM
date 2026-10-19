'use client';

import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ArrowBadge, buttonClass } from '@/components/site/Button';
import { contactSchema, fieldErrors, type FieldErrors } from '@/lib/enquiry/schema';
import { Consent, Field, FormAlert, Honeypot, TextArea, TextInput } from './fields';
import { useSubmission } from './useSubmission';

const local = contactSchema.omit({ startedAt: true, token: true, website: true });

export function ContactForm({ privacyNote }: { privacyNote: string }) {
  const [values, setValues] = useState({ name: '', company: '', email: '', phone: '', message: '', consent: false, website: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const { status, message, serverErrors, submit, clearError } = useSubmission('/api/contact');
  const allErrors = { ...serverErrors, ...errors };

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    clearError(key);
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex flex-col items-start rounded-[1.5rem] border border-line bg-white p-8 shadow-soft md:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-navy text-white">
          <Check className="h-5 w-5" />
        </span>
        <h3 className="display-sm mt-6 text-navy">Bericht ontvangen.</h3>
        <p className="mt-3 max-w-[28rem] leading-relaxed text-muted">{message}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="relative grid gap-6 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = local.safeParse(values);
        if (!result.success) {
          setErrors(fieldErrors(result.error));
          requestAnimationFrame(() => document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus());
          return;
        }
        await submit({ ...values });
      }}
    >
      <Honeypot value={values.website} onChange={(value) => set('website', value)} />
      <Field id="contact-name" label="Naam" error={allErrors.name}>
        <TextInput id="contact-name" value={values.name} onChange={(event) => set('name', event.target.value)} error={allErrors.name} autoComplete="name" />
      </Field>
      <Field id="contact-company" label="Bedrijfsnaam" optional error={allErrors.company}>
        <TextInput id="contact-company" value={values.company} onChange={(event) => set('company', event.target.value)} error={allErrors.company} autoComplete="organization" />
      </Field>
      <Field id="contact-email" label="E-mailadres" error={allErrors.email}>
        <TextInput id="contact-email" type="email" inputMode="email" value={values.email} onChange={(event) => set('email', event.target.value)} error={allErrors.email} autoComplete="email" />
      </Field>
      <Field id="contact-phone" label="Telefoonnummer" optional error={allErrors.phone}>
        <TextInput id="contact-phone" type="tel" inputMode="tel" value={values.phone} onChange={(event) => set('phone', event.target.value)} error={allErrors.phone} autoComplete="tel" />
      </Field>
      <div className="sm:col-span-2">
        <Field id="contact-message" label="Bericht" error={allErrors.message}>
          <TextArea id="contact-message" value={values.message} onChange={(event) => set('message', event.target.value)} error={allErrors.message} maxLength={5000} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Consent checked={values.consent} onChange={(value) => set('consent', value)} error={allErrors.consent} note={privacyNote} />
      </div>
      {status === 'error' && message && (
        <div className="sm:col-span-2">
          <FormAlert tone="error">{message}</FormAlert>
        </div>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={status === 'submitting'} className={buttonClass('primary', 'pr-2.5')}>
          {status === 'submitting' ? (
            <>
              <span>Versturen…</span>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
            </>
          ) : (
            <>
              <span>Verstuur bericht</span>
              <ArrowBadge />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
