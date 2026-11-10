# Observatoire CIMA (nom de travail)

Les chiffres du marché de l'assurance en Côte d'Ivoire, puis en zone CIMA, chacun relié à la source publique où il a été lu.

**État au 10 novembre 2026 : version 0.** Le site affiche 20 chiffres clés de la Côte d'Ivoire, relevés sur 5 pages publiques (articles et fiches de synthèse). Tous portent la mention « à confirmer » : ils n'ont pas encore été relus dans les rapports officiels, dont les PDF restent à intégrer.

Site en ligne : https://elixirsoro.github.io/observatoire-cima/

## Règles du projet

1. **Sources publiques uniquement.** Chaque chiffre vient d'un document publié en ligne par un organisme identifié, inscrit au registre des sources. Aucune donnée privée ou interne à une entreprise.
2. **Aucune donnée personnelle.** La base ne contient que des chiffres de marché, de branche et de compagnie.
3. **Aucune vente d'assurance.** Le projet publie des chiffres ; il ne présente ni ne distribue de contrats.
4. **Chaque chiffre est traçable.** Source, exercice et page sont enregistrés avec la valeur. Les documents d'origine ne sont pas republiés : on cite et on renvoie vers l'éditeur.
5. **Provisoire tant que non relu.** Un chiffre lu dans un article ou une fiche de synthèse reste « à confirmer » jusqu'à sa relecture dans le rapport officiel.

## Comment c'est organisé

```
data/saisie/*.csv  ──►  base SQLite  ──►  app/public/data/observatoire.json  ──►  site web
 (chiffres + source)     (contrôles)        (fichier lu par l'application)
```

| Élément | Rôle |
|---|---|
| `sources/registre_sources.csv` | Les sources autorisées. Un chiffre dont la source n'y figure pas est refusé. |
| `data/saisie/` | Les chiffres relevés, un fichier CSV par lot. |
| `src/obscima/` | Le code Python : contrôles, base, export. |
| `app/` | L'application web (React, TypeScript, Vite). |
| `app/src/contenu.ts` | Tous les textes du site et le choix des chiffres mis en avant. |
| `app/src/styles/tokens.css` | Couleurs, polices, tailles. |

## Mettre le site à jour

**Ajouter ou corriger un chiffre**

1. Si la source est nouvelle, ajoutez une ligne à `sources/registre_sources.csv`.
2. Ajoutez le chiffre dans un fichier de `data/saisie/` (mêmes colonnes que `chiffres_cles_ci.csv`).
3. Lancez `python -m obscima.construire` à la racine du projet.
4. Enregistrez et envoyez : `git add -A && git commit -m "Ajout de chiffres" && git push`. Le site en ligne se met à jour tout seul en quelques minutes.

**Changer un texte ou les chiffres mis en avant** : modifiez `app/src/contenu.ts`.

**Changer les couleurs ou les polices** : modifiez `app/src/styles/tokens.css`.

## Installation

```bash
# Base de données
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
python -m obscima.construire

# Application web
cd app
npm install
npm run dev        # ouvre le site sur http://localhost:5173
```

## Vérifications

```bash
pytest && ruff check . && mypy src tests     # à la racine : 67 tests
cd app && npm test && npm run build          # 15 tests, puis construction du site
```

Les mêmes vérifications tournent sur GitHub à chaque envoi (`.github/workflows/ci.yml`). Si elles passent, le site est reconstruit et remis en ligne automatiquement.

## Garde-fous intégrés au code

- Une source dont l'accès n'est ni `public_en_ligne` ni `communique_par_l_organisme` est refusée.
- Un chiffre dont la source n'est pas au registre est refusé.
- Un chiffre sans numéro de page, sans unité, sans organisme d'origine ou de valeur non finie est refusé.
- Un lot contenant un doublon est annulé en entier.

## Suite prévue

1. Déposer dans `data/raw/` les PDF officiels listés au registre.
2. Relire chaque chiffre sur le rapport officiel et le passer à « vérifié ».
3. Ajouter les comptes par compagnie et les années manquantes.
