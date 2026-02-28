export type Style = 'blanco' | 'lifestyle' | 'flatlay' | 'manos';

export const STYLES: Record<Style, { label: string; emoji: string; description: string }> = {
  blanco: {
    label: 'Fondo Blanco',
    emoji: '⬜',
    description: 'Fondo neutro, ideal para tienda online',
  },
  lifestyle: {
    label: 'Lifestyle Hogareño',
    emoji: '🏠',
    description: 'Ambiente hogareño cálido y aspiracional',
  },
  flatlay: {
    label: 'Flat Lay Cenital',
    emoji: '📐',
    description: 'Vista desde arriba, estilo Pinterest',
  },
  manos: {
    label: 'En Manos (POV)',
    emoji: '🤲',
    description: 'Producto siendo usado, sensación real',
  },
};

export function buildPrompt(style: Style, userContext?: string): string {
  const base = userContext ? `Context about this product: ${userContext}. ` : '';

  const prompts: Record<Style, string> = {
    blanco: `${base}Professional product photography on a pure white background. Perfect studio lighting with soft shadows. The product is centered and sharp. Clean, minimal, e-commerce ready. Shot with a high-end camera lens. No props, no distractions. The product fills 70% of the frame. Photorealistic, commercial quality.`,

    lifestyle: `${base}Lifestyle product photography in a warm, modern Argentine home. Cozy interior with natural light coming through a window. Scandinavian-Nordic aesthetic meets South American warmth. The product is naturally placed in a real home environment. Soft bokeh background. Aspirational yet authentic. Shot on a mirrorless camera. Instagram and Pinterest ready.`,

    flatlay: `${base}Flat lay product photography shot from directly above (bird's eye view / overhead). The product is centered on a clean surface — marble, light wood, or linen texture. Minimal complementary props arranged artfully around it. Balanced composition. Beautiful natural light with soft shadows. Editorial Pinterest aesthetic. Commercial photography quality.`,

    manos: `${base}POV product photography — the product being held by elegant hands with natural skin tones. Anonymous model, only hands visible, cropped frame. The product is the hero. Casual lifestyle setting, soft natural morning light. Authentic, relatable, UGC-style but polished. Vertical orientation 9:16 for social media. The hands interact naturally with the product.`,
  };

  return prompts[style];
}
