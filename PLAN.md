# Winora — plan du projet

Winora est une boutique premium de produits digitaux pour l'Afrique
francophone : catalogue géré en interne (pas un marketplace ouvert),
abonnements et achats à l'unité, positionnement haut de gamme plutôt que
"supermarché de designs". L'objectif est de dépasser nettement le
concurrent de référence sur l'identité visuelle, les moyens de paiement
réellement adaptés au marché local, et les mécaniques d'urgence — tout en
restant honnête (pas de faux compte à rebours, pas de fausse preuve
sociale).

Stack : Next.js + Supabase (données, auth, stockage, fonctions) + Vercel
(hébergement) + Moneroo (paiement).

---

## 1. Le concurrent — Rafly (webvente.com/fr)

Rafly vend l'accès à un catalogue de designs par abonnement à trois
paliers (23 €/mois, 100 €/3 mois, 230 €/3 mois), plus achat à l'unité. Son
seul levier d'urgence est un "produit mystère" qui change chaque semaine.
Palette bleu/blanc générique de SaaS occidental. Prix affichés en euros
avec conversion XOF en second plan, aucun moyen de paiement mobile money
visible en page d'accueil. Preuve sociale : "150+ revendeurs satisfaits",
témoignages nommés avec photos.

Structure de la page d'accueil : header (Tarifs, Affiliation, Produit
Mystère, Support, À propos, Panier) → hero → 3 piliers → catalogue → "Produit
Mystère" → 3 forfaits → équipe de designers → avis clients → FAQ (10
questions) → footer avec newsletter.

**Angle mort identifié** : aucun mobile money en page d'accueil (Orange
Money, MTN, Wave...) alors que la cible est clairement l'Afrique de
l'Ouest francophone — c'est l'ouverture la plus nette pour Winora.

**Sur les animations vidéo** : une analyse du HTML brut de la page
d'accueil (extraction statique, sans exécution JS ni inspection
DevTools/réseau) n'y a trouvé aucune vidéo ni librairie d'animation
(Lottie, GSAP, Framer Motion, AOS, Three.js, iframe YouTube/Vimeo).
L'effet "motion design" remarqué vient probablement des publicités
(Facebook/TikTok, réels) qui amènent le trafic, pas du site lui-même — ou
d'une autre page non explorée. Si un lien exact ou une capture de
l'animation en question est fourni, l'outil utilisé pourra être identifié
précisément ; en attendant, la section 3.3 donne le kit standard pour
produire ce type d'effet nous-mêmes, en mieux.

---

## 2. Positionnement

Boutique premium, pas un supermarché : rareté organisée, esthétique haut
de gamme, urgence honnête (vraie date limite en base, jamais un compte à
rebours qui se relance à chaque visite — même règle que sur l'autre projet
du studio, voir [[page-secrets-conjugale-decisions]]).

Catalogue **mono-marque géré en interne** : Winora + une petite équipe de
designers produisent ou sélectionnent les produits, pas de marketplace
ouvert où n'importe qui s'inscrit pour vendre. Le modèle de données reste
conçu pour pouvoir ouvrir à des vendeurs tiers plus tard sans tout écrire
(`vendor_id` nullable, table `vendors` prête mais inutilisée en phase 1).

---

## 3. Identité de marque

Le logo Winora existe déjà (monogramme "W" en chevrons, or sur fond
marine profond) — la direction artistique part de cette identité plutôt
que d'en inventer une nouvelle.

### 3.1 Palette

Valeurs estimées visuellement depuis le logo (`logo.png`, `winora.jpg`) —
à remplacer par les codes exacts si un fichier de charte graphique
(Figma, Illustrator, PDF) existe ; sinon ces estimations suffisent pour
démarrer et seront ajustables à l'œil en développement.

| Rôle | Thème sombre (défaut) | Thème clair |
|---|---|---|
| Fond — marine Winora | `#0D1B2E` | `#F7F4EC` ivoire papier |
| Fond surélevé (cartes) | `#152540` | `#FFFFFF` |
| Texte | `#F4EDE4` ivoire | `#16202E` encre marine |
| Texte atténué | `#AEB9C7` | `#5C6470` |
| Accent primaire — or Winora | `#C99A5B` | `#A87F2E` |
| Accent urgence — braise | `#E4572E` | `#C43E1C` |
| Accent secondaire — émeraude (confiance/vérifié) | `#1F5C4E` | `#1B4B3F` |

La braise sert uniquement à l'urgence (comptes à rebours, CTA limités),
jamais au décor. L'émeraude sert uniquement aux marqueurs de confiance
(badge "achat vérifié", paiement sécurisé).

### 3.2 Typographie

- Titres : serif éditorial (empilement système — `Iowan Old Style`,
  `Palatino Linotype`, `Georgia`) pour un ton "maison premium", pas
  "startup".
- Corps de texte : sans-serif système (`-apple-system`, `Segoe UI`,
  Roboto) pour la lisibilité et la vitesse — pas de webfont externe à
  charger.
- Chiffres (prix, compte à rebours) : `font-variant-numeric: tabular-nums`
  pour un alignement propre en colonnes.

### 3.3 Motion design

Trois couches, du plus simple au plus produit :

1. **Micro-interactions UI** — Framer Motion (React, s'intègre nativement
   à Next.js) pour les révélations au scroll, transitions de page, hover
   sur les cartes produit. C'est ce qui donne l'impression de "fini" sans
   effort de production vidéo.
2. **Icônes/illustrations animées légères** — Lottie (fichiers JSON
   vectoriels exportés depuis After Effects via le plugin Bodymovin, ou
   trouvés/achetés tout faits sur LottieFiles). Léger, net sur tous les
   écrans, pas de fichier vidéo à streamer.
3. **Vidéos promotionnelles / preview produit** :
   - **Manuelle** : After Effects ou CapCut, export en boucle mp4/webm
     courte (3-6 s, <3 Mo, muette, autoplay en fond de hero).
   - **Générée automatiquement (différenciant fort)** : **Remotion**
     (bibliothèque React qui rend des vidéos programmatiquement). Un
     template créé une fois permet de générer automatiquement une vidéo
     de présentation pour chaque nouveau produit ajouté au catalogue
     (mockup animé + prix + logo), déclenché depuis l'admin — un vrai
     différenciateur face à Rafly, qui n'a apparemment que des images
     statiques.
   - Hébergement/diffusion : Cloudflare Stream ou Mux si les vidéos sont
     nombreuses/longues (streaming adaptatif) ; sinon un simple mp4 servi
     depuis Supabase Storage ou Vercel suffit pour des boucles courtes.

---

## 4. Fonctionnalités

### 4.1 Parité avec le concurrent (couverture minimum)

- Catalogue produits avec fiches détaillées
- Abonnements à paliers (accès à X produits/mois)
- Achat à l'unité
- "Produit du moment" en rotation périodique avec échéance visible
- Avis clients
- FAQ
- Espace "Mon compte" (achats, factures, téléchargements)
- Multi-devise (XOF/EUR au minimum, + XAF/GHS/NGN/USD si pertinent)

### 4.2 Différenciateurs

- **Paiement mobile money multi-pays natif via Moneroo** (Orange Money,
  MTN MoMo, Wave, Moov, M-Pesa selon le pays...) en plus de la carte et,
  si souhaité, une option crypto — voir section 7.
- **Notifications WhatsApp** (confirmation de commande, rappel de panier
  abandonné, alerte "produit mystère révélé dans 1h") — canal dominant en
  Afrique, plus efficace qu'un email qu'on n'ouvre pas.
- **Vidéo de présentation générée automatiquement par produit** (Remotion,
  voir 3.3).
- **Programme d'affiliation avec suivi temps réel et paiement des
  commissions en mobile money** — Moneroo a aussi un volet
  transferts/payouts, un seul prestataire pour encaisser ET reverser.
- **Bundle builder** — l'utilisateur compose son propre pack de produits
  à prix dégressif, plutôt que des paliers figés.
- **Compte à rebours honnête** — une vraie date de fin d'offre stockée en
  base, jamais un timer qui se relance à chaque visite.
- **Preuve sociale en temps réel** — "X personnes ont acheté ce produit
  aujourd'hui" calculé en direct via Supabase Realtime sur la table des
  commandes, données réelles, jamais simulées.
- **Badge "vérifié"** sur les avis provenant d'un achat confirmé.
- **Contenu localisé par pays** (devise, moyens de paiement mis en avant,
  témoignages) détecté par géolocalisation IP côté edge.

---

## 5. Espace admin

- Tableau de bord : chiffre d'affaires, abonnés actifs, churn, produits
  les plus vendus, taux de conversion du tunnel.
- CRUD produits (fichiers, versions, image de couverture, déclenchement
  de la génération vidéo Remotion).
- Gestion des commandes et remboursements.
- Gestion des abonnements et paliers.
- Planification du "produit du moment" (calendrier de rotation).
- Gestion des affiliés (validation, statistiques, déclenchement des
  paiements).
- Codes promo / ventes flash.
- Gestion des utilisateurs et rôles (client, support, admin — vendeur si
  le catalogue s'ouvre un jour à des tiers).
- Modération des avis.
- Blocs de contenu du site pilotés par la base (bannières d'urgence,
  textes de la page d'accueil) pour changer le discours sans redéployer.
- Journal d'audit des actions admin.

---

## 6. Architecture technique

- **Frontend** : Next.js (App Router) + TypeScript + Tailwind CSS +
  shadcn/ui pour aller vite sur l'admin.
- **Backend/données** : Supabase — Postgres avec Row Level Security, Auth
  (email/mot de passe + lien magique + Google), Storage (bucket privé
  pour les fichiers vendus, bucket public pour les assets marketing),
  Edge Functions (webhooks paiement, notifications, tâches planifiées),
  Realtime (compteurs live).
- **Hébergement** : Vercel — déploiement du frontend, Edge Middleware
  pour la détection pays/devise, Vercel Cron (ou pg_cron côté Supabase)
  pour les tâches planifiées (rotation produit mystère, synchro taux de
  change, relances panier abandonné).
- **Paiement** : Moneroo — voir section 7.
- **Email transactionnel** : Resend.
- **WhatsApp** : WhatsApp Business Cloud API (Meta) ou un fournisseur
  comme 360dialog/Twilio.
- **Analytics** : PostHog (funnels, comportement) + Vercel Analytics
  (performance).
- **Vidéo** : Remotion (génération), Cloudflare Stream ou Mux (diffusion
  si besoin de streaming adaptatif).
- **Tests** : Playwright sur le tunnel d'achat critique, déploiements de
  prévisualisation Vercel par pull request.

---

## 7. Paiement — Moneroo

Moneroo (moneroo.io) est un agrégateur de paiement pour l'Afrique — il
agrège lui-même Flutterwave, Paystack, Stripe et d'autres passerelles
derrière une seule intégration.

**Couverture** (page /coverage) : mobile money par pays — Orange Money,
MTN MoMo, Moov Money, Wave (UEMOA/CFA), M-Pesa (Kenya), MTN/Airtel
(Nigeria, Ouganda, Rwanda, Zambie...) — plus cartes Visa/Mastercard
partout, virement bancaire/USSD au Nigeria, et une option "Crypto (EUR,
USD)" déjà proposée par Moneroo lui-même si une option crypto est
souhaitée un jour.

**Tarification affichée** : 0,01 $ par transaction de paiement, 150
transactions gratuites/mois ; 0,01 $ par transfert (payout), 100
gratuits/mois ; remises à partir de 50 000 transactions/mois. Pas de
frais d'abonnement mensuel affiché. Frais de retrait et conditions KYC
marchand non publiés — à récupérer à l'inscription.

**Intégration technique (flux standard)** :
1. Le backend appelle `POST /v1/payments/initialize` avec montant, devise,
   infos client, `return_url`.
2. Moneroo répond avec une `checkout_url` : le client y est redirigé
   (interface de paiement hébergée par Moneroo, pas besoin de gérer
   nous-mêmes chaque opérateur).
3. Après paiement, Moneroo redirige vers `return_url` avec un statut, et
   envoie un webhook si activé — **ne jamais valider une commande sur le
   seul retour navigateur, toujours confirmer côté serveur** (webhook
   signé + appel de vérification de transaction) avant de livrer le
   fichier.
4. SDK officiel disponible en PHP/Laravel ; SDK JavaScript "à venir" au
   moment de la vérification — pour Next.js/TypeScript, appel direct à
   l'API REST (fetch depuis un route handler serveur), pas de SDK Node à
   attendre.

Aucune infrastructure à gérer nous-mêmes (pas de serveur dédié) : Moneroo
est un service hébergé classique, comme CinetPay/Flutterwave/Stripe.

**Statut** : demande d'inscription marchande envoyée le 2026-08-01,
réponse en attente. Ça ne bloque pas le reste du projet — les phases 0 à
2 (marque, fondations, vitrine) peuvent avancer sans le compte actif ;
l'intégration réelle du checkout démarre en phase 3.

**À vérifier une fois le compte actif** : format exact du payload webhook
et de sa signature, pièces exactes demandées pour le KYC, délais de
règlement des fonds vers un compte bancaire/mobile money local, plafonds
de transaction, pays à activer en priorité parmi ceux couverts.

---

## 8. Modèle de données (esquisse)

```
profiles          (id, full_name, phone, country, role[customer|admin|support], ...)
vendors           (id, profile_id, display_name, payout_details, verified)   -- inutilisé tant que mono-marque
products          (id, vendor_id?, slug, title, description, category,
                    price_xof, price_eur, cover_image, preview_video_url,
                    status[draft|published|archived], is_mystery)
product_files     (id, product_id, storage_path, file_type, version, checksum)
plans             (id, name, price, billing_interval, product_quota)
subscriptions     (id, user_id, plan_id, status, current_period_end, provider_reference)
orders            (id, user_id, status, subtotal, discount, total, currency,
                    payment_provider, provider_reference)
order_items       (id, order_id, product_id, unit_price)
downloads         (id, order_item_id, signed_url_token, expires_at, download_count)
reviews           (id, product_id, user_id, rating, comment, is_verified_purchase, status)
affiliates        (id, profile_id, code, commission_rate, status)
affiliate_clicks  (id, affiliate_id, session_id, converted)
affiliate_payouts (id, affiliate_id, amount, status, paid_at)
discount_codes    (id, code, type[percent|fixed], value, max_uses, expires_at)
mystery_rotations (id, product_id, week_start, week_end, reveal_at)
exchange_rates    (currency_code, rate_to_xof, updated_at)
notifications_log (id, user_id, channel[email|whatsapp], template, status, sent_at)
admin_audit_log   (id, admin_id, action, entity, entity_id)
```

Règles RLS clés :
- `products` lisible publiquement seulement si `status = 'published'`.
- `product_files` jamais exposé directement au client : une Edge Function
  vérifie que l'utilisateur a bien une commande payée pour ce produit
  avant de générer une URL signée à courte durée de vie (~10 min).
- `orders`/`downloads` lisibles uniquement par leur propriétaire + admin.
- `reviews` : insertion autorisée seulement si l'utilisateur a une
  commande confirmée sur le produit concerné (→ badge "achat vérifié"
  garanti par construction, pas déclaratif).

---

## 9. Sécurité

- Vérification de signature sur tous les webhooks de paiement (Moneroo) ;
  ne jamais faire confiance au seul `return_url` navigateur pour valider
  une commande, toujours reconfirmer côté serveur.
- Rate limiting sur connexion et checkout.
- 2FA obligatoire pour les comptes admin.
- Clé `service_role` Supabase jamais exposée côté client, uniquement dans
  les Edge Functions/route handlers serveur.
- URLs de téléchargement signées, courte durée de vie, PDF filigranés
  avec l'email de l'acheteur si pertinent.
- Sauvegardes Postgres Point-in-Time Recovery activées.
- Pages légales dès le lancement : CGV, politique de remboursement,
  mentions légales, politique de confidentialité.

---

## 10. Conventions de développement

La charte du studio (`# Charte et Conventions de Développement.md`,
présente dans ce dossier) s'applique telle quelle à ce projet :

- Nommage : `camelCase` (variables/fonctions), `PascalCase`
  (classes/types/composants), `UPPER_SNAKE_CASE` (constantes),
  `kebab-case` (fichiers/dossiers). Code et messages de commit en anglais.
- KISS / DRY / YAGNI, fonctions courtes (~20-30 lignes), une
  responsabilité par fonction/classe.
- Architecture **par fonctionnalité** (feature-based), pas par type de
  fichier — un dossier `products/` avec son composant, son service et
  ses types, plutôt que `components/`, `services/`, `types/` séparés.
- Git : `main` stable, branches `feature/...` / `fix/...`, Conventional
  Commits (`feat:`, `fix:`, `docs:`...), jamais de push direct sur
  `main`, toute modification passe par une PR revue.
- Prettier + ESLint obligatoires, TypeScript strict, `any` banni sauf
  justification explicite.
- Toute fonctionnalité ou correction significative accompagnée de tests
  (unitaires/intégration/E2E) ; tests verts avant toute PR.
- Aucun secret dans le code (`.env` + gestionnaire de secrets), toute
  entrée utilisateur/externe traitée comme non fiable et validée.

Le skill `/refonte-ux` (installé globalement, à partir du guide UX du
studio présent dans ce dossier) s'applique en complément dès qu'on
retouche une interface déjà construite : diagnostiquer avant de
retoucher, respecter l'existant, ancrer chaque choix dans le sujet réel
plutôt qu'une tendance générique. Pertinent dès la phase 2 une fois les
premiers écrans posés, et pour toute itération future une fois le site en
ligne.

---

## 11. Feuille de route

| Phase | Contenu | Durée indicative |
|---|---|---|
| 0 — Cadrage | Wireframes, validation finale de la palette, préparation du contenu réel (textes, prix, catalogue de départ) | 1-2 semaines |
| 1 — Fondations | Repo Next.js, schéma Supabase + RLS, auth, design system Tailwind/shadcn, CI/CD Vercel | 1-2 semaines |
| 2 — Vitrine | Fiches produit, catalogue/filtres, panier, pages statiques, multi-devise | 2-3 semaines |
| 3 — Paiement & livraison | Intégration Moneroo (initialize + webhook + vérification serveur), téléchargements sécurisés, emails | 1-2 semaines |
| 4 — Admin | Dashboard, CRUD produits, commandes/remboursements, abonnements | 2 semaines |
| 5 — Croissance | Affiliation, codes promo, produit mystère + compte à rebours, avis, WhatsApp | 2-3 semaines |
| 6 — Motion design | Pipeline Remotion, animations Framer Motion/GSAP, vidéo hero | 1-2 semaines |
| 7 — QA & lancement | Tests e2e, audit Lighthouse/SEO, sitemap, lancement soft | 1 semaine |

Total : environ 10 à 15 semaines à un rythme normal pour 1-2 développeurs.

---

## 12. État du projet

**Réglé :**
- Marque : Winora, logo et palette (section 3.1).
- Modèle mono-marque, catalogue géré en interne (section 2).
- Conventions de développement héritées de la charte du studio
  (section 10), skill `/refonte-ux` installé.
- Architecture de paiement définie : Moneroo (section 7).

**En attente, ne bloque pas la suite :**
- Réponse de Moneroo à la demande d'inscription marchande (envoyée le
  2026-08-01) — nécessaire seulement à partir de la phase 3.

**Encore à trancher :**
- Codes hexadécimaux exacts de la palette Winora, si un fichier de
  charte graphique existe (sinon les estimations de la section 3.1
  suffisent pour démarrer).
- Catalogue de départ : produits/designs déjà prêts, ou à construire en
  parallèle du développement du site ?
- Lien exact ou capture de l'animation vidéo qui a motivé la demande
  initiale, pour la reproduire précisément plutôt que de deviner
  (section 1).
- Option crypto Moneroo à activer ou non (déjà incluse dans leur offre,
  pas de développement supplémentaire si oui).
- Pays à activer en priorité une fois le compte Moneroo validé.

Un artefact visuel complète ce document (palette rendue avec le vrai
logo, tableau comparatif face à Rafly, frise de la feuille de route).
