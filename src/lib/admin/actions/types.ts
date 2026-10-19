export type ActionResult =
  | { ok: true; message: string; at?: string; problems?: string[] }
  | { ok: false; message: string; problems?: string[] };
