export async function generateProductImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  
  const response = await fetch(
    `https://us-central1-aiplatform.googleapis.com/v1/projects/fotos-producto/locations/us-central1/publishers/google/models/imagen-3.0-capability-001:predict`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          prompt: `Professional product photography. ${prompt}`,
          referenceImages: [{
            referenceType: 'SUBJECT_REFERENCE',
            referenceId: 1,
            referenceImage: { bytesBase64Encoded: imageBase64 },
            subjectImageConfig: { subjectType: 'PRODUCT' }
          }]
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          mode: 'EDIT',
          editConfig: { editMode: 'PRODUCT_IMAGE' }
        }
      })
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Error en Imagen 3');
  }

  const imageBytes = data.predictions?.[0]?.bytesBase64Encoded;
  if (!imageBytes) throw new Error('Imagen 3 no generó ninguna imagen');
  return imageBytes;
}
