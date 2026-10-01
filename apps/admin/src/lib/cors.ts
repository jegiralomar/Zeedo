import { NextResponse, NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://zeedo.bid',
  'https://admin.zeedo.bid',
  'https://www.zeedo.bid',
];

// In development, also allow localhost and mobile dev bundler
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push(
    'http://localhost:3000',
    'http://admin.localhost:3000',
    'http://localhost:8081',
    'http://localhost:8082'
  );
}

function resolveOrigin(requestOrOrigin?: Request | string): string {
  if (!requestOrOrigin) return ALLOWED_ORIGINS[0];
  const origin = typeof requestOrOrigin === 'string'
    ? requestOrOrigin
    : requestOrOrigin.headers.get('origin') || '';
  if (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('exp://')
  ) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
}

export function corsHeaders(requestOrOrigin?: Request | string) {
  return {
    'Access-Control-Allow-Origin': resolveOrigin(requestOrOrigin),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCorsOptions(request?: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function safeParseJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    try {
      const text = await req.text();
      return JSON.parse(text);
    } catch {
      return {} as T;
    }
  }
}

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...corsHeaders(),
      ...(init?.headers || {}),
    },
  });
}
