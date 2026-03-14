# CBag Site Blocker (Chrome Extension)

Extension Chrome Manifest V3 pour bloquer des groupes de sites avec des intervalles de temps dedies.

## Fonctionnalites

- Activation/desactivation globale du blocage
- Blocage rapide du site courant depuis le popup
- Page de configuration dediee (hors popup)
- Groupes de sites (ex: "Reseaux sociaux", "Streaming")
- Intervalles de blocage par groupe
- Support de domaines simples et wildcard (`*.domaine.com`)
- Redirection vers une page locale de blocage
- Logo SVG integre aux interfaces

## Installation locale

1. Ouvrir Chrome puis aller sur `chrome://extensions`.
2. Activer le mode developpeur.
3. Cliquer sur **Load unpacked**.
4. Selectionner le dossier de ce projet.

## Utilisation

- Cliquer sur l'icone puis ouvrir la configuration.
- Creer un groupe avec ses sites (exemples: `facebook.com`, `*.tiktok.com`).
- Definir des intervalles du groupe (exemple: `09:00-12:00, 14:00-18:00`).
- Ouvrir/recharger un site correspondant pour le voir bloque.

Si un groupe n'a aucun intervalle, son blocage est actif toute la journee.

## Stockage

L'extension utilise `chrome.storage.local` avec:

- `enabled`: activation globale
- `siteGroups`: liste des groupes `{ id, name, enabled, patterns, intervals }`

Compatibilite: les anciennes cles `blockedPatterns` et `activeIntervals` sont migrees automatiquement vers un groupe.
