/** Le serveur MCP : les mêmes outils pour l'usage local et, plus tard, pour l'usage en ligne. */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { rapportFichier } from './atelier';
import type { Chargeur } from './donnees';
import { lireFichierLocal } from './fichierLocal';
import { chercherChiffres, LIMITE_MAX, listerIndicateurs, listerSources } from './observatoire';

export const NOM_SERVEUR = 'atelier-observatoire';
export const VERSION_SERVEUR = '0.1.0';

const INSTRUCTIONS = [
  "Ce serveur donne accès à l'observatoire du marché ivoirien de l'assurance et, en usage local, à l'atelier de contrôle de fichiers.",
  "Chaque chiffre de l'observatoire vient d'un document public : citez toujours son organisme d'origine, la source, la page et le lien.",
  "Un chiffre au statut « À confirmer » a été lu dans un article ou une fiche de synthèse : dites-le à l'utilisateur.",
  "Si un chiffre n'est pas dans la base, dites qu'il n'y est pas ; n'en proposez pas d'autre de mémoire comme s'il venait de l'observatoire.",
].join(' ');

const LECTURE_SEULE = { readOnlyHint: true, destructiveHint: false, idempotentHint: true } as const;

export interface Options {
  charger: Chargeur;
  /** Vrai seulement quand le serveur tourne sur l'ordinateur de l'utilisateur. */
  fichiersLocaux: boolean;
}

function texte(contenu: string): CallToolResult {
  return { content: [{ type: 'text', text: contenu }] };
}

/** Transforme une erreur en réponse lisible pour Claude, sans arrêter le serveur. */
async function proteger(action: () => Promise<string>): Promise<CallToolResult> {
  try {
    return texte(await action());
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : String(erreur);
    return { content: [{ type: 'text', text: message }], isError: true };
  }
}

function enregistrerObservatoire(serveur: McpServer, charger: Chargeur): void {
  serveur.registerTool(
    'observatoire_chercher',
    {
      title: "Chercher des chiffres de l'observatoire",
      description:
        "Cherche des chiffres du marché ivoirien de l'assurance (primes émises, taux de pénétration, prime par habitant, nombre de compagnies…) et les donne avec leur source, leur page et leur statut. Tous les filtres sont facultatifs et se cumulent.",
      inputSchema: {
        indicateur: z.string().min(1).max(80).optional().describe("Code exact d'un indicateur, par exemple « primes_emises ». Voir observatoire_indicateurs."),
        exercice: z.number().int().min(1990).max(2100).optional().describe('Année de l’exercice, par exemple 2024.'),
        branche: z.string().min(1).max(80).optional().describe('Branche : « Toutes », « Vie », « Non-vie », « Réassurance »…'),
        texte: z.string().min(1).max(200).optional().describe('Mots à chercher, par exemple « primes vie ».'),
        limite: z.number().int().min(1).max(LIMITE_MAX).optional().describe('Nombre maximal de chiffres renvoyés (50 par défaut).'),
      },
      annotations: { ...LECTURE_SEULE, openWorldHint: false },
    },
    async (filtre) => proteger(async () => chercherChiffres(await charger(), filtre)),
  );
  serveur.registerTool(
    'observatoire_indicateurs',
    {
      title: "Lister les indicateurs de l'observatoire",
      description: "Liste les indicateurs disponibles, avec leur unité, leurs branches et les exercices couverts.",
      annotations: { ...LECTURE_SEULE, openWorldHint: false },
    },
    async () => proteger(async () => listerIndicateurs(await charger())),
  );
  serveur.registerTool(
    'observatoire_sources',
    {
      title: "Lister les sources de l'observatoire",
      description: 'Liste les documents publics dont viennent les chiffres : organisme, titre, exercice, lien, date de consultation.',
      annotations: { ...LECTURE_SEULE, openWorldHint: false },
    },
    async () => proteger(async () => listerSources(await charger())),
  );
}

function enregistrerAtelier(serveur: McpServer): void {
  serveur.registerTool(
    'atelier_controler_fichier',
    {
      title: 'Contrôler un fichier de données',
      description:
        "Lit un fichier .xlsx, .csv, .tsv ou .txt de cet ordinateur (sans le modifier) et rend son état : lignes vides, lignes en double, cellules vides, valeurs qui ne sont pas du genre de leur colonne, statistiques par colonne. Le fichier n'est pas transmis en entier, mais le rapport cite quelques valeurs du fichier (exemples de défauts, valeurs les plus fréquentes), qui entrent dans la conversation.",
      inputSchema: {
        chemin: z.string().min(1).max(1024).describe('Chemin complet du fichier, par exemple /Users/nom/Documents/ventes.xlsx ou ~/Documents/ventes.csv.'),
      },
      annotations: { ...LECTURE_SEULE, openWorldHint: false },
    },
    async ({ chemin }) => proteger(async () => rapportFichier(await lireFichierLocal(chemin))),
  );
}

/** Crée le serveur et ses outils. L'outil de fichiers n'existe qu'en usage local. */
export function creerServeur(options: Options): McpServer {
  const serveur = new McpServer({ name: NOM_SERVEUR, version: VERSION_SERVEUR }, { instructions: INSTRUCTIONS });
  enregistrerObservatoire(serveur, options.charger);
  if (options.fichiersLocaux) {
    enregistrerAtelier(serveur);
  }
  return serveur;
}
