import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE = 'arb_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function getSecret(): string | null {
  const s = process.env.ADMIN_SECRET?.trim();
  return s && s.length >= 8 ? s : null;
}

export function isAdminConfigured(): boolean {
  return Boolean(getSecret());
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createAdminSessionToken(secret: string, now = Date.now()): string {
  const exp = now + SESSION_TTL_MS;
  const payload = `arb:${exp}`;
  return `${exp}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split('.');
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return false;
  const payload = `arb:${exp}`;
  const expected = sign(payload, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(secret);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token, secret);
}

export function getAdminSecretOrNull(): string | null {
  return getSecret();
}
