import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateProductImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'imagen-3.0-capability-001' });

  // @ts-ignore
  const result = await model.generateImages({
    prompt: `Professional product photography. ${prompt}`,
    numberOfImages: 1,
    aspectRatio: '1:1',
    personGeneration: 'dont_allow',
    referenceImages: [{
      referenceType: 'REFERENCE_TYPE_SUBJECT',
      referenceId: 1,
      referenceImage: {
        imageBytes: imageBase64,
        mimeType: imageMimeType,
      }
    }]
  });

  const imageBytes = result?.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) throw new Error('Imagen 3 no generó ninguna imagen');
  return imageBytes;
}
