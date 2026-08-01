---
name: refonte-ux
description: Refonte d'un site existant (à partir d'une capture d'écran ou d'une URL) centrée sur l'expérience humaine réelle — respecte la typographie et les tokens déjà établis, ancre chaque choix dans la thématique du site, et vise un rendu professionnel moderne sans décoration gratuite.
---

# Refonte UX

Tu es appelé quand l'humain te montre un site (capture d'écran, URL, ou
page déjà ouverte dans le projet) et te demande de le refaire, le
moderniser, ou corriger son design. Ton rôle n'est pas de plaquer un
style à la mode dessus : c'est de comprendre ce que ce site essaie de
faire pour ses utilisateurs, et de le servir mieux — visuellement et
fonctionnellement.

Ce skill est complémentaire de `frontend-design` (qui sert à concevoir
depuis une page blanche). Ici, il y a déjà quelque chose : une charte,
des habitudes, parfois des défauts. Le travail commence par regarder
avant de dessiner.

## Étape 1 — Diagnostiquer avant de retoucher

Ne commence jamais par "je vais rendre ça plus beau". Commence par
identifier PRÉCISÉMENT ce qui ne va pas, avec des mots concrets, pas
des impressions :

- Contraste et lisibilité : le texte est-il en couleur pleine ou en
  opacité diluée sur un fond clair ? Une valeur `rgba(x,x,x,0.3)` sur
  fond clair est presque toujours un texte illisible, pas un choix de
  hiérarchie assumé.
- Redondance : un même mot, badge ou label apparaît-il à plusieurs
  endroits proches sans ajouter d'information ? (ex : le type d'une
  entité répété trois fois dans le même écran)
- Alignement structurel : si deux blocs sont censés être côte à côte
  ou se répondre, démarrent-ils au même point ? Un décalage de départ
  entre deux colonnes se voit avant même qu'on remarque autre chose.
- Densité vs vide : le contenu remplit-il l'espace qui lui est donné
  de façon intentionnelle, ou flotte-t-il dans un vide qui n'a pas été
  pensé ? Le vide n'est pas un défaut en soi — un vide non voulu
  l'est.
- Cohérence entre éléments similaires : si le site présente plusieurs
  entités du même type (fiches produits, profils, cartes...), utilisent-
  elles vraiment le même patron visuel, ou deux versions légèrement
  différentes qui trahissent un ajout non harmonisé ?

Si l'humain donne un retour vague ("c'est moche", "c'est le bordel"),
ne corrige pas au hasard un réglage après l'autre. Cherche la cause
structurelle unique qui explique le ressenti — c'est presque toujours
une seule chose (alignement, contraste, ou incohérence), rarement dix
petites choses à la fois.

## Étape 2 — Respecter ce qui existe déjà avant d'inventer

Avant de proposer une nouvelle police, une nouvelle couleur ou un
nouveau composant : cherche ce qui est déjà en place.

- Cherche un fichier de convention du projet (CLAUDE.md, design
  tokens, variables CSS `:root`, configuration Tailwind) : la palette
  et les rôles typographiques y sont peut-être déjà définis. Les
  citer et les réutiliser vaut toujours mieux que d'en proposer une
  nouvelle version "plus jolie".
- Si plusieurs polices sont déjà en usage, identifie leur RÔLE réel
  (une pour les grands titres signature, une pour les labels/boutons,
  une pour le corps de texte) avant de les changer. Une refonte ne
  doit pas faire disparaître un système typographique qui fonctionne
  déjà, sauf si l'humain demande explicitement à le revoir.
- Si le site a déjà un motif visuel pour une chose (une carte, une
  pastille de couleur, un badge), réutilise ce motif pour tout besoin
  similaire ailleurs sur le site plutôt que d'en inventer un nouveau.
  La cohérence vient de la répétition disciplinée, pas de la variété.

Ce n'est que si rien n'existe, ou si l'humain demande explicitement un
changement de direction, qu'il faut proposer un nouveau système —
et dans ce cas, suivre le procédé de `frontend-design` (palette
nommée, rôles typographiques, signature) en l'ancrant strictement dans
le sujet réel du site, pas dans une tendance générique.

## Étape 3 — L'expérience humaine avant l'esthétique

Une refonte qui est belle mais moins utilisable est un échec. Avant de
livrer, vérifie que le nouveau design sert mieux la personne qui
l'utilise :

- Peut-elle lire tout le texte sans effort, à la taille réelle, sur
  le fond réel — pas seulement en théorie ?
- Les zones cliquables sont-elles assez grandes et clairement
  identifiables comme actionnables ?
- L'information la plus importante pour la tâche de l'utilisateur
  est-elle la plus visible, ou est-ce la décoration qui prend le
  dessus ?
- Le texte des boutons et messages dit-il exactement ce qui va se
  passer, en langage humain, sans jargon technique ni tournure vague ?
- Le contenu réel (vrais textes, vraies données) a-t-il été utilisé
  pour juger le rendu, ou seulement du texte de remplissage qui
  masque les problèmes de longueur, de troncature, de débordement ?
- Le mouvement et l'animation servent-ils à guider l'attention, ou
  sont-ils décoratifs au point de distraire ou de ralentir la
  personne qui veut juste utiliser le site ?

## Étape 4 — Ancrer chaque choix dans la thématique du site

Un site sur un sujet spécifique mérite des choix qui ne pourraient pas
être copiés-collés sur n'importe quel autre site. Avant de valider une
couleur, une forme, une icône ou un motif : demande-toi s'il vient du
sujet réel du site (son univers, son vocabulaire, ses références
concrètes) ou s'il vient d'un réflexe générique ("un site pro, donc
fond sombre + accent vert" par exemple). Préfère toujours le premier.

## Étape 5 — Construire proprement

- Attention à la spécificité des sélecteurs CSS : un sélecteur composé
  peut silencieusement annuler une règle plus simple déclarée ailleurs.
  Vérifier après coup que les marges/paddings s'appliquent vraiment.
- Si une section a une hauteur contrainte (plein écran, position
  fixe, débordement masqué), calculer ou estimer le budget vertical
  du nouveau contenu avant de l'intégrer — ne pas découvrir le
  débordement seulement après coup.
- Ne jamais forcer une égalité de hauteur entre deux blocs de nature
  différente par un artifice d'espacement automatique : ça crée un
  vide visiblement artificiel. Donner aux deux blocs une structure
  comparable pour qu'ils convergent naturellement, ou assumer
  l'asymétrie.
- Nettoyer le CSS et les composants devenus orphelins à chaque
  restructuration — ne pas laisser de classes mortes qui n'ont plus
  de raison d'exister.
- Toute image intégrée doit être redimensionnée et compressée à la
  taille réellement affichée avant d'être utilisée.

## Étape 6 — S'autocritiquer avant de présenter

Avant de montrer le résultat, se relire avec l'œil de quelqu'un qui
connaît déjà le reste du site :

- Cet élément a-t-il le même traitement de carte (fond, bordure,
  rayon, ombre) que les autres cartes du site, ou est-il resté "nu" ?
- Un motif similaire existe-t-il déjà ailleurs que j'aurais dû
  réutiliser au lieu d'en inventer un nouveau ?
- Si je montre ce rendu à quelqu'un qui a déjà vu trois versions
  précédentes rejetées, qu'est-ce qui a VRAIMENT changé structurellement
  cette fois, et pas seulement en surface ?

Ne présente le résultat qu'après avoir répondu honnêtement à ces trois
questions.
