# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React (choix de l'utilisateur, à la place du « JavaScript sans dépendance » prévu au cahier). Site statique servi par Coolify sur `tirage.projectp.fr`. Tests du moteur avec Vitest.

## Users

Un joueur régulier de Texas Hold'em (en ligne ou entre amis) qui connaît les règles et veut enfin maîtriser les outs et les cotes du pot pour décider plus juste. Il s'en sert hors table, au calme, sur ordinateur ou téléphone : revoir une main jouée, s'entraîner, faire le jeu du jour.

## Product Purpose

Tirage compte les outs d'une main (main + flop ou turn), donne la probabilité exacte de toucher, la compare aux cotes du pot et dit si suivre est rentable. Le succès : le joueur finit par estimer tout seul, à table, ce que Tirage lui calcule.

## Positioning

Le calcul exact (énumération des cartes restantes) affiché à côté de la règle du 2 et du 4, pour que le joueur apprenne l'approximation mentale et sache de combien elle se trompe. Un calculateur ordinaire donne un chiffre ; Tirage apprend à s'en passer.

## Operating Context

- Hors table : revue d'une main, entraînement (10 situations chronométrées, record gardé dans le navigateur), jeu du jour.
- Jeu du jour « La main du jour » : la même situation pour tout le monde, suivre ou coucher puis estimer l'équité, score à partager (copié dans le presse-papiers sur ordinateur, partage natif sur téléphone).
- Présenté comme un produit logiciel premium, mais gratuit : une seule offre à 0 €.

## Capabilities and Constraints

- Texas Hold'em uniquement. Pas d'équité contre une range adverse (bonus éventuel).
- Sélecteur de cartes pour la main (2 cartes) et le board (flop 3, turn 4).
- Outs par type de tirage (couleur, quinte, brelan…), chaque carte comptée une seule fois, listés carte par carte.
- Probabilités exactes au prochain tour et à la river ; règle du 2 et du 4 à côté.
- Cotes du pot : pot et mise, équité nécessaire, verdict suivre ou coucher.
- Entraînement : 10 situations, chronométrées, score, record local.
- Critères chiffrés du cahier : tirage couleur + quinte ouverte = 15 outs ; 9 outs au flop ≈ 35 %.
- Langue : français.

## Brand Commitments

- Nom : **Tirage** (« vos outs, vos cotes, la bonne décision »).
- Fait partie du défi « 30 jours, 30 projets » (projectp.fr) : pied de page au format habituel (« Tirage · Jour 10 du défi 30 jours, 30 projets / Fait avec … · Code sur GitHub ↗ »), aperçu de lien Open Graph.

## Evidence on Hand

Aucun avis, client, logo, chiffre d'utilisateurs ni presse. Rien de tout cela ne doit être inventé. La seule preuve possible est le produit lui-même : la démo interactive et les calculs vérifiables.

## Product Principles

1. Le chiffre exact et l'approximation côte à côte : toujours montrer l'écart.
2. Une décision se lit en une seconde : suivre ou coucher, et pourquoi.
3. La preuve, c'est la démo : on essaie avant de croire.
4. Gratuit sans arrière-pensée : pas de compte, pas de collecte.
