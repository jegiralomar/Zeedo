import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { auctionId: string } }
) {
  const { auctionId } = params;
  return NextResponse.redirect(new URL(`/logistics/${auctionId}`, request.url));
}
