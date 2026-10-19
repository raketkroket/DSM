'use client';

import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud } from 'lucide-react';
import { useTransition } from 'react';
import { publishAll } from '@/lib/admin/actions/content';
import { useToast } from './Toaster';
import { adminButton } from './ui';

export function PublishAllButton({ count }: { count: number }) {
  const [pending, start] = useTransition();
  const notify = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      className={adminButton('primary')}
      onClick={() => {
        if (!window.confirm(`Alle ${count} concepten publiceren? De wijzigingen worden direct zichtbaar op de website.`)) return;
        start(async () => {
          const result = await publishAll();
          notify(result.ok ? 'success' : 'error', result.message);
          if (result.ok) router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UploadCloud className="h-4 w-4" aria-hidden />}
      Alles publiceren ({count})
    </button>
  );
}
