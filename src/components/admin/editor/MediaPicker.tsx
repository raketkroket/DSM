'use client';

import Image from 'next/image';
import { Check, Loader2, Search, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { MediaItem } from '@/lib/admin/actions/media';
import { uploadPhotos } from '@/lib/admin/upload-client';
import { useToast } from '../Toaster';
import { adminButton } from '../ui';

export function MediaPicker({
  media,
  onMediaAdded,
  onChoose,
  onClose,
  current,
}: {
  media: MediaItem[];
  onMediaAdded: (items: MediaItem[]) => void;
  onChoose: (item: MediaItem) => void;
  onClose: () => void;
  current: string;
}) {
  const [query, setQuery] = useState('');
  const [uploading, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const notify = useToast();

  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      previous?.focus();
    };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return media;
    return media.filter((item) => `${item.alt} ${item.original_name ?? ''}`.toLowerCase().includes(term));
  }, [media, query]);

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files];
    start(async () => {
      const result = await uploadPhotos(list);
      notify(result.ok ? 'success' : 'error', result.message, result.problems);
      if (result.items.length) onMediaAdded(result.items);
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="media-picker-title">
      <button type="button" className="absolute inset-0 bg-navy-deep/50 backdrop-blur-sm" aria-label="Sluiten" onClick={onClose} />
      <div ref={dialog} tabIndex={-1} className="relative flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-panel outline-none sm:rounded-3xl">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="media-picker-title" className="text-[1.1rem] font-medium text-navy">
              Kies een foto
            </h2>
            <p className="text-[0.82rem] text-muted">Uit de mediabibliotheek, of upload een nieuwe foto.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mist" aria-label="Sluiten">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <label className="relative flex-1">
            <span className="sr-only">Zoek in foto’s</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op alt-tekst of bestandsnaam" className="h-10 w-full rounded-xl border border-line-strong pr-3 pl-9 text-[0.9rem]" />
          </label>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(event) => upload(event.target.files)} />
          <button type="button" onClick={() => input.current?.click()} disabled={uploading} className={adminButton('primary')}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
            {uploading ? 'Bezig met uploaden…' : 'Foto uploaden'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[0.9rem] text-muted">{media.length === 0 ? 'De mediabibliotheek is nog leeg. Upload een eerste foto.' : 'Geen foto’s gevonden.'}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => {
                const selected = item.url === current;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onChoose(item)}
                      aria-pressed={selected}
                      className={`group relative block w-full overflow-hidden rounded-xl border-2 text-left transition-colors ${selected ? 'border-navy' : 'border-transparent hover:border-steel'}`}
                    >
                      <span className="relative block aspect-[4/3] bg-mist">
                        <Image src={item.url} alt="" fill sizes="240px" className="object-cover" />
                      </span>
                      <span className="block truncate px-2 py-1.5 text-[0.78rem] text-muted">{item.alt || item.original_name || 'Geen alt-tekst'}</span>
                      {selected && (
                        <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-navy text-white">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
