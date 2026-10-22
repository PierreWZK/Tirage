---
name: Tirage
description: Vos outs, vos cotes, la bonne décision. Un calculateur de poker présenté comme une retransmission.
colors:
  regie: "#070a14"
  regie-1: "#0d1224"
  regie-2: "#161d3a"
  tv: "#1d39e8"
  tv-deep: "#1229b8"
  signal: "#ffd21f"
  signal-ink: "#1a1400"
  carte: "#f6f3ea"
  rouge: "#d3202f"
  noir: "#12131a"
  ok: "#39d98a"
  texte: "#eef1ff"
  texte-2: "#b3bce0"
  sur-tv: "#dfe5ff"
typography:
  display:
    fontFamily: "'Saira Variable', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.5rem + 4vw, 5.25rem)"
    fontWeight: 780
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  section:
    fontFamily: "'Saira Variable', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)"
    fontWeight: 780
    lineHeight: 0.95
  live-figure:
    fontFamily: "'Saira Variable', system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1.2rem + 1.2vw, 2.25rem)"
    fontWeight: 780
    lineHeight: 1
  tag:
    fontFamily: "'Saira Variable', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    letterSpacing: "0.08em"
  lede:
    fontFamily: "'Saira Variable', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "'Saira Variable', system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  none: "0"
  card: "9% of card width"
spacing:
  bevel: "14px"
  section: "clamp(80px, 10vw, 140px)"
  page-gutter: "clamp(20px, 4vw, 48px)"
components:
  button-signal:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "48px"
  button-tv:
    backgroundColor: "{colors.tv}"
    textColor: "{colors.texte}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "48px"
  button-ghost:
    backgroundColor: "{colors.regie-2}"
    textColor: "{colors.texte}"
    rounded: "{rounded.none}"
    padding: "0 26px"
    height: "48px"
  field:
    backgroundColor: "{colors.regie-1}"
    textColor: "{colors.texte}"
    rounded: "{rounded.none}"
    height: "48px"
  playing-card:
    backgroundColor: "{colors.carte}"
    textColor: "{colors.noir}"
    rounded: "{rounded.card}"
  overlay-body:
    backgroundColor: "{colors.tv}"
    textColor: "{colors.texte}"
    rounded: "{rounded.none}"
---

# Design System: Tirage

## Overview

**Creative North Star: "La régie"**

Tirage se lit comme une retransmission de poker. La main du joueur s'affiche comme à la télévision, cartes face visible, et les chiffres que la réalisation incruste à l'antenne (outs, probabilité exacte, règle du 2 et du 4, cotes, verdict) sont calculés en direct. Le fond est celui de la régie ; la couleur arrive par bandeaux entiers, comme les habillages d'antenne.

Le système refuse la page SaaS sombre (titre, capture, rangée de cartes identiques) et le tapis de feutre vert. Un chiffre qui compte est toujours en jaune signal, et toujours calculé.

**Key Characteristics:**
- Bandeaux biseautés bleu télé qui couvrent des régions entières (incrustation, bande « exact contre tête »).
- Jaune signal réservé aux chiffres en direct et à l'action principale.
- Une seule famille, Saira, dont l'axe de largeur fait le travail : étroite et grasse pour l'antenne, normale pour la lecture.
- Cartes à jouer réelles, blanc cassé, enseignes rouge et noir, index français (V, D, R).
- Un fil défilant de faits chiffrés, comme en bas d'écran.

## Colors

### Primary
- **Bleu télé** (`#1d39e8`) : les bandeaux d'incrustation, la bande pleine « Le chiffre exact, et celui de tête », le bouton secondaire. Sa variante profonde (`#1229b8`) porte le compteur d'outs.

### Secondary
- **Jaune signal** (`#ffd21f`) sur encre `#1a1400` : les chiffres en direct (probabilité exacte, valeurs du tableau, chrono), l'action principale, l'étiquette « Analyse en direct », la bande de la main du jour.

### Tertiary
- **Vert verdict** (`#39d98a`) et **rouge carte** (`#d3202f`) : uniquement pour « suivre » et « coucher », et pour les enseignes rouges.

### Neutral
- **Régie** (`#070a14`), **régie 1** (`#0d1224`) pour les panneaux, **régie 2** (`#161d3a`) pour le fil et les boutons discrets.
- **Texte** (`#eef1ff`), **texte 2** (`#b3bce0`) pour le texte courant secondaire, **sur-télé** (`#dfe5ff`) pour le texte posé sur le bleu.
- **Carte** (`#f6f3ea`) et **noir** (`#12131a`) pour les cartes à jouer.

### Named Rules
**The Live Figure Rule.** Le jaune signal ne colore qu'un chiffre réellement calculé ou l'action principale ; jamais un mot de décor.

**The Band Rule.** La couleur arrive par régions entières (bandeaux, bandes pleine largeur), jamais en touches éparpillées sur un fond neutre.

## Typography

**Display Font:** Saira Variable (axe de largeur, `font-stretch` 62 % à 85 %), auto-hébergée via @fontsource-variable/saira.
**Body Font:** la même, largeur normale.

**Character:** l'écriture des habillages d'antenne : étroite, grasse, chiffres tabulaires qui ne bougent pas quand ils changent.

### Hierarchy
- **Display** (780, `font-stretch` 72 %, clamp 2.5 → 5.25rem, 0.95) : le titre de la page.
- **Section** (780, 72 %, clamp 1.75 → 2.75rem) : un titre par section, sans surtitre.
- **Live figure** (780, 62 à 70 %, 1.6 → 4rem) : outs, pourcentages, score, prix.
- **Tag** (700, 75 à 80 %, 0.8125rem, capitales, 0.08em) : les étiquettes de l'interface (Votre main, Board, Exact), jamais au-dessus d'un titre.
- **Lede** (400, 1.25 → 1.625rem, 1.4) : la phrase sous le titre, 36ch au plus.
- **Body** (400, 1 → 1.125rem, 1.55) : 62 à 64ch.

### Named Rules
**The Width Axis Rule.** La hiérarchie passe par la largeur et la graisse de Saira, pas par une deuxième famille.

## Layout

Grille de 1240 px au plus, gouttières `clamp(20px, 4vw, 48px)`. Les sections alternent fond régie et bandes pleine largeur (bleu, puis jaune) pour rythmer la page ; entre deux bandes, 80 à 140 px d'air. Sous 960 px, toutes les grilles passent en une colonne et l'écran de démonstration touche les bords ; sous 640 px, la navigation se réduit à l'action principale et l'incrustation passe le verdict sous les chiffres.

## Elevation & Depth

Plat par défaut : les surfaces se séparent par un pas de ton de régie et un filet de 1 px à 14 % de blanc. Seuls les objets physiques ont une ombre : les cartes à jouer (`0 6px 16px -6px` noir à 65 %), l'écran de démonstration et le paquet qui s'ouvre (ombres portées douces). L'incrustation porte une ombre douce (`drop-shadow(0 18px 30px)`) parce qu'elle flotte sur l'image, comme à l'antenne.

## Shapes

Angles vifs partout, sauf les cartes à jouer (rayon de 9 % de leur largeur). Les boutons, l'étiquette « en direct », l'incrustation et le verdict ont des coins biseautés (`clip-path`, 4 à 6 sommets, 12 à 18 px).

## Components

### Buttons
Bandeaux biseautés de 48 px, `font-stretch` 85 %, 700. Signal (jaune) pour l'action principale, télé (bleu) pour l'action secondaire d'un panneau, discret (régie 2) pour le reste. Survol : un ton plus clair ; appui : 1 px plus bas.

### Inputs / Fields
Champ régie 1, filet 1 px, angles vifs, 48 px, valeur en 600. Focus : filet jaune signal.

### Navigation
Barre collante sur régie à 92 %, mot-symbole TIRAGE étroit, liens texte 2 ; page courante soulignée de jaune.

### Playing card (signature)
Carte blanc cassé au ratio 5:7, index en haut à gauche (valeur française et enseigne), grande enseigne au centre. Vide : un emplacement en pointillé fin qui devient bouton. Les deux cartes de la main sont inclinées de ±4°, comme posées.

### Overlay (signature)
L'incrustation : étiquette jaune « Analyse en direct » au-dessus d'un bandeau bleu en trois parties (compteur d'outs sur bleu profond, statistiques avec barre de probabilité et trait des cotes, verdict vert ou rouge). Elle entre en balayage de gauche à droite et chaque chiffre modifié blanchit brièvement.

## Do's and Don'ts

### Do:
- **Do** afficher le calcul exact à côté de la règle du 2 et du 4, avec l'écart.
- **Do** calculer chaque chiffre affiché en jaune : aucun chiffre décoratif.
- **Do** utiliser de vraies cartes à jouer pour toute main.

### Don't:
- **Don't** poser un surtitre au-dessus d'un titre de section.
- **Don't** faire pulser le point « en direct » ni ajouter de halo lumineux.
- **Don't** utiliser un tapis de feutre vert ou des jetons en décor.
- **Don't** inventer avis, clients ou chiffres d'utilisateurs : la preuve, c'est la démo.
