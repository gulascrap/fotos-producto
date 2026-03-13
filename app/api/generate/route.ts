import { NextRequest, NextResponse } from 'next/server';
import { buildPrompt, Style } from '@/lib/prompts';
import { getSession } from '@/lib/auth';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await request.formData();
  const image = formData.get('image') as File;
  const style = formData.get('style') as Style;
  const index = parseInt(formData.get('index') as string) || 1;
  const productName = (formData.get('productName') as string) || '';

  if (!image) return NextResponse.json({ error: 'No se recibió imagen' }, { status: 400 });

  const imageBuffer = await image.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  const imageMimeType = image.type || 'image/jpeg';
  const prompt = buildPrompt(style, '');

  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-max/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: {
        prompt,
        input_image: `data:${imageMimeType};base64,${imageBase64}`,
        output_format: 'jpg',
        output_quality: 90,
        aspect_ratio: '9:16',
      }
    })
  });

  const prediction = await createRes.json();
  if (!prediction.id) return NextResponse.json({ error: prediction.error || prediction.detail || JSON.stringify(prediction) }, { status: 500 });

  for (let i = 0; i < 55; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const poll = await (await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}` }
    })).json();
    if (poll.status === 'succeeded') {
      const imageUrl = Array.isArray(poll.output) ? poll.output[0] : poll.output;
      const imgRes = await fetch(imageUrl);
      const buffer = await imgRes.arrayBuffer();
      const baseName = productName || image.name.replace(/\.[^.]+$/, '');
      return NextResponse.json({
        success: true,
        imageBase64: Buffer.from(buffer).toString('base64'),
        fileName: `${baseName}_${style}_v${index}.jpg`,
        style,
        index
      });
    }
    if (poll.status === 'failed') return NextResponse.json({ error: poll.error || 'Falló' }, { status: 500 });
  }
  return NextResponse.json({ error: 'Timeout' }, { status: 500 });
}
