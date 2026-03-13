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
    blanco: `${base}Professional e-commerce product photography on a pure white background. CRITICAL: Count the exact number of objects in the original image and keep ALL of them — do not remove, merge, or reduce the number of items. Keep every single item visible. Keep the product EXACTLY as it is — same shape, same proportions, same colors, same textures. If the product is a mirror or has a reflective surface, replace the reflection with a soft neutral white gradient — remove any people, rooms, or objects from the reflection. Remove any price tags, stickers, acrylic display stands, or text labels. 45-degree studio lighting with a soft elegant shadow beneath the product for depth. The product is the absolute center and hero of the image. Shot by a top commercial photographer. Clean, sharp, polished, e-commerce catalog ready.`,
    lifestyle: `${base}Place this product in a warm modern Argentine home. CRITICAL: Keep ALL items from the original image — same quantity, same arrangement. Keep the product EXACTLY as it is — same shape, same colors, same details, no distortion. If the product has a reflective surface, show a natural home environment reflected. Cozy interior with natural light from a window. Scandinavian-Nordic aesthetic. Soft bokeh background. Aspirational yet authentic. Instagram and Pinterest ready.`,
    flatlay: `${base}Flat lay product photography shot from directly above. CRITICAL: Keep ALL items from the original image — same quantity, same arrangement. Keep the product EXACTLY as it is — same shape, same colors, same details, no distortion. Product centered on a clean marble or light linen surface. Minimal complementary props arranged artfully. Beautiful natural light. Editorial Pinterest aesthetic.`,
    manos: `${base}POV product photography — product being held by elegant hands. CRITICAL: Keep ALL items from the original image — same quantity. Keep the product EXACTLY as it is — same shape, same colors, same details, no distortion. Only hands visible, cropped frame. Soft natural morning light. Authentic and polished. Vertical 9:16 for social media.`,
  };
  return prompts[style];
}
