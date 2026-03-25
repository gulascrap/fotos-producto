export type Style = 'blanco' | 'lifestyle' | 'flatlay' | 'manos';

export const STYLES: Record<Style, { label: string; emoji: string; description: string }> = {
  blanco: { label: 'Fondo Blanco', emoji: '⬜', description: 'Fondo neutro, ideal para tienda online' },
  lifestyle: { label: 'Lifestyle Nórdico', emoji: '🏠', description: 'Ambiente minimalista con luz natural' },
  flatlay: { label: 'Flat Lay Cenital', emoji: '📐', description: 'Vista desde arriba, estilo Pinterest' },
  manos: { label: 'En Uso (POV)', emoji: '🤲', description: 'Producto siendo usado, sensación real' },
};

export function buildPrompt(style: Style, userContext?: string): string {
  const base = userContext ? `Product: ${userContext}. ` : '';
  const prompts: Record<Style, string> = {
    blanco: `${base}Professional e-commerce product photography on a pure white background. CRITICAL: Keep the product EXACTLY as it is — same shape, same proportions, same colors, same quantity of items. Do NOT distort or alter the product. If the product is a mirror, replace the reflection with a soft neutral white gradient. Remove any price tags, stickers, or labels. 45-degree studio lighting with a soft shadow beneath. Product centered and filling 70% of the frame. Shot by a top commercial photographer. Clean, sharp, catalog ready.`,
    lifestyle: `${base}Nordic minimalist lifestyle product photography. The product is centered and is the absolute hero of the image. Placed on a light oak wood surface. Soft natural window light coming from the side creating gentle shadows. Clean white or warm grey wall in the background. One small potted green plant softly blurred in the background as a subtle prop. Calm, serene, sophisticated atmosphere. No clutter. Muted warm tones. Shot on a mirrorless camera with a 50mm lens. Shallow depth of field. The product is EXACTLY as in the reference image — same shape, same colors, same quantity of items. Looks like a high-end Scandinavian home goods catalog.`,
    flatlay: `${base}Nordic flat lay product photography shot from directly above. The product is centered on a clean light linen or white marble surface. Soft natural daylight. One or two minimal props (a sprig of eucalyptus, a small stone, a folded linen napkin) arranged with intention but never competing with the product. Lots of negative space. Clean, editorial, Pinterest-worthy. The product is EXACTLY as in the reference image — same shape, same colors, same quantity of items. Shot by a professional product photographer.`,
    manos: `${base}Nordic lifestyle product photography showing the product being used by elegant hands. A single hand interacts naturally with the product — touching, holding, or using it — as if in a real moment. Anonymous model, only hand and forearm visible. Light oak wood surface. Soft natural window light from the side. Clean neutral background. The product is centered and the clear hero. The product is EXACTLY as in the reference image — same shape, same colors. Authentic, calm, and polished. Looks like a high-end Scandinavian brand campaign.`,
  };
  return prompts[style];
}
