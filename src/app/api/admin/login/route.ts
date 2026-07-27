import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSecretOrNull,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/source-control/auth';

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          'Admin is not configured. Set ADMIN_SECRET (min 8 chars) in the environment.',
      },
      { status: 503 },
    );
  }

  let password = '';
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const secret = getAdminSecretOrNull()!;
  const token = createAdminSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
