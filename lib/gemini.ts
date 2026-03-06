import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateProductImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { data: imageBase64, mimeType: imageMimeType } },
        { text: `Professional product photography. ${prompt}. Keep the product exactly as is, only change the background and lighting.` }
      ]
    }],
    config: { responseModalities: ['IMAGE', 'TEXT'] }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      return part.inlineData.data!;
    }
  }
  throw new Error('No se generó ninguna imagen');
}
