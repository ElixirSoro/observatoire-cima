// Construit le serveur local en un seul fichier, puis prépare le dossier du paquet .mcpb.
import { mkdir, rm, writeFile } from 'node:fs/promises';

import { build } from 'esbuild';

const DOSSIER = 'paquet';
const VERSION = '0.1.0';

const MANIFESTE = {
  manifest_version: '0.3',
  name: 'atelier-observatoire',
  display_name: 'Atelier et observatoire',
  version: VERSION,
  description: "Chiffres sourcés du marché ivoirien de l'assurance, et contrôle de fichiers Excel ou CSV.",
  long_description:
    "Donne à Claude trois outils de lecture sur l'observatoire du marché ivoirien de l'assurance (chiffres, indicateurs, sources), chacun avec sa source et sa page, et un outil qui contrôle un fichier .xlsx, .csv, .tsv ou .txt de l'ordinateur : lignes vides, doublons, cellules vides, valeurs incohérentes, statistiques par colonne. Le fichier n'est jamais modifié.",
  author: { name: 'Soro Onansongui Elixir' },
  repository: { type: 'git', url: 'https://github.com/ElixirSoro/observatoire-cima' },
  homepage: 'https://elixirsoro.github.io/observatoire-cima/',
  server: {
    type: 'node',
    entry_point: 'server/index.cjs',
    mcp_config: { command: 'node', args: ['${__dirname}/server/index.cjs'] },
  },
  tools: [
    { name: 'observatoire_chercher', description: "Chercher des chiffres de l'observatoire, avec leur source." },
    { name: 'observatoire_indicateurs', description: 'Lister les indicateurs disponibles.' },
    { name: 'observatoire_sources', description: 'Lister les documents publics cités.' },
    { name: 'atelier_controler_fichier', description: "Contrôler un fichier Excel ou CSV de l'ordinateur." },
  ],
  compatibility: { platforms: ['darwin', 'win32'], runtimes: { node: '>=18.0.0' } },
  keywords: ['assurance', 'Côte d’Ivoire', 'données', 'Excel', 'CSV'],
  license: 'UNLICENSED',
};

await rm(DOSSIER, { recursive: true, force: true });
await mkdir(`${DOSSIER}/server`, { recursive: true });
const resultat = await build({
  entryPoints: ['src/local.ts'],
  outfile: `${DOSSIER}/server/index.cjs`,
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  minify: false,
  legalComments: 'linked',
  logLevel: 'warning',
});
if (resultat.errors.length > 0) {
  throw new Error(`Construction échouée : ${resultat.errors.length} erreur(s).`);
}
await writeFile(`${DOSSIER}/manifest.json`, `${JSON.stringify(MANIFESTE, null, 2)}\n`);
console.log(`Paquet préparé dans ${DOSSIER}/ (version ${VERSION}).`);
