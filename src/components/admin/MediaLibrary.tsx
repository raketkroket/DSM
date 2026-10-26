'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUp, Copy, GripVertical, ImageIcon, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useRef, useState, useTransition, type DragEvent } from 'react';
import { deleteMedia, getMediaUsage, reorderMedia, updateMediaAlt, type MediaItem } from '@/lib/admin/actions/media';
import { replacePhoto, uploadPhotos } from '@/lib/admin/upload-client';
import { useToast } from './Toaster';
import { Badge, EmptyState, adminButton, formatDate } from './ui';

const formatSize = (bytes: number | null) => (bytes ? `${Math.round(bytes / 1024)} kB` : '');

function MediaCard({
  item,
  index,
  total,
  onChange,
  onRemove,
  onMove,
  dragProps,
}: {
  item: MediaItem;
  index: number;
  total: number;
  onChange: (item: MediaItem) => void;
  onRemove: (id: string) => void;
  onMove: (from: number, to: number) => void;
  dragProps: Record<string, unknown>;
}) {
  const [alt, setAlt] = useState(item.alt);
  const [usage, setUsage] = useState<string[] | null>(null);
  const [busy, start] = useTransition();
  const replaceInput = useRef<HTMLInputElement>(null);
  const notify = useToast();

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white" {...dragProps}>
      <div className="relative aspect-[4/3] bg-mist">
        <Image src={item.url} alt={item.alt} fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 90vw" className="object-cover" />
        <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 font-mono text-[0.66rem] text-navy">
          <GripVertical className="h-3 w-3 cursor-grab" aria-hidden /> {String(index + 1).padStart(2, '0')}
        </span>
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/60">
            <Loader2 className="h-6 w-6 animate-spin text-navy" aria-label="Bezig" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-[0.75rem] text-muted">
          <span className="truncate" title={item.original_name ?? ''}>
            {item.original_name ?? 'Foto'}
          </span>
          <span className="shrink-0">
            {item.width && item.height ? `${item.width}×${item.height}` : ''} {formatSize(item.size_bytes)}
          </span>
        </div>
        <label className="block text-[0.8rem] text-navy">
          Alt-tekst
          <textarea
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Beschrijf wat er op de foto te zien is"
            className="mt-1 block w-full resize-y rounded-lg border border-line-strong px-2.5 py-1.5 text-[0.85rem] outline-none focus:border-navy"
          />
        </label>
        {alt !== item.alt && (
          <button
            type="button"
            disabled={busy}
            className={adminButton('primary', 'h-8 px-3 text-[0.8rem]')}
            onClick={() =>
              start(async () => {
                const result = await updateMediaAlt(item.id, alt);
                notify(result.ok ? 'success' : 'error', result.message);
                if (result.ok) onChange({ ...item, alt: alt.trim() });
              })
            }
          >
            Alt-tekst opslaan
          </button>
        )}
        {usage && (
          <div className="rounded-lg bg-paper p-2.5 text-[0.75rem]">
            {usage.length === 0 ? (
              <p className="text-muted">Niet in gebruik op de website.</p>
            ) : (
              <>
                <p className="font-medium text-navy">In gebruik ({usage.length}):</p>
                <ul className="mt-1 space-y-0.5 text-muted">
                  {usage.slice(0, 5).map((place) => (
                    <li key={place} className="truncate">
                      {place}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
          <div className="flex items-center">
          <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist disabled:opacity-30" aria-label="Eerder in de volgorde">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === total - 1} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist disabled:opacity-30" aria-label="Later in de volgorde">
            <ArrowDown className="h-4 w-4" />
          </button>
          </div>
          <div className="flex items-center">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist"
            aria-label="Gebruik tonen"
            title="Waar wordt deze foto gebruikt?"
            onClick={() => start(async () => setUsage(await getMediaUsage(item.url)))}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist"
            aria-label="Link kopiëren"
            title="Link kopiëren"
            onClick={async () => {
              await navigator.clipboard.writeText(item.url);
              notify('success', 'Link gekopieerd.');
            }}
          >
            <Copy className="h-4 w-4" />
          </button>
          <input
            ref={replaceInput}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              start(async () => {
                const result = await replacePhoto(item.id, file);
                notify(result.ok ? 'success' : 'error', result.message);
                if (result.ok && 'item' in result && result.item) {
                  onChange(result.item);
                  setUsage(null);
                }
              });
            }}
          />
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-mist" aria-label="Foto vervangen" title="Foto vervangen" onClick={() => replaceInput.current?.click()}>
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
            aria-label="Foto verwijderen"
            title="Verwijderen (alleen als de foto niet in gebruik is)"
            onClick={() => {
              if (!window.confirm('Deze foto definitief verwijderen?')) return;
              start(async () => {
                const result = await deleteMedia(item.id);
                notify(result.ok ? 'success' : 'error', result.message, result.problems);
                if (result.ok) onRemove(item.id);
                else if (result.problems) setUsage(result.problems);
              });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          </div>
        </div>
        <p className="text-[0.7rem] text-muted">Toegevoegd {formatDate(item.created_at, false)}</p>
      </div>
    </li>
  );
}

export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [uploading, startUpload] = useTransition();
  const [, startOrder] = useTransition();
  const [over, setOver] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const notify = useToast();

  const upload = (files: FileList | File[]) => {
    const list = [...files];
    if (!list.length) return;
    startUpload(async () => {
      const result = await uploadPhotos(list);
      notify(result.ok ? 'success' : 'error', result.message, result.problems);
      if (result.items.length) setItems((current) => [...result.items, ...current]);
    });
  };

  const persistOrder = (next: MediaItem[]) => {
    setItems(next);
    startOrder(async () => {
      const result = await reorderMedia(next.map((item) => item.id));
      if (!result.ok) notify('error', result.message);
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };

  const onDropZone = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    if (event.dataTransfer.files.length) upload(event.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('Files')) {
            event.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDropZone}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${over ? 'border-navy bg-steel-wash' : 'border-line-strong bg-white'}`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-steel">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Upload className="h-5 w-5" aria-hidden />}
        </span>
        <p className="text-[0.95rem] font-medium text-navy">{uploading ? 'Foto’s worden geoptimaliseerd en geüpload…' : 'Sleep foto’s hierheen'}</p>
        <p className="text-[0.82rem] text-muted">JPG, PNG, WebP of AVIF, maximaal 15 MB. Foto’s worden automatisch verkleind en als WebP opgeslagen.</p>
        <input ref={input} type="file" multiple hidden accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => event.target.files && upload(event.target.files)} />
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className={adminButton('primary')}>
          Kies bestanden
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[0.88rem] text-muted">
          {items.length} foto{items.length === 1 ? '' : '’s'} · sleep kaarten om de volgorde te wijzigen
        </p>
        {items.some((item) => !item.alt) && <Badge tone="warning">{items.filter((item) => !item.alt).length} zonder alt-tekst</Badge>}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white">
          <EmptyState
            icon={<ImageIcon className="h-5 w-5" />}
            title="Nog geen eigen foto’s"
            text="De website gebruikt nu tijdelijke foto’s. Upload hier uw eigen beelden en kies ze daarna in de content-editor."
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              index={index}
              total={items.length}
              onChange={(next) => setItems((current) => current.map((existing) => (existing.id === next.id ? next : existing)))}
              onRemove={(id) => setItems((current) => current.filter((existing) => existing.id !== id))}
              onMove={move}
              dragProps={{
                draggable: true,
                onDragStart: () => setDragging(index),
                onDragOver: (event: DragEvent) => dragging !== null && event.preventDefault(),
                onDrop: (event: DragEvent) => {
                  event.preventDefault();
                  if (dragging !== null) move(dragging, index);
                  setDragging(null);
                },
                onDragEnd: () => setDragging(null),
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
