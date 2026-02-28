import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateProductImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp-image-generation' });

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { data: imageBase64, mimeType: imageMimeType as any } },
        { text: `Professional product photographer. Transform this product: ${prompt}. Keep the product EXACTLY as is, only change background. Output high-quality photorealistic image.` },
      ],
    }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as any,
  });

  for (const part of result.response.candidates?.[0]?.content?.parts || []) {
    if ((part as any).inlineData?.mimeType?.startsWith('image/')) {
      return (part as any).inlineData.data;
    }
  }
  throw new Error('No image generated');
}
