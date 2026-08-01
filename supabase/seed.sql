-- Placeholder catalogue for Phase 2 development/demo. Replace with real
-- products once the catalogue is ready — nothing here is real content.

insert into public.products
  (slug, title, description, category, price_xof, price_eur, status)
values
  (
    'pack-templates-instagram-premium',
    'Pack Templates Instagram Premium',
    '40 templates éditables pour poser une identité visuelle cohérente sur Instagram en un après-midi.',
    'Templates',
    15000,
    23,
    'published'
  ),
  (
    'formation-freelance-facturation',
    'Formation — Se lancer en freelance',
    'Un parcours complet pour structurer son activité freelance : statut, tarification, premiers clients.',
    'Formations',
    35000,
    53,
    'published'
  ),
  (
    'presets-lightroom-portrait',
    'Presets Lightroom — Portrait éditorial',
    '12 presets pensés pour la peau et la lumière naturelle, testés sur plusieurs carnations.',
    'Presets',
    10000,
    15,
    'published'
  ),
  (
    'kit-identite-visuelle-boutique',
    'Kit identité visuelle boutique en ligne',
    'Logo, palette, typographies et gabarits réseaux sociaux livrés prêts à l’emploi.',
    'Templates',
    45000,
    69,
    'published'
  ),
  (
    'ebook-copywriting-vente',
    'Ebook — Écrire pour vendre',
    'Les mécaniques de copywriting qui font vendre une page produit, expliquées avec des exemples réels.',
    'Formations',
    8000,
    12,
    'published'
  );
