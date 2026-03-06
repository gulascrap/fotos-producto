import { NextRequest, NextResponse } from 'next/server';
import { generateProductImage } from '@/lib/gemini';
import { buildPrompt, Style } from '@/lib/prompts';
import { getSession } from '@/lib/auth';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const isAuth = await getSession();
  if (!isAuth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await request.formData();
  const image = formData.get('image') as File;
  const stylesJson = formData.get('styles') as string;
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const productName = (formData.get('productName') as string) || '';
  const userContext = (formData.get('context') as string) || '';

  if (!image) return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 });

  const selectedStyles: Style[] = JSON.parse(stylesJson || '["blanco"]');
  const imageBuffer = await image.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  const imageMimeType = image.type || 'image/jpeg';

  const results: Array<{ style: Style; imageBase64: string; index: number; error?: string; fileName: string }> = [];

  for (const style of selectedStyles) {
    for (let i = 1; i <= quantity; i++) {
      try {
        const prompt = buildPrompt(style, userContext);
        const generatedBase64 = await generateProductImage(imageBase64, imageMimeType, prompt);
        const baseName = productName || image.name.replace(/\.[^.]+$/, '');
        results.push({ style, imageBase64: generatedBase64, index: i, fileName: `${baseName}_${style}_v${i}.jpg` });
      } catch (err) {
        results.push({ style, imageBase64: '', index: i, fileName: '', error: err instanceof Error ? err.message : 'Error' });
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
