import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_ACCESS,
  AUTH_COOKIE_REFRESH,
  AUTH_COOKIE_TENANT,
} from '@/lib/auth/constants';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(AUTH_COOKIE_ACCESS);
  res.cookies.delete(AUTH_COOKIE_REFRESH);
  res.cookies.delete(AUTH_COOKIE_TENANT);
  return res;
}
