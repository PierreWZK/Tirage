# Jour 10/30 — Tirage, vos outs, vos cotes, la bonne décision

> Stack : **Vite + React** (décidé le jour 10, à la place du JavaScript sans dépendance : l'interface du sélecteur de cartes et des jeux le demande) · hébergement **Coolify**, sous-domaine `tirage.projectp.fr`.
> Durée visée : **2 h 45** pour le MVP, les bonus ensuite.

Ce document est notre contrat : on le suit étape par étape, et toute décision qui s'en écarte est d'abord notée ici. Il s'ajuste au début de la journée.

## 1. L'idée

Un calculateur de **pot odds** et d'**outs** au poker : on entre sa main et le board, **Tirage** compte les cartes qui améliorent la main, donne la probabilité de toucher et dit si suivre la mise est rentable.

## 2. MVP — ce qui doit fonctionner à la fin

1. Choix de la main et du board (flop, turn) avec un sélecteur de cartes.
2. Comptage des **outs** par type de tirage (couleur, quinte, brelan…), sans compter deux fois une carte.
3. Probabilité de toucher au prochain tour et à la river (calcul exact).
4. **Cotes du pot** : taille du pot et de la mise, équité nécessaire, verdict « suivre » ou « coucher ».
5. Un **entraînement** : situations tirées au hasard, réponse chronométrée, score.
6. **La main du jour** : la même situation pour tout le monde, suivre ou coucher puis estimer l'équité, score sur 100 à partager (copié dans le presse-papiers sur ordinateur, partage natif sur téléphone).
7. Une page d'accueil présentée comme celle d'un logiciel : démo vivante dès le premier écran, une seule offre (gratuite), FAQ. Aucun faux avis, client ni chiffre.
8. En ligne sur Coolify, avec un README à jour et un aperçu de lien (Open Graph).

### Périmètre volontairement limité

- Texas Hold'em uniquement.
- Pas de calcul contre une range adverse (bonus).

## 3. Cahier des charges fonctionnel

### Calcul

- **Un out** est une carte qui fait passer la main à une catégorie supérieure, au moins deux paires, grâce aux cartes du joueur (pas au seul board). Deux paires ne compte que si la carte s'apparie avec une carte du joueur. Chaque carte est comptée une fois, sous la meilleure catégorie qu'elle donne (couleur, quinte, brelan, deux paires, full, carré, quinte flush).

- Règle du 2 et du 4 affichée à côté du calcul exact, pour apprendre l'approximation.
- Liste des outs, carte par carte.

### Entraînement

- 10 situations, 15 secondes chacune, suivre ou coucher ; un record gardé dans le navigateur.

### La main du jour

- Tirée d'une graine datée (heure de Paris) : la même pour tout le monde, sans serveur.
- Au flop, adversaire à tapis (turn et river à venir). Décision juste : 50 points ; estimation de l'équité : 50 points moins 2,5 par point d'écart.
- Une partie par jour, série gardée dans le navigateur.

## 4. Cahier des charges technique

- Évaluateur de mains maison (`src/core/`, JavaScript pur sans dépendance), testé avec `node --test`.
- Interface en React (Vite), quatre pages statiques : accueil, calculateur, entraînement, main du jour.
- Probabilités exactes par énumération des cartes restantes.
- Mise en ligne sur Coolify à chaque push sur la branche principale.

## 5. Critères de réussite

- [x] Les outs d'un tirage couleur + quinte ouverte valent 15.
- [x] La probabilité au flop de toucher 9 outs vaut 35 %.
- [x] Les tests de l'évaluateur passent.

## 6. Bonus facultatifs

- Équité contre une range.
- Mode Omaha.
- [x] Partage d'une situation par lien (`/calculateur/?main=…&board=…`).
- [x] Quatre modes d'entraînement (suivre ou coucher, compte les outs, estime tes chances, survie).
- [x] Défi entre amis : un lien qui rejoue la même série de mains et affiche le score à battre.

## 7. Définition du « terminé »

Le MVP fonctionne, les critères de la section 5 sont cochés, le site est en ligne sur `tirage.projectp.fr`, le README a son lien et sa capture, et la carte du projet passe à « terminé » sur la vitrine.
