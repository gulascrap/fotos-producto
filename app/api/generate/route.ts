import { NextRequest, NextResponse } from 'next/server';
import { generateProductImage } from '@/lib/gemini';
import { uploadImageToDrive, createDriveFolder } from '@/lib/drive';
import { buildPrompt, Style } from '@/lib/prompts';
import { getSession } from '@/lib/auth';

export const maxDuration = 300; // 5 minutes timeout for Vercel

export async function POST(request: NextRequest) {
  // Auth check
  const isAuth = await getSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const formData = await request.formData();
  const image = formData.get('image') as File;
  const stylesJson = formData.get('styles') as string;
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const productName = (formData.get('productName') as string) || 'producto';
  const userContext = (formData.get('context') as string) || '';

  if (!image) {
    return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 });
  }

  const selectedStyles: Style[] = JSON.parse(stylesJson || '["blanco"]');

  // Convert image to base64
  const imageBuffer = await image.arrayBuffer();
  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  const imageMimeType = image.type || 'image/jpeg';

  // Create a folder in Drive for this product
  const timestamp = new Date().toISOString().slice(0, 10);
  const folderName = `${productName} - ${timestamp}`;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

  let productFolderId: string;
  try {
    productFolderId = await createDriveFolder(folderName, folderId);
  } catch (err) {
    console.error('Error creating Drive folder:', err);
    productFolderId = folderId; // fallback to root folder
  }

  const results: Array<{
    style: Style;
    styleLabel: string;
    driveLink: string;
    downloadLink: string;
    index: number;
    error?: string;
  }> = [];

  // Generate images for each style × quantity
  for (const style of selectedStyles) {
    for (let i = 1; i <= quantity; i++) {
      try {
        const prompt = buildPrompt(style, userContext);
        const generatedBase64 = await generateProductImage(imageBase64, imageMimeType, prompt);

        // Upload to Drive
        const fileName = `${productName}_${style}_v${i}.jpg`;
        const driveFile = await uploadImageToDrive(generatedBase64, fileName, productFolderId);

        results.push({
          style,
          styleLabel: style,
          driveLink: driveFile.webViewLink,
          downloadLink: driveFile.webContentLink,
          index: i,
        });
      } catch (err) {
        console.error(`Error generating ${style} v${i}:`, err);
        results.push({
          style,
          styleLabel: style,
          driveLink: '',
          downloadLink: '',
          index: i,
          error: err instanceof Error ? err.message : 'Error desconocido',
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    folderLink: `https://drive.google.com/drive/folders/${productFolderId}`,
    results,
  });
}
