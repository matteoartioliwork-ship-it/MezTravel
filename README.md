# MezTravel

Application web installable (PWA) de planification de voyages, en italien, anglais et français.

## Commandes

- `npm install` : installer les dépendances
- `npm run dev` : lancer l'app en local (adresse : `/MezTravel/`)
- `npm run build` : vérifier et construire l'app
- `npm test` : tests des règles de l’itinéraire et de la copie de sécurité
- `npm run icons` : régénérer les icônes

Chaque envoi sur `main` publie l'app sur GitHub Pages.

Carte de l'icône : Natural Earth (domaine public).

## Services externes

- Recherche de lieux : [Nominatim](https://operations.osmfoundation.org/policies/nominatim/), uniquement à la demande, 1 requête par seconde au maximum, résultats gardés en cache. Pas d’autocomplétion.
- Carte : [tuiles OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/), sans préchargement ni usage hors ligne.
- Météo : [Open-Meteo](https://open-meteo.com/en/terms), usage non commercial, données CC BY 4.0.

## Réservations

Les PDF sont lus sur le téléphone avec pdf.js et gardés dans IndexedDB ; rien n’est envoyé à un service. La copie de sécurité les contient.

## Argent

Taux : [ExchangeRate-API](https://www.exchangerate-api.com/docs/free) (source citée, taux gardés en cache jusqu’à la mise à jour suivante, aucune redistribution). Les montants sont stockés en millièmes entiers ; chaque dépense garde le taux de sa saisie.

## Journal et urgences

Les photos sont réduites sur le téléphone (sans la position GPS) et gardées dans IndexedDB. Les données d’urgence (`src/emergency.ts`) ne contiennent que des informations lues sur des pages officielles, avec source et date : mettre à jour `checkedOn` après chaque nouveau contrôle.

## Confidentialité

Ne jamais ajouter au dépôt de réservations, documents personnels ou clés d'API.
