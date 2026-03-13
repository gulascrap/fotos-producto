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
    blanco: `${base}Professional e-commerce product photography. Replace the background with pure white. Keep the product frame, shape, and materials EXACTLY as they are — same proportions, same colors, same quantity of items. If the product is a mirror or has a reflective surface, replace the reflection with a clean white or soft gradient reflection that looks natural and neutral — remove any people, hands, rooms, or objects from the reflection. If the product is a set of multiple items, keep ALL items exactly as shown. Remove any price tags, stickers, or text labels. Lighting at 45 degrees with soft shadows beneath the product for depth. The product is the absolute center and hero. Shot by a top commercial photographer. Clean, sharp, polished, e-commerce catalog ready.`,
    lifestyle: `${base}Place this product in a warm modern Argentine home. Keep the product EXACTLY as it is — same shape, same colors, same details, same quantity of items, no distortion. If the product has a reflective surface, show a natural home environment reflected. Cozy interior with natural light from a window. Scandinavian-Nordic aesthetic. Soft bokeh background. Aspirational yet authentic. Instagram and Pinterest ready.`,
    flatlay: `${base}Flat lay product photography shot from directly above. Keep the product EXACTLY as it is — same shape, same colors, same details, same quantity of items, no distortion. Product centered on a clean marble or light linen surface. Minimal complementary props arranged artfully. Beautiful natural light. Editorial Pinterest aesthetic.`,
    manos: `${base}POV product photography — product being held by elegant hands. Keep the product EXACTLY as it is — same shape, same colors, same details, same quantity of items, no distortion. Only hands visible, cropped frame. Soft natural morning light. Authentic and polished. Vertical 9:16 for social media.`,
  };
  return prompts[style];
}
