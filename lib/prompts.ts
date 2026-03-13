export type Style = 'blanco' | 'lifestyle' | 'flatlay' | 'manos';

export const STYLES: Record<Style, { label: string; emoji: string; description: string }> = {
  blanco: { label: 'Fondo Blanco', emoji: '⬜', description: 'Fondo neutro, ideal para tienda online' },
  lifestyle: { label: 'Lifestyle Hogareño', emoji: '🏠', description: 'Ambiente hogareño cálido y aspiracional' },
  flatlay: { label: 'Flat Lay Cenital', emoji: '📐', description: 'Vista desde arriba, estilo Pinterest' },
  manos: { label: 'En Manos (POV)', emoji: '🤲', description: 'Producto siendo usado, sensación real' },
};

export function buildPrompt(style: Style, userContext?: string): string {
  const base = userContext ? `Product: ${userContext}. ` : '';
  const prompts: Record<Style, string> = {
    blanco: `${base}Replace ONLY the background with a pure white background. Keep the product EXACTLY as it is — same shape, same proportions, same colors, same textures, same details. Do NOT distort, stretch, or alter the product in any way. Remove any price tags, stickers, barcodes, or text labels. The product is the absolute center and hero of the image. Professional studio lighting with a soft, elegant shadow beneath the product that adds depth. Clean, sharp, flawless composition. Looks like it was taken by a top commercial photographer in a professional studio. Polished, pristine, and ready for a high-end e-commerce catalog.`,
    lifestyle: `${base}Place this product in a warm modern Argentine home. Keep the product EXACTLY as it is — same shape, same colors, same details, no distortion. Cozy interior with natural light from a window. Scandinavian-Nordic aesthetic. Product naturally placed in a real home environment. Soft bokeh background. Aspirational yet authentic. Instagram and Pinterest ready.`,
    flatlay: `${base}Place this product in a flat lay composition shot from directly above. Keep the product EXACTLY as it is — same shape, same colors, same details, no distortion. Product centered on a clean marble or light linen surface. Minimal complementary props arranged artfully. Beautiful natural light. Editorial Pinterest aesthetic.`,
    manos: `${base}Show this product being held by elegant hands, POV style. Keep the product EXACTLY as it is — same shape, same colors, same details, no distortion. Only hands visible, cropped frame. Soft natural morning light. Authentic and polished. Vertical 9:16 for social media.`,
  };
  return prompts[style];
}
