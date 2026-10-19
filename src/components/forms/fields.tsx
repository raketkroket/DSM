'use client';

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

const base =
  'peer block w-full rounded-xl border bg-white px-4 text-[1rem] text-ink placeholder:text-muted/60 transition-[border-color,box-shadow] duration-300 outline-none focus:border-navy focus:shadow-[0_0_0_4px_rgba(110,145,172,0.18)]';

export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.92rem] font-medium text-navy">
          {label}
        </label>
        {optional && <span className="font-mono text-[0.62rem] tracking-[0.12em] text-muted uppercase">Optioneel</span>}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-[0.85rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[0.85rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ id, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string; hint?: string }) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={`${base} h-[3.25rem] ${error ? 'border-danger' : 'border-line-strong'}`}
      {...props}
    />
  );
}

export function TextArea({ id, error, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string; hint?: string }) {
  return (
    <textarea
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      className={`${base} min-h-[10rem] resize-y py-3.5 leading-relaxed ${error ? 'border-danger' : 'border-line-strong'}`}
      {...props}
    />
  );
}

/** Invisible to people, tempting to bots. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

export function Consent({ checked, onChange, error, note }: { checked: boolean; onChange: (value: boolean) => void; error?: string; note: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[0.92rem] leading-relaxed text-muted">
        <input
          type="checkbox"
          name="consent"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'consent-error' : undefined}
          className="mt-1 h-4 w-4 shrink-0 accent-navy"
        />
        <span>
          {note}{' '}
          <a href="/privacy" className="text-navy underline underline-offset-4" target="_blank" rel="noopener">
            Lees onze privacyverklaring
          </a>
          .
        </span>
      </label>
      {error && (
        <p id="consent-error" role="alert" className="mt-2 text-[0.85rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: 'error' | 'info'; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 text-[0.92rem] leading-relaxed ${
        tone === 'error' ? 'border-danger/30 bg-danger/5 text-danger' : 'border-line bg-mist text-ink'
      }`}
    >
      {children}
    </div>
  );
}
