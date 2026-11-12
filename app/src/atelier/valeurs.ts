/** Interprétation d'une cellule : est-ce un nombre, une date, un oui/non, du texte ? */

import type { Cellule } from './tableau';

export type Genre = 'vide' | 'nombre' | 'date' | 'booleen' | 'texte';

export type Valeur =
  | { genre: 'vide' }
  | { genre: 'nombre'; nombre: number }
  | { genre: 'date'; iso: string }
  | { genre: 'booleen'; vrai: boolean }
  | { genre: 'texte'; texte: string };

const VIDE: Valeur = { genre: 'vide' };
/** « 1 234 567,89 » : milliers séparés par une espace (ordinaire, insécable ou fine). */
const NOMBRE_GROUPE = /^[+-]?\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?$/;
/** « 1234,5 » ou « 1234.5 ». */
const NOMBRE_SIMPLE = /^[+-]?\d+(?:[.,]\d+)?$/;
/** « 007 », « 0102030405 » : un code ou un numéro de téléphone, pas une quantité. */
const CODE_A_ZERO = /^[+-]?0\d+$/;
const DATE_JOUR_EN_TETE = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
const DATE_ANNEE_EN_TETE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const VRAIS = ['vrai', 'true'];
const FAUX = ['faux', 'false'];

function lireNombre(texte: string): number | null {
  if (CODE_A_ZERO.test(texte) || !(NOMBRE_GROUPE.test(texte) || NOMBRE_SIMPLE.test(texte))) {
    return null;
  }
  const nombre = Number(texte.replaceAll(/[   ]/g, '').replace(',', '.'));
  return Number.isFinite(nombre) ? nombre : null;
}

/** Date au format AAAA-MM-JJ si le jour existe au calendrier, sinon `null`. */
function isoSiValide(annee: number, mois: number, jour: number): string | null {
  const date = new Date(Date.UTC(annee, mois - 1, jour));
  const existe =
    date.getUTCFullYear() === annee && date.getUTCMonth() === mois - 1 && date.getUTCDate() === jour;
  return existe ? date.toISOString().slice(0, 10) : null;
}

function lireDate(texte: string): string | null {
  const jourEnTete = DATE_JOUR_EN_TETE.exec(texte);
  if (jourEnTete !== null) {
    return isoSiValide(Number(jourEnTete[3]), Number(jourEnTete[2]), Number(jourEnTete[1]));
  }
  const anneeEnTete = DATE_ANNEE_EN_TETE.exec(texte);
  if (anneeEnTete !== null) {
    return isoSiValide(Number(anneeEnTete[1]), Number(anneeEnTete[2]), Number(anneeEnTete[3]));
  }
  return null;
}

function interpreterTexte(brut: string): Valeur {
  const texte = brut.trim();
  if (texte === '') {
    return VIDE;
  }
  const nombre = lireNombre(texte);
  if (nombre !== null) {
    return { genre: 'nombre', nombre };
  }
  const iso = lireDate(texte);
  if (iso !== null) {
    return { genre: 'date', iso };
  }
  const minuscules = texte.toLowerCase();
  if (VRAIS.includes(minuscules) || FAUX.includes(minuscules)) {
    return { genre: 'booleen', vrai: VRAIS.includes(minuscules) };
  }
  return { genre: 'texte', texte };
}

/**
 * Interprète une cellule.
 *
 * Règles pour un texte : la virgule est lue comme séparateur décimal (« 1,5 » vaut 1,5) ;
 * les dates lues sont JJ/MM/AAAA, JJ-MM-AAAA et AAAA-MM-JJ ; un code qui commence par
 * zéro reste du texte. Limite connue : « 1,234 » écrit à l'anglaise est lu 1,234 et non 1 234.
 * Post : genre « vide » pour `null`, un texte blanc, un nombre non fini ou une date invalide.
 */
export function interpreter(cellule: Cellule): Valeur {
  if (cellule === null) {
    return VIDE;
  }
  if (typeof cellule === 'string') {
    return interpreterTexte(cellule);
  }
  if (typeof cellule === 'number') {
    return Number.isFinite(cellule) ? { genre: 'nombre', nombre: cellule } : VIDE;
  }
  if (typeof cellule === 'boolean') {
    return { genre: 'booleen', vrai: cellule };
  }
  return Number.isNaN(cellule.getTime()) ? VIDE : { genre: 'date', iso: cellule.toISOString().slice(0, 10) };
}

/** Écrit une cellule comme elle se lit dans le fichier, pour la montrer à l'utilisateur. */
export function afficherCellule(cellule: Cellule): string {
  if (cellule === null) {
    return '';
  }
  if (cellule instanceof Date) {
    return Number.isNaN(cellule.getTime()) ? '' : cellule.toISOString().slice(0, 10);
  }
  if (typeof cellule === 'boolean') {
    return cellule ? 'VRAI' : 'FAUX';
  }
  return String(cellule);
}
