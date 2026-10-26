import 'server-only';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Where the admin's work is stored — no database.
 * Production: the GitHub repository, written server-side with a token that never reaches the
 * browser. Each save is one commit; Vercel rebuilds the site from it (content/admin/ changes are
 * skipped, see vercel.json). Local development (no token, not on Vercel): files in this checkout.
 *
 *   content/live/<section>.json      published content (what visitors see)
 *   content/live/availability.json   the availability calendar
 *   content/admin/drafts/<section>.json  concepts, only while they differ from the live version
 *   content/admin/media.json         the media library (alt texts, order, sizes)
 *   public/uploads/<id>.webp         uploaded photos
 */
export const WRITABLE = /^(content\/live\/[a-z]+\.json|content\/admin\/(drafts\/[a-z]+\.json|media\.json)|public\/uploads\/[a-z0-9-]+\.webp)$/;

export type StoredFile = { text: string; sha: string };
export type Change = {
  /** New text content per path. */
  write?: Record<string, string>;
  /** Binary files staged earlier with stage(). */
  blobs?: { path: string; sha: string }[];
  remove?: string[];
  /** Expected current blob sha per path (null: must not exist). A mismatch means someone else saved first. */
  expected?: Record<string, string | null>;
  message: string;
};

export interface Storage {
  kind: 'github' | 'local';
  read(paths: string[]): Promise<Record<string, StoredFile | null>>;
  stage(data: Buffer): Promise<string>;
  commit(change: Change): Promise<void>;
  file(target: string): Promise<Buffer | null>;
  check(): Promise<{ read: string; write: string }>;
}

export class ConflictError extends Error {
  constructor() {
    super('De website is intussen ergens anders aangepast. Vernieuw de pagina en probeer het opnieuw.');
  }
}

export const gitSha = (data: Buffer) => createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
export const serialize = (data: unknown) => `${JSON.stringify(data, null, 2)}\n`;

function assertWritable(change: Change) {
  const paths = [...Object.keys(change.write ?? {}), ...(change.blobs ?? []).map((blob) => blob.path), ...(change.remove ?? [])];
  if (paths.length === 0 || paths.some((target) => !WRITABLE.test(target))) throw new Error('Ongeldig bestand.');
}

export function getStorage(): Storage | null {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (token) {
    return githubStorage({
      token,
      repo: process.env.GITHUB_REPO || 'raketkroket/DSM',
      branch: process.env.GITHUB_BRANCH || 'main',
      api: (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, ''),
    });
  }
  if (!process.env.VERCEL) return localStorage(process.env.ADMIN_LOCAL_ROOT || process.cwd());
  return null;
}

function githubStorage({ token, repo, branch, api }: { token: string; repo: string; branch: string; api: string }): Storage {
  async function gh<T>(method: string, url: string, body?: unknown, options: { raw?: boolean; allow404?: boolean } = {}): Promise<T> {
    const response = await fetch(`${api}/repos/${repo}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: options.raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'dsm-admin',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    if (options.allow404 && response.status === 404) return null as T;
    if (!response.ok) {
      const error = new Error(`GitHub ${method} ${url.split('?')[0]}: HTTP ${response.status}`) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return (options.raw ? Buffer.from(await response.arrayBuffer()) : await response.json()) as T;
  }

  const ref = `/git/ref/heads/${encodeURIComponent(branch)}`;
  async function head() {
    const current = await gh<{ object: { sha: string } }>('GET', ref);
    const commit = await gh<{ tree: { sha: string } }>('GET', `/git/commits/${current.object.sha}`);
    const tree = await gh<{ tree: { path: string; sha: string; type: string }[] }>('GET', `/git/trees/${commit.tree.sha}?recursive=1`);
    const shas = new Map(tree.tree.filter((item) => item.type === 'blob').map((item) => [item.path, item.sha]));
    return { sha: current.object.sha, tree: commit.tree.sha, shas };
  }

  return {
    kind: 'github',
    async read(paths) {
      const current = await head();
      const result: Record<string, StoredFile | null> = {};
      await Promise.all(
        paths.map(async (target) => {
          const sha = current.shas.get(target);
          if (!sha) return void (result[target] = null);
          const blob = await gh<{ content: string }>('GET', `/git/blobs/${sha}`);
          result[target] = { text: Buffer.from(blob.content, 'base64').toString('utf8'), sha };
        }),
      );
      return result;
    },
    async stage(data) {
      const blob = await gh<{ sha: string }>('POST', '/git/blobs', { content: data.toString('base64'), encoding: 'base64' });
      return blob.sha;
    },
    async commit(change) {
      assertWritable(change);
      for (let attempt = 0; attempt < 2; attempt++) {
        const current = await head();
        for (const [target, sha] of Object.entries(change.expected ?? {})) {
          if ((current.shas.get(target) ?? null) !== sha) throw new ConflictError();
        }
        const entries = [
          ...Object.entries(change.write ?? {}).map(([target, content]) => ({ path: target, mode: '100644', type: 'blob', content })),
          ...(change.blobs ?? []).map((blob) => ({ path: blob.path, mode: '100644', type: 'blob', sha: blob.sha })),
          // Removing a file that is already gone is not an error.
          ...(change.remove ?? []).filter((target) => current.shas.has(target)).map((target) => ({ path: target, mode: '100644', type: 'blob', sha: null })),
        ];
        if (entries.length === 0) return;
        const tree = await gh<{ sha: string }>('POST', '/git/trees', { base_tree: current.tree, tree: entries });
        const commit = await gh<{ sha: string }>('POST', '/git/commits', { message: change.message, tree: tree.sha, parents: [current.sha] });
        try {
          await gh('PATCH', `/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.sha, force: false });
          return;
        } catch (error) {
          // 422: another commit landed in between; check the expectations again once.
          if ((error as { status?: number }).status !== 422 || attempt === 1) throw error;
        }
      }
      throw new ConflictError();
    },
    async file(target) {
      if (!WRITABLE.test(target)) return null;
      const encoded = target.split('/').map(encodeURIComponent).join('/');
      return gh<Buffer | null>('GET', `/contents/${encoded}?ref=${encodeURIComponent(branch)}`, undefined, { raw: true, allow404: true });
    },
    async check() {
      const result = { read: 'ok', write: 'ok' };
      try {
        await gh('GET', ref);
      } catch (error) {
        result.read = `fout ${(error as { status?: number }).status ?? 'netwerk'}`;
      }
      try {
        // Creating a blob does not change the repository (no commit), and it is the same blob every time.
        await gh('POST', '/git/blobs', { content: 'dsm-health', encoding: 'utf-8' });
      } catch (error) {
        result.write = `fout ${(error as { status?: number }).status ?? 'netwerk'}`;
      }
      return result;
    },
  };
}

// Uploaded photos waiting to be committed (local development only; kept per server process).
const staged = new Map<string, Buffer>();

function localStorage(root: string): Storage {
  const resolve = (target: string) => path.join(root, ...target.split('/'));
  const readOne = async (target: string): Promise<StoredFile | null> => {
    if (!existsSync(resolve(target))) return null;
    const data = await readFile(resolve(target));
    return { text: data.toString('utf8'), sha: gitSha(data) };
  };
  return {
    kind: 'local',
    async read(paths) {
      return Object.fromEntries(await Promise.all(paths.map(async (target) => [target, await readOne(target)] as const)));
    },
    async stage(data) {
      const sha = gitSha(data);
      staged.set(sha, data);
      return sha;
    },
    async commit(change) {
      assertWritable(change);
      for (const [target, sha] of Object.entries(change.expected ?? {})) {
        if (((await readOne(target))?.sha ?? null) !== sha) throw new ConflictError();
      }
      for (const blob of change.blobs ?? []) if (!staged.has(blob.sha)) throw new Error('Ongeldig bestand.');
      const writes: [string, Buffer][] = [
        ...Object.entries(change.write ?? {}).map(([target, text]) => [target, Buffer.from(text)] as [string, Buffer]),
        ...(change.blobs ?? []).map((blob) => [blob.path, staged.get(blob.sha)!] as [string, Buffer]),
      ];
      for (const [target, data] of writes) {
        await mkdir(path.dirname(resolve(target)), { recursive: true });
        await writeFile(resolve(target), data);
      }
      for (const target of change.remove ?? []) await rm(resolve(target), { force: true });
    },
    async file(target) {
      if (!WRITABLE.test(target) || !existsSync(resolve(target))) return null;
      return readFile(resolve(target));
    },
    async check() {
      return { read: 'ok', write: 'ok' };
    },
  };
}
