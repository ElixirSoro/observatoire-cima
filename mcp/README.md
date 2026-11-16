# Serveur MCP : atelier et observatoire

Donne à Claude des outils sur les données du projet. Tous sont en lecture seule.

| Outil | Rôle | Disponible |
|---|---|---|
| `observatoire_chercher` | Chiffres du marché ivoirien de l'assurance, avec source, page et statut | partout |
| `observatoire_indicateurs` | Liste des indicateurs, unités, branches et exercices | partout |
| `observatoire_sources` | Documents publics cités | partout |
| `atelier_controler_fichier` | Contrôle d'un fichier .xlsx, .csv, .tsv ou .txt de l'ordinateur | en local seulement |

Les chiffres sont lus sur le site publié (`data/observatoire.json`) et gardés une heure en mémoire. Si le site ne répond pas en 5 secondes, le serveur utilise la copie intégrée au moment de la construction, et le dit dans sa réponse.

L'outil de l'atelier réutilise exactement le code de l'atelier du site (`app/src/atelier/`). Il ne modifie jamais le fichier. Le fichier n'est pas transmis en entier, mais **le rapport cite quelques valeurs** (exemples de défauts, valeurs les plus fréquentes), qui entrent dans la conversation avec Claude.

## Installer sur son ordinateur (Claude Desktop)

```bash
cd mcp
npm install
npm run paquet      # produit atelier-observatoire.mcpb
```

Puis double-cliquer sur `atelier-observatoire.mcpb`, ou, dans Claude Desktop : Réglages › Extensions › Réglages avancés › Installer une extension. Claude Desktop fournit Node.js : rien d'autre à installer.

## Vérifications

```bash
npm run verifier    # vérification des types
npm test            # 13 tests : outils, chargeur, fichiers de test fictifs
```

## Suite prévue : le connecteur en ligne

Un second point d'entrée, `src/distant.ts`, servira les trois outils de l'observatoire par HTTP. Chaque client l'ajoutera à son compte Claude comme connecteur personnalisé, par son adresse. L'outil de l'atelier n'y sera pas : il faudrait que les fichiers des clients passent par un serveur, ce qui demande d'abord la formalité ARTCI.
