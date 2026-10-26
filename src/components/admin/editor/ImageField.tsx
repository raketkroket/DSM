'use client';

import Image from 'next/image';
import { AlertTriangle, Crosshair, ImagePlus, Trash2 } from 'lucide-react';
import { isTemporaryPhoto } from '@/lib/content/photos';
import { Badge } from '../ui';
import { useState, type MouseEvent } from 'react';
import type { MediaItem } from '@/lib/admin/actions/media';
import type { ImageRef } from '@/lib/content/types';
import { MediaPicker } from './MediaPicker';
import { adminButton } from '../ui';

export function ImageField({
  label,
  help,
  value,
  onChange,
  media,
  onMediaAdded,
  compact,
}: {
  label: string;
  help?: string;
  value: ImageRef;
  onChange: (value: ImageRef) => void;
  media: MediaItem[];
  onMediaAdded: (items: MediaItem[]) => void;
  compact?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const focus = value.focus ?? '50% 50%';
  const [fx, fy] = focus.split(' ').map((part) => Number.parseFloat(part));

  const setFocus = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    onChange({ ...value, focus: `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%` });
  };

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.9rem] font-medium text-navy">{label}</p>
          {help && <p className="mt-0.5 text-[0.8rem] text-muted">{help}</p>}
        </div>
        {isTemporaryPhoto(value.src) && <Badge tone="warning">Tijdelijke stockfoto</Badge>}
      </div>
      <div className={`mt-3 grid gap-4 ${compact ? '' : 'md:grid-cols-[minmax(0,15rem)_1fr]'}`}>
        <div>
          {value.src ? (
            <button
              type="button"
              onClick={setFocus}
              className="group relative block aspect-[16/10] w-full cursor-crosshair overflow-hidden rounded-xl bg-mist"
              aria-label="Klik om het focuspunt van de foto te bepalen"
              title="Klik op het belangrijkste deel van de foto"
            >
              <Image src={value.src} alt="" fill sizes="240px" className="object-cover" style={{ objectPosition: focus }} />
              <span
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-navy/60 shadow"
                style={{ left: `${fx}%`, top: `${fy}%` }}
                aria-hidden
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-navy-deep/70 px-2 py-1 text-[0.7rem] text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Crosshair className="h-3 w-3" aria-hidden /> Focuspunt: {focus}
              </span>
            </button>
          ) : (
            <div className="blueprint grid aspect-[16/10] w-full place-items-center rounded-xl border border-dashed border-line-strong bg-white text-[0.8rem] text-muted">Geen foto</div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => setPicking(true)} className={adminButton('secondary', 'h-9 px-3 text-[0.82rem]')}>
              <ImagePlus className="h-4 w-4" aria-hidden /> {value.src ? 'Vervangen' : 'Kies foto'}
            </button>
            {value.src && (
              <button type="button" onClick={() => onChange({ src: '', alt: '' })} className={adminButton('ghost', 'h-9 px-3 text-[0.82rem]')}>
                <Trash2 className="h-4 w-4" aria-hidden /> Verwijderen
              </button>
            )}
          </div>
        </div>
        {value.src && (
          <label className="block text-[0.85rem] text-navy">
            Alt-tekst
            <span className="ml-1 text-muted">(beschrijving voor zoekmachines en schermlezers)</span>
            <textarea
              value={value.alt}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              rows={compact ? 2 : 3}
              maxLength={300}
              className="mt-1.5 block w-full resize-y rounded-xl border border-line-strong bg-white px-3 py-2 text-[0.9rem] outline-none focus:border-navy"
            />
            {!value.alt.trim() && (
              <span className="mt-1.5 flex items-center gap-1.5 text-[0.78rem] text-warning">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Voeg een korte beschrijving toe.
              </span>
            )}
          </label>
        )}
      </div>
      {picking && (
        <MediaPicker
          media={media}
          current={value.src}
          onMediaAdded={onMediaAdded}
          onClose={() => setPicking(false)}
          onChoose={(item) => {
            onChange({ src: item.url, alt: item.alt || value.alt });
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
