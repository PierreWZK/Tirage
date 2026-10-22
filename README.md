# Tirage · Vos outs, vos cotes, la bonne décision

> Jour 10 du défi **30 jours, 30 projets** · React · Vite · ⏳ **En cours**

Un calculateur de **pot odds** et d'**outs** au poker : on entre sa main et le board, **Tirage** compte les cartes qui améliorent la main, donne la probabilité de toucher et dit si suivre la mise est rentable.

📄 Les règles détaillées sont dans le [cahier des charges](CAHIER_DES_CHARGES.md).

## Au programme

- Choix de la main et du board (flop, turn) avec un sélecteur de cartes.
- Comptage des **outs** par type de tirage (couleur, quinte, brelan…), sans compter deux fois une carte.
- Probabilité de toucher au prochain tour et à la river (calcul exact).
- **Cotes du pot** : taille du pot et de la mise, équité nécessaire, verdict « suivre » ou « coucher ».
- Un **entraînement** : situations tirées au hasard, réponse chronométrée, score.

## Ce qui est fait

- **Accueil** présenté comme un logiciel, dans le monde d'une retransmission de poker : la démo est vivante dès le premier écran (cartes à changer au clic, incrustation calculée en direct), un fil défilant de chiffres, le tableau « exact contre règle du 4 », les cotes du pot à régler soi-même, une seule offre (gratuite) et une FAQ. Aucun faux avis ni chiffre.
- **Calculateur** : main et board au sélecteur de cartes, outs carte par carte et par type, probabilité exacte à la prochaine carte ou jusqu'à la river, règle du 2 et du 4 avec l'écart, cotes du pot et verdict expliqué. Des mains d'exemple et une main au hasard.
- **Entraînement** : 10 mains, 15 secondes chacune, suivre ou coucher (clavier : S, C, Entrée), correction après chaque main, record gardé dans le navigateur.
- **La main du jour** : la même pour tout le monde (graine datée, heure de Paris), décision sur 50 et estimation de l'équité sur 50, score copié dans le presse-papiers sur ordinateur ou partagé sur téléphone, série de jours.
- Moteur maison sans dépendance (`src/core/`) : évaluateur de mains, outs, probabilités exactes, situations ; 12 tests.
- Design : direction « habillage télé » choisie avec le skill impeccable ; système décrit dans [DESIGN.md](DESIGN.md), produit dans [PRODUCT.md](PRODUCT.md).

## Lancer en local

```bash
npm install
npm run dev                  # http://localhost:5173
npm test                     # tests du moteur (node --test)
npm run build                # site statique dans dist/
```

## Mise en ligne

Prévue sur Coolify : **https://tirage.projectp.fr**.

## Stack

React · Vite · Saira (police auto-hébergée) · moteur de calcul en JavaScript pur.
