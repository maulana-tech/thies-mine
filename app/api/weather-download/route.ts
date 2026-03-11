import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = join('/Users/em/web/thies-mining/data/weather_outputs', filename);

    // Check if file exists
    const fs = await import('fs/promises');
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Create read stream
    const stream = createReadStream(filePath);

    // Get file stats for content length
    const stats = await fs.stat(filePath);

    // Determine content type
    const contentType = filename.endsWith('.html') ? 'text/html' : 
                       filename.endsWith('.pdf') ? 'application/pdf' :
                       'application/octet-stream';

    // Return file as stream
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
