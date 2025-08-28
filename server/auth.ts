import crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

function base64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function unbase64url(input: string): Buffer {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input + pad, 'base64');
}

export function signJwt(payload: JwtPayload, opts?: { expiresInSec?: number }): string {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) throw new Error('JWT_SECRET must be set');

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body: JwtPayload = { ...payload, iat: now };
  if (opts?.expiresInSec) body.exp = now + opts.expiresInSec;

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest();

  return `${encodedHeader}.${encodedBody}.${base64url(signature)}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET || '';
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedBody, signature] = parts;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest();
  const provided = unbase64url(signature);
  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(unbase64url(encodedBody).toString('utf8')) as JwtPayload;
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

