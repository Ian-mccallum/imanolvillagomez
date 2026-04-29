/**
 * Contact email is not shipped as a single plaintext literal.
 * Prefer `VITE_CONTACT_EMAIL` in `.env` so you can rotate without code changes.
 */
const _p: readonly [string, string] = ['aW1hbm9sVjIwQGljbG91', 'ZC5jb20='];

export function resolveContactEmailForReveal(): string {
  const fromEnv = import.meta.env.VITE_CONTACT_EMAIL?.trim();
  if (fromEnv) return fromEnv;
  try {
    return atob(_p[0] + _p[1]);
  } catch {
    return '';
  }
}
