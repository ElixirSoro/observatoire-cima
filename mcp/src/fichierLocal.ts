/** Lecture d'un fichier sur l'ordinateur où tourne le serveur, pour l'atelier. */

import { readFile, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, isAbsolute } from 'node:path';

import readXlsx from 'read-excel-file/node';

import { decoderTexte, lireCsv } from '../../app/src/atelier/csv';
import {
  CONSEIL_XLS,
  EXTENSION_ANCIEN_CLASSEUR,
  EXTENSION_CLASSEUR,
  EXTENSIONS_TEXTE,
  extensionDe,
  messageClasseur,
  messageFormat,
  versCellule,
} from '../../app/src/atelier/formats';
import { construireTableau, LIMITES, type Tableau } from '../../app/src/atelier/tableau';

const OCTETS_PAR_MO = 1024 * 1024;

/** « ~/Documents/x.csv » devient le chemin complet ; un chemin relatif est refusé. */
export function cheminComplet(chemin: string): string {
  const nettoye = chemin.trim();
  const complet = nettoye === '~' || nettoye.startsWith('~/') ? `${homedir()}${nettoye.slice(1)}` : nettoye;
  if (!isAbsolute(complet)) {
    throw new Error(`Chemin complet attendu (par exemple /Users/nom/Documents/ventes.xlsx) ; reçu « ${chemin} ».`);
  }
  return complet;
}

async function lireClasseur(octets: Buffer, nom: string): Promise<Tableau> {
  let feuilles: Awaited<ReturnType<typeof readXlsx>>;
  try {
    feuilles = await readXlsx(octets, { trim: false });
  } catch (erreur) {
    throw new Error(messageClasseur(erreur), { cause: erreur });
  }
  const premiere = feuilles[0];
  if (premiere === undefined) {
    throw new Error('Ce classeur ne contient aucune feuille.');
  }
  const brut = premiere.data.map((ligne) => ligne.map(versCellule));
  return construireTableau(brut, {
    nom,
    feuille: premiere.sheet,
    autresFeuilles: feuilles.slice(1).map((feuille) => feuille.sheet),
  });
}

/**
 * Lit un fichier .xlsx, .csv, .tsv ou .txt de l'ordinateur et en fait un tableau.
 *
 * Pré : chemin complet (ou commençant par « ~/ ») vers un fichier d'au plus 20 Mo.
 * Post : le fichier n'est que lu, jamais modifié ; seule la première feuille d'un classeur est lue.
 * Lève : Error, avec un message destiné à l'utilisateur, si le fichier est absent, trop gros,
 *        d'un format non pris en charge ou illisible.
 */
export async function lireFichierLocal(chemin: string): Promise<Tableau> {
  const complet = cheminComplet(chemin);
  const nom = basename(complet);
  const infos = await stat(complet).catch((erreur: unknown) => {
    throw new Error(`Fichier introuvable : ${complet}`, { cause: erreur });
  });
  if (!infos.isFile()) {
    throw new Error(`Ce chemin n'est pas un fichier : ${complet}`);
  }
  if (infos.size > LIMITES.octetsMax) {
    throw new Error(`Ce fichier pèse ${Math.ceil(infos.size / OCTETS_PAR_MO)} Mo ; la limite est de ${LIMITES.octetsMax / OCTETS_PAR_MO} Mo.`);
  }
  const extension = extensionDe(nom);
  if (extension === EXTENSION_ANCIEN_CLASSEUR) {
    throw new Error(CONSEIL_XLS);
  }
  if (extension !== EXTENSION_CLASSEUR && !EXTENSIONS_TEXTE.includes(extension)) {
    throw new Error(messageFormat(nom));
  }
  const octets = await readFile(complet);
  if (extension === EXTENSION_CLASSEUR) {
    return lireClasseur(octets, nom);
  }
  return construireTableau(lireCsv(decoderTexte(new Uint8Array(octets))), { nom, feuille: null, autresFeuilles: [] });
}
