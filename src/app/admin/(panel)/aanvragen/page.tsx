import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Inbox, Search } from 'lucide-react';
import { AdminSkeleton, Badge, Card, EmptyState, KIND_LABEL, PageHeader, STATUS_LABEL, STATUS_TONE, adminButton, formatDate } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/admin/auth';
import { getPublishedSite } from '@/lib/content/get';
import { OTHER_SERVICE } from '@/lib/enquiry/schema';

export const metadata: Metadata = { title: 'Aanvragen' };

const PAGE_SIZE = 25;
type Row = {
  id: string;
  kind: 'quote' | 'contact';
  status: 'new' | 'contacted' | 'completed';
  company: string;
  name: string;
  email: string;
  service: string;
  location: string;
  created_at: string;
  email_status: string;
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

async function List({ searchParams }: { searchParams: PageProps<'/admin/aanvragen'>['searchParams'] }) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const status = one(params.status);
  const kind = one(params.soort);
  const service = one(params.dienst);
  const q = one(params.q).trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(one(params.pagina) || '1', 10) || 1);

  let query = supabase
    .from('enquiries')
    .select('id, kind, status, company, name, email, service, location, created_at, email_status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status === 'open') query = query.neq('status', 'completed');
  else if (['new', 'contacted', 'completed'].includes(status)) query = query.eq('status', status);
  if (['quote', 'contact'].includes(kind)) query = query.eq('kind', kind);
  if (service) query = query.eq('service', service);
  if (q) {
    // Strip characters that have meaning in PostgREST filter syntax.
    const term = q.replace(/[%,()*\\]/g, ' ');
    query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,location.ilike.%${term}%`);
  }
  const { data, count, error } = await query;
  const rows = (data ?? []) as Row[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const site = await getPublishedSite();
  const services = [...site.services.items.map((item) => item.title), OTHER_SERVICE];

  const link = (overrides: Record<string, string>) => {
    const next = new URLSearchParams({ ...(status && { status }), ...(kind && { soort: kind }), ...(service && { dienst: service }), ...(q && { q }), ...overrides });
    for (const [key, value] of [...next.entries()]) if (!value) next.delete(key);
    const string = next.toString();
    return `/admin/aanvragen${string ? `?${string}` : ''}`;
  };

  const tabs = [
    { value: '', label: 'Alle' },
    { value: 'new', label: 'Nieuw' },
    { value: 'contacted', label: 'Gecontacteerd' },
    { value: 'completed', label: 'Afgerond' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Beheer" title="Aanvragen" description="Offerteaanvragen en contactberichten van de website." />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter op status" className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={link({ status: tab.value, pagina: '' })}
              aria-current={status === tab.value ? 'page' : undefined}
              className={`rounded-lg px-3.5 py-2 text-[0.86rem] transition-colors ${status === tab.value ? 'bg-navy text-white' : 'text-muted hover:text-navy'}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <form className="flex flex-wrap items-center gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <select name="soort" defaultValue={kind} aria-label="Soort" className="h-10 rounded-xl border border-line-strong bg-white px-3 text-[0.88rem]">
            <option value="">Alle soorten</option>
            <option value="quote">Offerteaanvragen</option>
            <option value="contact">Contactberichten</option>
          </select>
          <select name="dienst" defaultValue={service} aria-label="Dienst" className="h-10 max-w-[14rem] rounded-xl border border-line-strong bg-white px-3 text-[0.88rem]">
            <option value="">Alle diensten</option>
            {services.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          <label className="relative">
            <span className="sr-only">Zoeken</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Zoek op naam, bedrijf, e-mail…" className="h-10 w-64 rounded-xl border border-line-strong bg-white pr-3 pl-9 text-[0.88rem]" />
          </label>
          <button type="submit" className={adminButton('secondary')}>
            Filter
          </button>
        </form>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <p className="p-6 text-[0.9rem] text-danger">Aanvragen laden mislukt: {error.message}</p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-5 w-5" />}
            title={q || status || kind || service ? 'Geen aanvragen gevonden' : 'Nog geen aanvragen'}
            text={q || status || kind || service ? 'Pas de filters aan om meer resultaten te zien.' : 'Nieuwe aanvragen verschijnen hier automatisch.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-[0.9rem]">
              <thead className="border-b border-line bg-paper text-[0.75rem] tracking-[0.04em] text-muted uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Aanvrager</th>
                  <th scope="col" className="px-5 py-3 font-medium">Soort / dienst</th>
                  <th scope="col" className="px-5 py-3 font-medium">Locatie</th>
                  <th scope="col" className="px-5 py-3 font-medium">Ontvangen</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.id} className="group relative hover:bg-paper">
                    <td className="px-5 py-4">
                      <Link href={`/admin/aanvragen/${row.id}`} className="font-medium text-navy after:absolute after:inset-0">
                        {row.company || row.name}
                      </Link>
                      <p className="text-[0.8rem] text-muted">{row.company ? `${row.name} · ` : ''}{row.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-ink">{KIND_LABEL[row.kind]}</p>
                      <p className="text-[0.8rem] text-muted">{row.service || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-muted">{row.location || '—'}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted">{formatDate(row.created_at)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 && (
        <nav aria-label="Paginering" className="flex items-center justify-between text-[0.88rem] text-muted">
          <span>
            {total} aanvragen · pagina {page} van {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={link({ pagina: String(page - 1) })} className={adminButton('secondary')}>
                Vorige
              </Link>
            )}
            {page < pages && (
              <Link href={link({ pagina: String(page + 1) })} className={adminButton('secondary')}>
                Volgende
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

export default function EnquiriesPage({ searchParams }: PageProps<'/admin/aanvragen'>) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <List searchParams={searchParams} />
    </Suspense>
  );
}
