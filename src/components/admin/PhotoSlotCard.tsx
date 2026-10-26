'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, ImagePlus, Library, Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { setSlotImage } from '@/lib/admin/actions/content';
import type { MediaItem } from '@/lib/admin/actions/media';
import { uploadPhotos } from '@/lib/admin/upload-client';
import type { SectionKey } from '@/lib/content/types';
import { MediaPicker } from './editor/MediaPicker';
import { useToast } from './Toaster';
import { Badge, adminButton } from './ui';

type Props = {
  section: SectionKey;
  path: (string | number)[];
  label: string;
  src: string;
  alt: string;
  temporary: boolean;
  media: MediaItem[];
};

/** One image slot: upload a company photo straight into it, or pick one from the library. */
export function PhotoSlotCard({ section, path, label, src, alt, temporary, media: initialMedia }: Props) {
  const [current, setCurrent] = useState({ src, alt, temporary });
  const [media, setMedia] = useState(initialMedia);
  const [picking, setPicking] = useState(false);
  const [busy, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const notify = useToast();
  const router = useRouter();

  const place = (item: { url: string; alt: string }) =>
    start(async () => {
      const result = await setSlotImage(section, path, { src: item.url, alt: item.alt || current.alt });
      notify(result.ok ? 'success' : 'error', result.ok ? 'Foto geplaatst als concept. Publiceer om hem live te zetten.' : result.message, result.problems);
      if (result.ok) {
        setCurrent({ src: item.url, alt: item.alt || current.alt, temporary: false });
        router.refresh();
      }
    });

  const upload = (file: File | undefined) => {
    if (!file) return;
    start(async () => {
      const result = await uploadPhotos([file]);
      if (!result.items[0]) {
        notify('error', result.message, result.problems);
        return;
      }
      const item = result.items[0];
      setMedia((existing) => [item, ...existing]);
      const placed = await setSlotImage(section, path, { src: item.url, alt: current.alt });
      notify(placed.ok ? 'success' : 'error', placed.ok ? 'Eigen foto geüpload en geplaatst als concept.' : placed.message);
      if (placed.ok) {
        setCurrent({ src: item.url, alt: current.alt, temporary: false });
        router.refresh();
      }
    });
  };

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-[16/10] bg-mist">
        {current.src && <Image src={current.src} alt={current.alt} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 90vw" className="object-cover" />}
        <span className="absolute top-2 left-2">
          {current.temporary ? (
            <Badge tone="warning">Tijdelijke stockfoto</Badge>
          ) : (
            <Badge tone="success">
              <Check className="h-3 w-3" aria-hidden /> Eigen foto
            </Badge>
          )}
        </span>
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-navy" aria-label="Bezig" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[0.85rem] leading-snug text-ink">{label}</p>
        <p className="line-clamp-2 text-[0.78rem] text-muted">{current.alt || 'Geen alt-tekst'}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <input ref={input} type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => upload(event.target.files?.[0])} />
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className={adminButton('primary', 'h-9 px-3 text-[0.82rem]')}>
            <ImagePlus className="h-4 w-4" aria-hidden /> Eigen foto uploaden
          </button>
          <button type="button" disabled={busy} onClick={() => setPicking(true)} className={adminButton('secondary', 'h-9 px-3 text-[0.82rem]')}>
            <Library className="h-4 w-4" aria-hidden /> Uit bibliotheek
          </button>
        </div>
      </div>
      {picking && (
        <MediaPicker
          media={media}
          current={current.src}
          onMediaAdded={(items) => setMedia((existing) => [...items, ...existing])}
          onClose={() => setPicking(false)}
          onChoose={(item) => {
            setPicking(false);
            place({ url: item.url, alt: item.alt });
          }}
        />
      )}
    </li>
  );
}
