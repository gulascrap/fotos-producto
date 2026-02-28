import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-this');

export async function createSession() {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  return token;
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return false;
  return verifySession(token);
}
