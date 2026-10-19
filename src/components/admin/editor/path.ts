export type Path = (string | number)[];

export function getAt(value: unknown, path: Path): unknown {
  return path.reduce<unknown>((current, key) => (current == null ? undefined : (current as Record<string | number, unknown>)[key]), value);
}

/** Immutable set: returns a new object with `next` stored at `path`. */
export function setAt<T>(value: T, path: Path, next: unknown): T {
  if (path.length === 0) return next as T;
  const [head, ...rest] = path;
  if (Array.isArray(value)) {
    const copy = [...value];
    copy[head as number] = setAt(copy[head as number], rest, next);
    return copy as T;
  }
  const record = (value ?? {}) as Record<string, unknown>;
  return { ...record, [head]: setAt(record[head as string], rest, next) } as T;
}

/** A blank item shaped like an existing one (strings emptied, arrays emptied). */
export function blankLike(template: unknown): unknown {
  if (typeof template === 'string') return '';
  if (Array.isArray(template)) return [];
  if (template && typeof template === 'object') {
    return Object.fromEntries(Object.entries(template).map(([key, child]) => [key, blankLike(child)]));
  }
  return template;
}
