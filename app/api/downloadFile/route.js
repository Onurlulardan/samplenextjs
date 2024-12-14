import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const getMimeType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    pdf: 'application/pdf',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json(
      { message: 'Geçersiz istek: fileName parametresi eksik.' },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ message: 'Dosya bulunamadı.' }, { status: 404 });
  }

  try {
    const contentType = getMimeType(fileName);

    // File read stream
    const fileStream = fs.createReadStream(filePath);

    return new Response(fileStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Dosya gönderilirken hata oluştu:', error);
    return NextResponse.json(
      { message: 'Dosya gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
