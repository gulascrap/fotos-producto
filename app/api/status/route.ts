import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 });
  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}` },
    cache: 'no-store',
  });
  const prediction = await res.json();
  if (prediction.status === 'succeeded') {
    const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    return NextResponse.json({ status: 'succeeded', imageUrl });
  }
  if (prediction.status === 'failed') {
    return NextResponse.json({ status: 'failed', error: prediction.error || 'Falló' });
  }
  return NextResponse.json({ status: prediction.status });
}
