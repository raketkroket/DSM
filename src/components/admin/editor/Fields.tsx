'use client';

import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useId, useState, type DragEvent } from 'react';
import type { MediaItem } from '@/lib/admin/actions/media';
import type { FieldSpec } from '@/lib/admin/editor-spec';
import type { Cta, ImageRef } from '@/lib/content/types';
import { ImageField } from './ImageField';
import { blankLike } from './path';

export type FieldContext = { media: MediaItem[]; onMediaAdded: (items: MediaItem[]) => void; internalPages: { href: string; label: string }[] };

const inputClass =
  'mt-1.5 block w-full rounded-xl border border-line-strong bg-white px-3.5 text-[0.95rem] text-ink outline-none transition focus:border-navy focus:shadow-[0_0_0_4px_rgba(110,145,172,0.15)]';

function Label({ label, help, htmlFor, count, max }: { label: string; help?: string; htmlFor?: string; count?: number; max?: number }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[0.88rem] font-medium text-navy">
        {label}
        {help && <span className="mt-0.5 block text-[0.78rem] font-normal text-muted">{help}</span>}
      </label>
      {count !== undefined && <span className={`shrink-0 text-[0.72rem] ${max && count > max ? 'text-warning' : 'text-muted'}`}>{count} tekens</span>}
    </div>
  );
}

function TextField({ spec, value, onChange }: { spec: Extract<FieldSpec, { type: 'text' | 'textarea' | 'email' | 'url' }>; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const isSeo = spec.key.toLowerCase().includes('seodescription');
  return (
    <div>
      <Label label={spec.label} help={spec.help} htmlFor={id} count={spec.type === 'textarea' ? value.length : undefined} max={isSeo ? 160 : undefined} />
      {spec.type === 'textarea' ? (
        <textarea id={id} value={value} rows={spec.rows ?? 4} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y py-2.5 leading-relaxed`} />
      ) : (
        <input
          id={id}
          type={spec.type === 'email' ? 'email' : spec.type === 'url' ? 'url' : 'text'}
          inputMode={spec.type === 'email' ? 'email' : spec.type === 'url' ? 'url' : undefined}
          placeholder={spec.type === 'url' ? 'https://' : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} h-11`}
        />
      )}
    </div>
  );
}

function CtaField({ spec, value, onChange, pages }: { spec: FieldSpec; value: Cta; onChange: (value: Cta) => void; pages: FieldContext['internalPages'] }) {
  const labelId = useId();
  const hrefId = useId();
  const known = pages.some((page) => page.href === value.href);
  return (
    <fieldset className="rounded-2xl border border-line bg-paper p-4">
      <legend className="px-1 text-[0.88rem] font-medium text-navy">{spec.label}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={labelId} className="text-[0.8rem] text-muted">
            Tekst op de knop
          </label>
          <input id={labelId} value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })} className={`${inputClass} h-11`} />
        </div>
        <div>
          <label htmlFor={hrefId} className="text-[0.8rem] text-muted">
            Linkt naar
          </label>
          <select
            id={hrefId}
            value={known ? value.href : '__custom'}
            onChange={(event) => onChange({ ...value, href: event.target.value === '__custom' ? '' : event.target.value })}
            className={`${inputClass} h-11`}
          >
            {pages.map((page) => (
              <option key={page.href} value={page.href}>
                {page.label}
              </option>
            ))}
            <option value="__custom">Andere link…</option>
          </select>
          {!known && (
            <input
              aria-label="Eigen link"
              value={value.href}
              placeholder="/pagina of https://…"
              onChange={(event) => onChange({ ...value, href: event.target.value })}
              className={`${inputClass} mt-2 h-11`}
            />
          )}
        </div>
      </div>
    </fieldset>
  );
}

function ListField({ spec, value, onChange, context }: { spec: Extract<FieldSpec, { type: 'list' }>; value: unknown[]; onChange: (value: unknown[]) => void; context: FieldContext }) {
  const [open, setOpen] = useState<number | null>(spec.fixed ? null : value.length <= 3 ? -1 : null);
  const [dragging, setDragging] = useState<number | null>(null);
  const isSimple = !Array.isArray(spec.item);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const copy = [...value];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(copy);
    if (open === from) setOpen(to);
  };
  const remove = (index: number) => {
    if (!window.confirm(`${spec.itemLabel} ${index + 1} verwijderen?`)) return;
    onChange(value.filter((_, i) => i !== index));
  };
  const add = () => {
    const template = value[0] ?? (isSimple ? ((spec.item as { type: string }).type === 'image' ? { src: '', alt: '' } : '') : {});
    onChange([...value, blankLike(template)]);
    setOpen(value.length);
  };

  const onDrop = (event: DragEvent, index: number) => {
    event.preventDefault();
    if (dragging !== null) move(dragging, index);
    setDragging(null);
  };

  const title = (item: unknown, index: number) => {
    if (isSimple) {
      if (typeof item === 'string') return item || `${spec.itemLabel} ${index + 1}`;
      return (item as ImageRef)?.alt || `${spec.itemLabel} ${index + 1}`;
    }
    const raw = spec.titleKey ? (item as Record<string, unknown>)?.[spec.titleKey] : undefined;
    return typeof raw === 'string' && raw ? raw : `${spec.itemLabel} ${index + 1}`;
  };

  // Plain text items render inline; structured items collapse.
  const simpleText = isSimple && (spec.item as { type: string }).type !== 'image';

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.88rem] font-medium text-navy">{spec.label}</p>
          {spec.help && <p className="mt-0.5 text-[0.78rem] text-muted">{spec.help}</p>}
        </div>
        <span className="text-[0.75rem] text-muted">{value.length} items</span>
      </div>
      <ol className="mt-2 space-y-2">
        {value.map((item, index) => {
          const expanded = open === index || open === -1;
          return (
            <li
              key={index}
              draggable={!spec.fixed}
              onDragStart={() => setDragging(index)}
              onDragOver={(event) => !spec.fixed && event.preventDefault()}
              onDrop={(event) => onDrop(event, index)}
              onDragEnd={() => setDragging(null)}
              className={`rounded-2xl border bg-white transition-shadow ${dragging === index ? 'border-steel opacity-60' : 'border-line'}`}
            >
              <div className="flex items-center gap-2 px-3 py-2">
                {!spec.fixed && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-line-strong" aria-hidden />}
                <span className="w-6 shrink-0 font-mono text-[0.7rem] text-steel">{String(index + 1).padStart(2, '0')}</span>
                {simpleText ? (
                  <div className="min-w-0 flex-1">
                    {(spec.item as { type: string }).type === 'textarea' ? (
                      <textarea
                        aria-label={`${spec.itemLabel} ${index + 1}`}
                        value={item as string}
                        rows={3}
                        onChange={(event) => onChange(value.map((current, i) => (i === index ? event.target.value : current)))}
                        className="block w-full resize-y rounded-lg border border-transparent px-2 py-1.5 text-[0.92rem] leading-relaxed outline-none hover:border-line focus:border-navy"
                      />
                    ) : (
                      <input
                        aria-label={`${spec.itemLabel} ${index + 1}`}
                        value={item as string}
                        onChange={(event) => onChange(value.map((current, i) => (i === index ? event.target.value : current)))}
                        className="block h-9 w-full rounded-lg border border-transparent px-2 text-[0.92rem] outline-none hover:border-line focus:border-navy"
                      />
                    )}
                  </div>
                ) : (
                  <button type="button" onClick={() => setOpen(expanded ? null : index)} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
                    <span className="truncate text-[0.92rem] text-ink">{title(item, index)}</span>
                    <ChevronDown className={`ml-auto h-4 w-4 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                )}
                {!spec.fixed && (
                  <div className="flex shrink-0 items-center">
                    <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist disabled:opacity-30" aria-label={`${spec.itemLabel} ${index + 1} omhoog`}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => move(index, index + 1)} disabled={index === value.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist disabled:opacity-30" aria-label={`${spec.itemLabel} ${index + 1} omlaag`}>
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(index)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger" aria-label={`${spec.itemLabel} ${index + 1} verwijderen`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {!simpleText && expanded && (
                <div className="space-y-4 border-t border-line p-4">
                  {isSimple ? (
                    <ImageField
                      label={`${spec.itemLabel} ${index + 1}`}
                      value={item as ImageRef}
                      onChange={(next) => onChange(value.map((current, i) => (i === index ? next : current)))}
                      media={context.media}
                      onMediaAdded={context.onMediaAdded}
                    />
                  ) : (
                    (spec.item as FieldSpec[]).map((field) => (
                      <FieldRenderer
                        key={field.key}
                        spec={field}
                        value={(item as Record<string, unknown>)?.[field.key]}
                        onChange={(next) => onChange(value.map((current, i) => (i === index ? { ...(current as object), [field.key]: next } : current)))}
                        context={context}
                      />
                    ))
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!spec.fixed && (
        <button type="button" onClick={add} className="mt-2 inline-flex items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-[0.85rem] text-navy hover:border-navy">
          <Plus className="h-4 w-4" aria-hidden /> {spec.itemLabel} toevoegen
        </button>
      )}
    </div>
  );
}

export function FieldRenderer({ spec, value, onChange, context }: { spec: FieldSpec; value: unknown; onChange: (value: unknown) => void; context: FieldContext }) {
  switch (spec.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      return <TextField spec={spec} value={typeof value === 'string' ? value : ''} onChange={onChange} />;
    case 'image':
      return (
        <ImageField
          label={spec.label}
          help={spec.help}
          value={(value as ImageRef) ?? { src: '', alt: '' }}
          onChange={onChange}
          media={context.media}
          onMediaAdded={context.onMediaAdded}
        />
      );
    case 'cta':
      return <CtaField spec={spec} value={(value as Cta) ?? { label: '', href: '/' }} onChange={onChange} pages={context.internalPages} />;
    case 'group':
      return (
        <fieldset className="space-y-4 rounded-2xl border border-line p-4">
          <legend className="px-1 text-[0.88rem] font-medium text-navy">{spec.label}</legend>
          {spec.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              spec={field}
              value={(value as Record<string, unknown>)?.[field.key]}
              onChange={(next) => onChange({ ...(value as object), [field.key]: next })}
              context={context}
            />
          ))}
        </fieldset>
      );
    case 'list':
      return <ListField spec={spec} value={Array.isArray(value) ? value : []} onChange={onChange} context={context} />;
  }
}
