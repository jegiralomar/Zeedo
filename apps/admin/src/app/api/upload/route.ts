import { NextResponse } from 'next/server';
import { uploadMedia, testR2Connection } from '@/lib/storage';

export async function GET() {
  try {
    const status = await testR2Connection();
    return NextResponse.json({
      success: true,
      service: 'Cloudflare R2 Media Storage',
      status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check storage status' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Guard: must be multipart/form-data, not raw JSON
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data with a "file" field. Send a FormData body.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'products';
    const folder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'products';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    // Max 15MB file size limit
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 15MB' },
        { status: 400 }
      );
    }

    // MIME type whitelist
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'image/heic',
      'image/heif',
      'application/pdf',
    ];
    const mime = file.type?.toLowerCase() || 'image/webp';
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { success: false, error: `Disallowed file type: ${mime}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, {
      filename: file.name,
      contentType: mime,
      folder,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      provider: result.provider,
      sizeBytes: result.sizeBytes || file.size,
    });
  } catch (error: any) {
    console.error('Upload handling error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
