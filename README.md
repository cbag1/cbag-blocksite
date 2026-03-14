# CBag Site Blocker (Chrome Extension)

Extension Chrome Manifest V3 pour bloquer des groupes de sites avec des intervalles de temps dedies.
Elle permet de combiner des regles simples (domaines) avec des plages horaires, puis de rediriger automatiquement les onglets concernes vers une page de blocage claire.

## Fonctionnalites

- Activation/desactivation globale du blocage
- Blocage rapide du site courant depuis le popup
- Page de configuration dediee (hors popup)
- Groupes de sites (ex: "Reseaux sociaux", "Streaming")
- Intervalles de blocage par groupe
- Support de domaines simples et wildcard (`*.domaine.com`)
- Redirection vers une page locale de blocage
- Activation automatique du blocage a l'entree d'un intervalle, sans rechargement manuel des onglets
- Logo SVG integre aux interfaces

## Installation locale

1. Ouvrir Chrome puis aller sur `chrome://extensions`.
2. Activer le mode developpeur.
3. Cliquer sur **Load unpacked**.
4. Selectionner le dossier de ce projet.

## Utilisation

- Cliquer sur l'icone puis ouvrir la configuration detaillee.
- Creer un groupe avec ses sites (exemples: `facebook.com`, `*.tiktok.com`).
- Definir des intervalles du groupe (exemple: `09:00-12:00, 14:00-18:00`).
- Laisser vide les intervalles pour un blocage permanent (24h/24).
- Quand une plage horaire demarre, les onglets deja ouverts sont controles automatiquement et rediriges si besoin.

Si un groupe n'a aucun intervalle, son blocage est actif toute la journee.

## Comment fonctionne le blocage

- A chaque navigation, l'URL est comparee aux groupes actifs.
- Si un domaine correspond et que l'horaire du groupe est actif, l'onglet est redirige vers `blocked.html`.
- En plus, une verification periodique (toutes les minutes) controle les onglets deja ouverts.
- Resultat: le blocage s'active au bon moment, meme sans action manuelle (ni rechargement de page).

## Stockage

L'extension utilise `chrome.storage.local` avec:

- `enabled`: activation globale
- `siteGroups`: liste des groupes `{ id, name, enabled, patterns, intervals }`

Compatibilite: les anciennes cles `blockedPatterns` et `activeIntervals` sont migrees automatiquement vers un groupe.
