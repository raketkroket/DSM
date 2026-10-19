'use client';

import { useRouter } from 'next/navigation';
import { Eye, Loader2, RotateCcw, Save, UploadCloud } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { discardDraft, publishSection, saveDraft } from '@/lib/admin/actions/content';
import type { MediaItem } from '@/lib/admin/actions/media';
import type { PanelSpec } from '@/lib/admin/editor-spec';
import type { SectionKey } from '@/lib/content/types';
import { useToast } from '../Toaster';
import { Badge, adminButton, formatDate } from '../ui';
import { FieldRenderer, type FieldContext } from './Fields';
import { getAt, setAt } from './path';

type Props = {
  section: SectionKey;
  panels: PanelSpec[];
  initial: unknown;
  published: unknown;
  pending: boolean;
  publishedAt: string | null;
  draftUpdatedAt: string | null;
  media: MediaItem[];
  previews: { href: string; label: string }[];
  internalPages: { href: string; label: string }[];
};

export function ContentEditor({ section, panels, initial, published, pending, publishedAt, draftUpdatedAt, media: initialMedia, previews, internalPages }: Props) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [hasPending, setHasPending] = useState(pending);
  const [savedAt, setSavedAt] = useState(draftUpdatedAt);
  const [liveAt, setLiveAt] = useState(publishedAt);
  const [panel, setPanel] = useState(0);
  const [media, setMedia] = useState(initialMedia);
  const [busy, start] = useTransition();
  const [action, setAction] = useState<'save' | 'publish' | 'discard' | null>(null);
  const notify = useToast();
  const router = useRouter();

  const dirty = JSON.stringify(value) !== saved;

  const context: FieldContext = useMemo(
    () => ({ media, onMediaAdded: (items) => setMedia((current) => [...items, ...current]), internalPages }),
    [media, internalPages],
  );

  const save = useCallback(
    (then?: () => void) => {
      setAction('save');
      start(async () => {
        const result = await saveDraft(section, value);
        notify(result.ok ? 'success' : 'error', result.message, result.problems);
        if (result.ok) {
          setSaved(JSON.stringify(value));
          setSavedAt(result.at ?? null);
          setHasPending(JSON.stringify(value) !== JSON.stringify(published));
          then?.();
        }
        setAction(null);
      });
    },
    [section, value, notify, published],
  );

  const publish = () => {
    if (!window.confirm('Wijzigingen publiceren? Ze worden direct zichtbaar op de website.')) return;
    setAction('publish');
    start(async () => {
      const result = await publishSection(section, value);
      notify(result.ok ? 'success' : 'error', result.message, result.problems);
      if (result.ok) {
        setSaved(JSON.stringify(value));
        setHasPending(false);
        setLiveAt(result.at ?? null);
        router.refresh();
      }
      setAction(null);
    });
  };

  const discard = () => {
    if (!window.confirm('Alle niet-gepubliceerde wijzigingen in dit onderdeel verwerpen?')) return;
    setAction('discard');
    start(async () => {
      const result = await discardDraft(section);
      notify(result.ok ? 'success' : 'error', result.message);
      if (result.ok) {
        setValue(published);
        setSaved(JSON.stringify(published));
        setHasPending(false);
      }
      setAction(null);
    });
  };

  const preview = (href: string) => {
    const open = () => window.open(href, '_blank', 'noopener');
    if (dirty) save(open);
    else open();
  };

  // Ctrl/Cmd + S saves the concept.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (dirty && !busy) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, busy, save]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const current = panels[panel];
  const basePath = current.key ? [current.key] : [];

  return (
    <div>
      {/* Action bar */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8 lg:top-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-muted" aria-live="polite">
            {dirty ? (
              <Badge tone="warning">Niet opgeslagen wijzigingen</Badge>
            ) : hasPending ? (
              <Badge tone="steel">Concept opgeslagen{savedAt ? ` · ${formatDate(savedAt)}` : ''}</Badge>
            ) : liveAt ? (
              <Badge tone="success">Gepubliceerd · {formatDate(liveAt)}</Badge>
            ) : (
              <>
                <Badge>Standaardtekst</Badge>
                <span>Toont de tekst uit het aangeleverde document.</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {previews.length === 1 ? (
              <button type="button" onClick={() => preview(previews[0].href)} className={adminButton('ghost')} disabled={busy}>
                <Eye className="h-4 w-4" aria-hidden /> Voorbeeld
              </button>
            ) : (
              <label className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted" aria-hidden />
                <span className="sr-only">Voorbeeld van pagina</span>
                <select
                  className="h-10 max-w-[13rem] rounded-xl border border-line-strong bg-white px-3 text-[0.85rem]"
                  value=""
                  onChange={(event) => event.target.value && preview(event.target.value)}
                  disabled={busy}
                >
                  <option value="">Voorbeeld van…</option>
                  {previews.map((item) => (
                    <option key={item.href} value={item.href}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {hasPending && (
              <button type="button" onClick={discard} disabled={busy} className={adminButton('ghost')}>
                {action === 'discard' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
                Verwerpen
              </button>
            )}
            <button type="button" onClick={() => save()} disabled={busy || !dirty} className={adminButton('secondary')}>
              {action === 'save' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
              Concept opslaan
            </button>
            <button type="button" onClick={publish} disabled={busy || (!dirty && !hasPending)} className={adminButton('primary')}>
              {action === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UploadCloud className="h-4 w-4" aria-hidden />}
              Publiceren
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_1fr]">
        {panels.length > 1 && (
          <nav aria-label="Onderdelen" className="lg:sticky lg:top-24 lg:self-start">
            <ol className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
              {panels.map((item, index) => (
                <li key={item.label} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setPanel(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    aria-current={panel === index ? 'true' : undefined}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.88rem] transition-colors ${
                      panel === index ? 'bg-white text-navy shadow-[0_1px_2px_rgba(17,43,70,0.06)] ring-1 ring-line' : 'text-muted hover:text-navy'
                    }`}
                  >
                    <span className="font-mono text-[0.68rem] text-steel">{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <section aria-labelledby="paneel-titel" className={`rounded-2xl border border-line bg-white p-5 md:p-7 ${panels.length > 1 ? '' : 'lg:col-span-2'}`}>
          <h2 id="paneel-titel" className="text-[1.25rem] font-medium tracking-[-0.02em] text-navy">
            {current.label}
          </h2>
          {current.help && <p className="mt-1 text-[0.88rem] text-muted">{current.help}</p>}
          <div className="mt-6 space-y-6">
            {current.fields.map((field) => {
              const path = [...basePath, field.key];
              return (
                <FieldRenderer
                  key={`${panel}-${field.key}`}
                  spec={field}
                  value={getAt(value, path)}
                  onChange={(next) => setValue((existing: unknown) => setAt(existing, path, next))}
                  context={context}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
