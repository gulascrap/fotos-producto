export async function generateProductImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string
): Promise<string> {
  const apiKey = process.env.REPLICATE_API_KEY!;
  const imageDataUrl = `data:${imageMimeType};base64,${imageBase64}`;

  const createRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Prefer': 'wait=60' },
    body: JSON.stringify({
      input: {
        prompt: `Professional product photography. ${prompt}. Keep the product exactly as it appears in the reference image, same colors, same design, same shape.`,
        input_image: imageDataUrl,
        output_format: 'jpg',
        output_quality: 90,
        aspect_ratio: '9:16',
      }
    })
  });

  const prediction = await createRes.json();
  if (prediction.error) throw new Error(prediction.error);

  let output = prediction.output;
  if (!output) {
    const id = prediction.id;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const poll = await pollRes.json();
      if (poll.status === 'succeeded') { output = poll.output; break; }
      if (poll.status === 'failed') throw new Error(poll.error || 'Flux Kontext falló');
    }
  }

  if (!output) throw new Error('Timeout generando imagen');
  const imageUrl = Array.isArray(output) ? output[0] : output;
  const imgRes = await fetch(imageUrl);
  const buffer = await imgRes.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}
