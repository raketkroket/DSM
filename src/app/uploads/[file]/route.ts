import { getStorage } from '@/lib/server/storage';

/**
 * Uploaded photos are committed to public/uploads/ and served as static files after the next
 * deployment. Until then (a fresh upload shown in the editor or preview) this route serves the
 * file straight from the storage. Static files take precedence, so after a deploy it is not used.
 */
export async function GET(_: Request, { params }: RouteContext<'/uploads/[file]'>) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.webp$/.test(file)) return new Response('Niet gevonden', { status: 404 });
  const data = await getStorage()?.file(`public/uploads/${file}`);
  if (!data) return new Response('Niet gevonden', { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': 'image/webp',
      // File names are random and never reused, so the file never changes.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
