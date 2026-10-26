import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/server/password';
import { adminConfig, decodeSession, encodeSession, newSession, SESSION_IDLE } from '@/lib/server/session';

/* ── Environment: a throwaway checkout as local storage and a logged-in admin cookie ── */
const root = mkdtempSync(path.join(tmpdir(), 'dsm-admin-'));
process.env.ADMIN_LOCAL_ROOT = root;
process.env.ADMIN_SESSION_SECRET = 'x'.repeat(40);
process.env.ADMIN_PASSWORD_HASH = await hashPassword('een-heel-sterk-wachtwoord', { N: 16384 });
delete process.env.GITHUB_CONTENT_TOKEN;
delete process.env.VERCEL;

const jar = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (jar.has(name) ? { value: jar.get(name) } : undefined) }),
}));
vi.mock('next/cache', () => ({ updateTag: () => {}, cacheTag: () => {}, cacheLife: () => {} }));
vi.mock('next/server', () => ({ connection: async () => {} }));

const login = () => {
  const config = adminConfig();
  jar.set('dsm_admin', encodeSession(config, newSession(config)));
};

const content = await import('@/lib/admin/actions/content');
const media = await import('@/lib/admin/actions/media');
const availability = await import('@/lib/admin/actions/availability');
const { getSectionStates } = await import('@/lib/admin/content');
const { getStorage, ConflictError } = await import('@/lib/server/storage');

const read = (relative: string) => JSON.parse(readFileSync(path.join(root, relative), 'utf8'));

afterAll(() => rmSync(root, { recursive: true, force: true }));
beforeEach(() => {
  jar.clear();
  login();
});

describe('password and session', () => {
  it('verifies the password against its hash only', async () => {
    const hash = process.env.ADMIN_PASSWORD_HASH!;
    expect(await verifyPassword('een-heel-sterk-wachtwoord', hash)).toBe(true);
    expect(await verifyPassword('fout', hash)).toBe(false);
    expect(await verifyPassword('een-heel-sterk-wachtwoord', 'scrypt$1$8$1$AA==$AA==')).toBe(false);
  });

  it('accepts hashes made by npm run admin:wachtwoord', async () => {
    const output = execFileSync(process.execPath, ['scripts/admin-password.mjs'], { input: 'GhArF-jvnFS-yymRa-test\nGhArF-jvnFS-yymRa-test\n', encoding: 'utf8' });
    const hash = output.match(/ADMIN_PASSWORD_HASH=(\S+)/)![1];
    expect(output).not.toContain('GhArF-jvnFS-yymRa-test');
    expect(await verifyPassword('GhArF-jvnFS-yymRa-test', hash)).toBe(true);
  });

  it('logs in as yassine128 by default and rejects tampered or expired sessions', () => {
    const config = adminConfig();
    expect(config.username).toBe('yassine128');
    const value = encodeSession(config, newSession(config));
    expect(decodeSession(config, value)?.u).toBe('yassine128');
    expect(decodeSession(config, value.slice(0, -2) + 'xx')).toBeNull();
    const old = newSession(config, Date.now() - (SESSION_IDLE + 60) * 1000);
    expect(decodeSession(config, encodeSession(config, old))).toBeNull();
    // A new password ends every existing session.
    expect(decodeSession({ ...config, passwordHash: config.passwordHash + 'x' }, value)).toBeNull();
  });
});

describe('admin storage (local checkout)', () => {
  it('refuses to save without a valid session', async () => {
    jar.clear();
    const result = await content.saveDraft('home', {});
    expect(result.ok).toBe(false);
  });

  it('saves a concept without changing the live site, then publishes it', async () => {
    const states = await getSectionStates(getStorage()!);
    const home = structuredClone(states.home.draft);
    home.hero.title = 'Nieuwe kop';
    expect((await content.saveDraft('home', home)).ok).toBe(true);
    expect(existsSync(path.join(root, 'content/admin/drafts/home.json'))).toBe(true);
    expect(existsSync(path.join(root, 'content/live/home.json'))).toBe(false);

    const pending = await getSectionStates(getStorage()!);
    expect(pending.home.pending).toBe(true);
    expect(pending.home.published.hero.title).not.toBe('Nieuwe kop');

    const published = await content.publishSection('home');
    expect(published.ok).toBe(true);
    expect(read('content/live/home.json').content.hero.title).toBe('Nieuwe kop');
    expect(existsSync(path.join(root, 'content/admin/drafts/home.json'))).toBe(false);
    expect((await getSectionStates(getStorage()!)).home.publishedAt).toBeTruthy();
  });

  it('discards a concept', async () => {
    const states = await getSectionStates(getStorage()!);
    const faq = structuredClone(states.faq.draft);
    faq.items = faq.items.slice(0, 1);
    await content.saveDraft('faq', faq);
    expect((await content.discardDraft('faq')).ok).toBe(true);
    expect((await getSectionStates(getStorage()!)).faq.pending).toBe(false);
  });

  it('detects a conflicting save', async () => {
    const storage = getStorage()!;
    await storage.commit({ write: { 'content/admin/media.json': '{"items":[]}\n' }, message: 'test' });
    await expect(storage.commit({ write: { 'content/admin/media.json': '{}\n' }, expected: { 'content/admin/media.json': null }, message: 'test' })).rejects.toBeInstanceOf(ConflictError);
  });

  it('only writes content and uploaded photos', async () => {
    await expect(getStorage()!.commit({ write: { 'src/app/page.tsx': 'x' }, message: 'test' })).rejects.toThrow();
    await expect(getStorage()!.commit({ write: { 'content/live/../../package.json': 'x' }, message: 'test' })).rejects.toThrow();
  });

  it('uploads a photo as WebP into public/uploads and lists it in the library', async () => {
    const png = await sharp({ create: { width: 40, height: 30, channels: 3, background: '#14243a' } }).png().toBuffer();
    const form = new FormData();
    form.append('files', new File([new Uint8Array(png)], 'test.png', { type: 'image/png' }));
    const result = await media.uploadMedia(form);
    expect(result.ok).toBe(true);
    const item = result.items![0];
    expect(item.url).toMatch(/^\/uploads\/[a-z0-9-]+\.webp$/);
    expect(existsSync(path.join(root, item.path))).toBe(true);
    expect(read('content/admin/media.json').items[0].id).toBe(item.id);

    // In use in a concept: cannot be deleted.
    expect((await content.setSlotImage('about', ['hero', 'image'], { src: item.url, alt: 'Team' })).ok).toBe(true);
    expect((await media.deleteMedia(item.id)).ok).toBe(false);
    await content.discardDraft('about');
    expect((await media.deleteMedia(item.id)).ok).toBe(true);
    expect(existsSync(path.join(root, item.path))).toBe(false);
  });

  it('stores availability and drops past days', async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const day = soon.toISOString().slice(0, 10);
    expect((await availability.setAvailability([day], 'limited', 'Alleen avond')).ok).toBe(true);
    expect(read('content/live/availability.json').days).toEqual([{ day, status: 'limited', note: 'Alleen avond' }]);
    expect((await availability.setAvailability([day], null)).ok).toBe(true);
    expect(read('content/live/availability.json').days).toEqual([]);
    expect((await availability.setAvailability(['2026-02-30'], 'available')).ok).toBe(false);
  });
});
