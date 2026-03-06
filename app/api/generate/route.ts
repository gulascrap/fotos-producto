import { NextRequest, NextResponse } from 'next/server';
import { generateProductImage } from '@/lib/gemini';
import { buildPrompt, Style } from '@/lib/prompts';
import { getSession } from '@/lib/auth';

export const maxDuration = 60;

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

  try {
    const generatedBase64 = await generateProductImage(imageBase64, imageMimeType, prompt);
    const baseName = productName || image.name.replace(/\.[^.]+$/, '');
    return NextResponse.json({
      success: true,
      imageBase64: generatedBase64,
      fileName: `${baseName}_${style}_v${index}.jpg`,
      style,
      index
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
