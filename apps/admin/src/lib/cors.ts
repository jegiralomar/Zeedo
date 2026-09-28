import { NextResponse } from 'next/server';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
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
      ...corsHeaders,
      ...(init?.headers || {}),
    },
  });
}
