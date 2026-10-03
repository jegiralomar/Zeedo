import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = false;

let cachedHtml: string | null = null;

function getLandingHtml(): string {
  if (!cachedHtml) {
    const filePath = path.join(process.cwd(), 'public', 'index.html');
    if (fs.existsSync(filePath)) {
      cachedHtml = fs.readFileSync(filePath, 'utf8');
    } else {
      cachedHtml = '<!DOCTYPE html><html><body><h1>ZEEDO Live Auctions</h1></body></html>';
    }
  }
  return cachedHtml;
}

export async function GET() {
  const html = getLandingHtml();
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
