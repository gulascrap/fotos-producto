import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const url = request.nextUrl.searchParams.get('url');
  const fileName = request.nextUrl.searchParams.get('fileName') || 'imagen.jpg';
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    }
  });
}
