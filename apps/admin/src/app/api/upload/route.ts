import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in form data' },
        { status: 400 }
      );
    }

    const filename = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    // If BLOB_READ_WRITE_TOKEN is configured in Vercel environment
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: 'public',
      });
      return NextResponse.json({
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        source: 'vercel_blob',
      });
    }

    // Graceful fallback for local development or before token sync
    return NextResponse.json({
      success: true,
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
      filename,
      size: file.size,
      source: 'local_simulation',
      note: 'Connect BLOB_READ_WRITE_TOKEN from Vercel dashboard to persist directly to zeedo-storage.',
    });
  } catch (error: any) {
    console.error('Upload handling error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'File upload failed' },
      { status: 500 }
    );
  }
}
