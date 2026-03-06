export async function generateProductImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: `Professional product photography. ${prompt}` }],
        parameters: { sampleCount: 1, aspectRatio: '1:1' }
      })
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Error Imagen 3');
  
  const imageBytes = data.predictions?.[0]?.bytesBase64Encoded;
  if (!imageBytes) throw new Error('No se generó imagen');
  return imageBytes;
}
