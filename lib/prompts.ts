export type Style = 'blanco' | 'cocina_uso' | 'cocina_ambiente' | 'living_uso' | 'living_ambiente' | 'bano_uso' | 'bano_ambiente' | 'exterior';

export const STYLES: Record<Style, { label: string; emoji: string; description: string }> = {
  blanco: { label: 'Fondo Blanco', emoji: '⬜', description: 'Fondo neutro para catálogo' },
  cocina_uso: { label: 'Cocina — En Uso', emoji: '☕', description: 'Producto en uso en cocina' },
  cocina_ambiente: { label: 'Cocina — Ambiente', emoji: '🍳', description: 'Producto apoyado en cocina' },
  living_uso: { label: 'Living — En Uso', emoji: '🛋️', description: 'Producto en uso en living' },
  living_ambiente: { label: 'Living — Ambiente', emoji: '🪴', description: 'Producto apoyado en living' },
  bano_uso: { label: 'Baño — En Uso', emoji: '🪥', description: 'Producto en uso en baño' },
  bano_ambiente: { label: 'Baño — Ambiente', emoji: '🧴', description: 'Producto apoyado en baño' },
  exterior: { label: 'Exterior', emoji: '🌿', description: 'Producto en terraza o jardín' },
};

export function buildPrompt(style: Style, userContext?: string): string {
  const base = userContext ? `Product: ${userContext}. ` : '';
  const keep = `The product is EXACTLY as shown in the reference image — same shape, same colors, same proportions, same quantity of items. Do not distort or alter the product.`;
  const nordic = `Nordic minimalist aesthetic. Muted warm tones. Clean composition. No clutter. Shot on a mirrorless camera with shallow depth of field. Looks like a high-end Scandinavian lifestyle brand.`;

  const prompts: Record<Style, string> = {
    blanco: `${base}Professional e-commerce product photography on a pure white background. ${keep} Remove any price tags, stickers, or labels. If the product is a mirror, replace the reflection with a soft white gradient. 45-degree studio lighting with a soft shadow beneath. Product centered filling 70% of the frame. Shot by a top commercial photographer. Clean, sharp, catalog ready.`,

    cocina_uso: `${base}Nordic lifestyle kitchen photography. The product is being actively used in a real kitchen moment — if it's a container, it's filled with relevant contents (coffee beans, spices, grains). If it's a cup or mug, it contains a hot or cold drink. An elegant hand interacts naturally with the product. Light oak wood kitchen counter. Soft natural window light from the side. Clean white or warm grey kitchen background. One subtle prop (a small plant, linen cloth) in the blurred background. Product centered and the clear hero. ${keep} ${nordic}`,

    cocina_ambiente: `${base}Nordic lifestyle kitchen photography. The product sits naturally on a light oak wood kitchen counter, empty or closed, without hands. Soft natural window light from the side creating gentle shadows. Clean white or warm grey kitchen background. Minimal props — a folded linen cloth, a small ceramic bowl, or a sprig of herbs — arranged with intention but never competing with the product. Lots of negative space. Product centered and the clear hero. ${keep} ${nordic}`,

    living_uso: `${base}Nordic lifestyle living room photography. The product is being actively used in a real living room moment — if it's a container or decorative piece, it's styled with relevant contents or objects. An elegant hand interacts naturally with the product. Light wood surface or marble coffee table. Soft natural window light. Warm neutral living room background with a blurred sofa or bookshelf. Product centered and the clear hero. ${keep} ${nordic}`,

    living_ambiente: `${base}Nordic lifestyle living room photography. The product sits naturally on a light wood surface or marble coffee table, empty or closed, without hands. Soft natural window light. Warm neutral living room in the background — blurred sofa, bookshelves, or a plant. Product centered and the clear hero. Minimal props arranged with intention. ${keep} ${nordic}`,

    bano_uso: `${base}Nordic lifestyle bathroom photography. The product is being actively used in a real bathroom moment — if it's a container, organizer, or holder, it's filled with relevant contents (cotton balls, brushes, skincare products). An elegant hand interacts naturally with the product. White marble or light stone surface. Soft natural light. Clean white bathroom background. One subtle prop (a small plant, rolled white towel, soap bar). Product centered and the clear hero. ${keep} ${nordic}`,

    bano_ambiente: `${base}Nordic lifestyle bathroom photography. The product sits naturally on a white marble or light stone bathroom surface, styled but without hands. Soft natural light. Clean white bathroom background. Minimal props — a rolled white towel, a small plant, a bar of soap — arranged with intention. Product centered and the clear hero. ${keep} ${nordic}`,

    exterior: `${base}Nordic lifestyle outdoor photography. The product sits naturally on a wooden terrace table or outdoor stone surface surrounded by soft greenery. Warm natural daylight. Lush but minimal garden or terrace background softly blurred. Fresh, calm, airy atmosphere. Product centered and the clear hero. ${keep} ${nordic}`,
  };
  return prompts[style];
}
