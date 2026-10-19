'use client';

import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { deleteEnquiry, saveEnquiryNotes, setEnquiryStatus, type EnquiryStatus } from '@/lib/admin/actions/enquiries';
import { useToast } from './Toaster';
import { Card, CardHeader, STATUS_LABEL, adminButton, formatDate } from './ui';

const OPTIONS: EnquiryStatus[] = ['new', 'contacted', 'completed'];

export function EnquiryControls({ id, status: initialStatus, notes: initialNotes }: { id: string; status: EnquiryStatus; notes: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [notesPending, startNotes] = useTransition();
  const notify = useToast();
  const router = useRouter();

  const changeStatus = (next: EnquiryStatus) => {
    const previous = status;
    setStatus(next);
    start(async () => {
      const result = await setEnquiryStatus(id, next);
      if (!result.ok) setStatus(previous);
      notify(result.ok ? 'success' : 'error', result.message);
      if (result.ok) router.refresh();
    });
  };

  return (
    <>
      <Card>
        <CardHeader title="Status" description="Houd bij hoe ver deze aanvraag is." />
        <div role="radiogroup" aria-label="Status" className="grid grid-cols-3 gap-1 p-3">
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={status === option}
              disabled={pending}
              onClick={() => status !== option && changeStatus(option)}
              className={`rounded-xl px-2 py-2.5 text-[0.85rem] transition-colors ${status === option ? 'bg-navy text-white' : 'bg-paper text-muted hover:text-navy'}`}
            >
              {STATUS_LABEL[option]}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Interne notities" description="Alleen zichtbaar voor beheerders." />
        <div className="p-5">
          <label htmlFor="notities" className="sr-only">
            Interne notities
          </label>
          <textarea
            id="notities"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={7}
            maxLength={10000}
            placeholder="Bijvoorbeeld: teruggebeld op …, offerte verstuurd op …"
            className="block w-full resize-y rounded-xl border border-line-strong px-4 py-3 text-[0.92rem] leading-relaxed outline-none focus:border-navy"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[0.8rem] text-muted" aria-live="polite">
              {notes !== savedNotes ? 'Niet opgeslagen wijzigingen' : savedAt ? `Opgeslagen ${formatDate(savedAt)}` : ''}
            </span>
            <button
              type="button"
              disabled={notesPending || notes === savedNotes}
              className={adminButton('primary')}
              onClick={() =>
                startNotes(async () => {
                  const result = await saveEnquiryNotes(id, notes);
                  notify(result.ok ? 'success' : 'error', result.message);
                  if (result.ok) {
                    setSavedNotes(notes);
                    setSavedAt(result.at ?? null);
                  }
                })
              }
            >
              {notesPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Notities opslaan
            </button>
          </div>
        </div>
      </Card>

      <button
        type="button"
        className={adminButton('danger', 'w-full')}
        onClick={() => {
          if (!window.confirm('Deze aanvraag definitief verwijderen? Dit kan niet ongedaan worden gemaakt.')) return;
          start(async () => {
            const result = await deleteEnquiry(id);
            notify(result.ok ? 'success' : 'error', result.message);
            if (result.ok) router.push('/admin/aanvragen');
          });
        }}
      >
        <Trash2 className="h-4 w-4" aria-hidden /> Aanvraag verwijderen
      </button>
    </>
  );
}
