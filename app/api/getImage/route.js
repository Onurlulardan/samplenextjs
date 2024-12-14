import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json(
      { message: 'Geçersiz istek, fileName parametresi eksik.' },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), fileName);

  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    return new Response(fileStream, {
      headers: { 'Content-Type': 'image/jpeg' },
    });
  } else {
    return NextResponse.json({ message: 'Resim bulunamadı' }, { status: 404 });
  }
}
