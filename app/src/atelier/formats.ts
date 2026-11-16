/** Formats de fichier lus par l'atelier, communs au site et au serveur MCP. */

import type { Cellule } from './tableau';

export const EXTENSIONS_TEXTE: readonly string[] = ['csv', 'txt', 'tsv'];
export const EXTENSION_CLASSEUR = 'xlsx';
export const EXTENSION_ANCIEN_CLASSEUR = 'xls';
/** Code d'erreur de read-excel-file pour un ancien classeur binaire. */
export const CODE_ANCIEN_CLASSEUR = 'XLS_FILE_NOT_SUPPORTED';

export const CONSEIL_XLS =
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

/** Message destiné à l'utilisateur quand un classeur ne peut pas être lu. */
export function messageClasseur(erreur: unknown): string {
  if (typeof erreur === 'object' && erreur !== null && 'code' in erreur && erreur.code === CODE_ANCIEN_CLASSEUR) {
    return CONSEIL_XLS;
  }
  const detail = erreur instanceof Error ? erreur.message : 'erreur inconnue';
  return `Ce classeur n'a pas pu être lu (${detail}). Vérifiez qu'il s'ouvre dans Excel et qu'il est bien au format .xlsx.`;
}

/** Message pour un format que l'atelier ne lit pas. */
export function messageFormat(nom: string): string {
  return `Format non pris en charge : « ${nom} ». Formats lus : .xlsx, .csv, .tsv, .txt.`;
}
