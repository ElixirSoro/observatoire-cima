/** Lecture d'un fichier choisi par l'utilisateur. Le fichier reste dans le navigateur. */

import { decoderTexte, lireCsv } from './csv';
import { type Cellule, construireTableau, LIMITES, type Tableau } from './tableau';

const EXTENSIONS_TEXTE = ['csv', 'txt', 'tsv'];
const EXTENSION_CLASSEUR = 'xlsx';
const EXTENSION_ANCIEN_CLASSEUR = 'xls';
const CODE_ANCIEN_CLASSEUR = 'XLS_FILE_NOT_SUPPORTED';
const OCTETS_PAR_MO = 1024 * 1024;

const CONSEIL_XLS =
  'Ce fichier est un ancien classeur Excel (.xls). Ouvrez-le dans Excel, enregistrez-le au format .xlsx, puis recommencez.';

/** Extension d'un nom de fichier, en minuscules et sans le point ; vide s'il n'y en a pas. */
export function extensionDe(nom: string): string {
  const point = nom.lastIndexOf('.');
  return point <= 0 || point === nom.length - 1 ? '' : nom.slice(point + 1).toLowerCase();
}

/** Ramène une valeur lue dans un classeur à une cellule : texte, nombre, vrai/faux, date ou vide. */
export function versCellule(valeur: unknown): Cellule {
  if (valeur === null || valeur === undefined) {
    return null;
  }
  if (typeof valeur === 'string' || typeof valeur === 'number' || typeof valeur === 'boolean') {
    return valeur;
  }
  return valeur instanceof Date ? valeur : String(valeur);
}

function messageClasseur(erreur: unknown): string {
  if (typeof erreur === 'object' && erreur !== null && 'code' in erreur && erreur.code === CODE_ANCIEN_CLASSEUR) {
    return CONSEIL_XLS;
  }
  const detail = erreur instanceof Error ? erreur.message : 'erreur inconnue';
  return `Ce classeur n'a pas pu être lu (${detail}). Vérifiez qu'il s'ouvre dans Excel et qu'il est bien au format .xlsx.`;
}

async function lireClasseur(fichier: File): Promise<Tableau> {
  const { default: lireFeuilles } = await import('read-excel-file/browser');
  let feuilles: Awaited<ReturnType<typeof lireFeuilles>>;
  try {
    feuilles = await lireFeuilles(fichier, { trim: false });
  } catch (erreur) {
    throw new Error(messageClasseur(erreur), { cause: erreur });
  }
  const premiere = feuilles[0];
  if (premiere === undefined) {
    throw new Error('Ce classeur ne contient aucune feuille.');
  }
  const brut = premiere.data.map((ligne) => ligne.map(versCellule));
  return construireTableau(brut, {
    nom: fichier.name,
    feuille: premiere.sheet,
    autresFeuilles: feuilles.slice(1).map((feuille) => feuille.sheet),
  });
}

async function lireTexte(fichier: File): Promise<Tableau> {
  const texte = decoderTexte(new Uint8Array(await fichier.arrayBuffer()));
  return construireTableau(lireCsv(texte), { nom: fichier.name, feuille: null, autresFeuilles: [] });
}

/**
 * Lit un fichier .xlsx, .csv, .tsv ou .txt et en fait un tableau.
 *
 * Pré : fichier d'au plus 20 Mo.
 * Post : pour un classeur, seule la première feuille est lue ; les autres sont nommées.
 * Lève : Error, avec un message destiné à l'utilisateur, si le fichier est trop gros,
 *        d'un format non pris en charge, vide ou illisible.
 */
export async function lireFichier(fichier: File): Promise<Tableau> {
  if (fichier.size > LIMITES.octetsMax) {
    const taille = Math.ceil(fichier.size / OCTETS_PAR_MO);
    throw new Error(`Ce fichier pèse ${taille} Mo ; la limite est de ${LIMITES.octetsMax / OCTETS_PAR_MO} Mo.`);
  }
  const extension = extensionDe(fichier.name);
  if (extension === EXTENSION_CLASSEUR) {
    return lireClasseur(fichier);
  }
  if (EXTENSIONS_TEXTE.includes(extension)) {
    return lireTexte(fichier);
  }
  if (extension === EXTENSION_ANCIEN_CLASSEUR) {
    throw new Error(CONSEIL_XLS);
  }
  throw new Error(`Format non pris en charge : « ${fichier.name} ». Formats lus : .xlsx, .csv, .tsv, .txt.`);
}
