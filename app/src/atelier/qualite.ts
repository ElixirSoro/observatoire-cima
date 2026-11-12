/** Rapport de qualité d'un tableau : lignes vides, doublons, cellules vides, colonnes incohérentes. */

import {
  type ResumeDates,
  type ResumeNombres,
  type ResumeTextes,
  resumerDates,
  resumerNombres,
  resumerTextes,
} from './statistiques';
import { type Cellule, PREMIERE_LIGNE_DE_DONNEES, type Tableau } from './tableau';
import { afficherCellule, type Genre, interpreter, type Valeur } from './valeurs';

/** Nombre d'exemples gardés pour chaque défaut : assez pour le retrouver, sans tout lister. */
export const EXEMPLES_MAX = 5;

/** À égalité de fréquence, le genre retenu est le premier de cette liste. */
const PRIORITE: readonly Exclude<Genre, 'vide'>[] = ['texte', 'nombre', 'date', 'booleen'];

export interface Discordance {
  /** Numéro de la ligne dans le fichier. */
  ligne: number;
  valeur: string;
}

export type Resume =
  | { genre: 'nombre'; nombres: ResumeNombres }
  | { genre: 'date'; dates: ResumeDates }
  | { genre: 'texte'; textes: ResumeTextes }
  | { genre: 'booleen'; vrais: number; faux: number }
  | { genre: 'vide' };

export interface ProfilColonne {
  nom: string;
  /** Genre le plus fréquent parmi les cellules remplies ; « vide » si la colonne est vide. */
  genre: Genre;
  remplies: number;
  vides: number;
  /** Cellules remplies dont le genre n'est pas celui de la colonne (colonnes non textuelles). */
  nombreDiscordantes: number;
  discordances: Discordance[];
  resume: Resume;
}

export interface Doublon {
  ligne: number;
  /** Ligne du fichier où la même ligne apparaît pour la première fois. */
  premiere: number;
}

export interface RapportQualite {
  /** Lignes de données, lignes vides comprises. */
  nombreLignes: number;
  nombreColonnes: number;
  lignesVides: { nombre: number; exemples: number[] };
  doublons: { nombre: number; exemples: Doublon[] };
  entetesAbsentes: number[];
  entetesEnDouble: string[];
  colonnes: ProfilColonne[];
  /** Cellules vides, hors lignes entièrement vides. */
  cellulesVides: number;
  /** Part des cellules remplies, en pourcentage ; `null` s'il n'y a aucune cellule. */
  tauxRemplissage: number | null;
  /** Cellules de texte qui commencent ou finissent par une espace. */
  espacesEnTrop: number;
}

interface LignePleine {
  numero: number;
  cellules: readonly Cellule[];
}

function genreDominant(valeurs: readonly Valeur[]): Genre {
  const effectifs = new Map<Genre, number>();
  for (const valeur of valeurs) {
    effectifs.set(valeur.genre, (effectifs.get(valeur.genre) ?? 0) + 1);
  }
  let dominant: Genre = 'vide';
  let record = 0;
  for (const genre of PRIORITE) {
    const effectif = effectifs.get(genre) ?? 0;
    if (effectif > record) {
      record = effectif;
      dominant = genre;
    }
  }
  return dominant;
}

function resumer(genre: Genre, valeurs: readonly Valeur[], cellules: readonly Cellule[]): Resume {
  if (genre === 'nombre') {
    const nombres = valeurs.flatMap((valeur) => (valeur.genre === 'nombre' ? [valeur.nombre] : []));
    return { genre, nombres: resumerNombres(nombres) };
  }
  if (genre === 'date') {
    const dates = valeurs.flatMap((valeur) => (valeur.genre === 'date' ? [valeur.iso] : []));
    return { genre, dates: resumerDates(dates) };
  }
  if (genre === 'booleen') {
    const vrais = valeurs.filter((valeur) => valeur.genre === 'booleen' && valeur.vrai).length;
    const faux = valeurs.filter((valeur) => valeur.genre === 'booleen' && !valeur.vrai).length;
    return { genre, vrais, faux };
  }
  if (genre === 'texte') {
    const textes = cellules.flatMap((cellule) => (cellule === null ? [] : [afficherCellule(cellule).trim()]));
    return { genre, textes: resumerTextes(textes) };
  }
  return { genre: 'vide' };
}

/**
 * Décrit une colonne : genre, remplissage, cellules discordantes, statistiques.
 *
 * Pré : `cellules` et `numeros` ont la même longueur ; `numeros` donne la ligne du fichier
 *       de chaque cellule.
 * Post : remplies + vides = cellules.length ; nombreDiscordantes ≤ remplies.
 * Lève : Error si les longueurs diffèrent.
 */
export function profilerColonne(
  nom: string,
  cellules: readonly Cellule[],
  numeros: readonly number[],
): ProfilColonne {
  if (cellules.length !== numeros.length) {
    throw new Error(`Colonne « ${nom} » : ${cellules.length} cellules pour ${numeros.length} numéros de ligne.`);
  }
  const valeurs = cellules.map(interpreter);
  const genre = genreDominant(valeurs);
  const vides = valeurs.filter((valeur) => valeur.genre === 'vide').length;
  const discordances: Discordance[] = [];
  let nombreDiscordantes = 0;
  valeurs.forEach((valeur, rang) => {
    if (genre === 'texte' || valeur.genre === 'vide' || valeur.genre === genre) {
      return;
    }
    nombreDiscordantes += 1;
    if (discordances.length < EXEMPLES_MAX) {
      discordances.push({ ligne: numeros[rang] ?? 0, valeur: afficherCellule(cellules[rang] ?? null) });
    }
  });
  return {
    nom,
    genre,
    remplies: cellules.length - vides,
    vides,
    nombreDiscordantes,
    discordances,
    resume: resumer(genre, valeurs, cellules),
  };
}

function chercherDoublons(lignes: readonly LignePleine[]): RapportQualite['doublons'] {
  const premieres = new Map<string, number>();
  const exemples: Doublon[] = [];
  let nombre = 0;
  for (const ligne of lignes) {
    const cle = JSON.stringify(ligne.cellules);
    const premiere = premieres.get(cle);
    if (premiere === undefined) {
      premieres.set(cle, ligne.numero);
    } else {
      nombre += 1;
      if (exemples.length < EXEMPLES_MAX) {
        exemples.push({ ligne: ligne.numero, premiere });
      }
    }
  }
  return { nombre, exemples };
}

function entetesRepetees(entetes: readonly string[]): string[] {
  const vues = new Set<string>();
  const repetees = new Set<string>();
  for (const entete of entetes) {
    if (vues.has(entete)) {
      repetees.add(entete);
    }
    vues.add(entete);
  }
  return [...repetees];
}

function compterEspacesEnTrop(lignes: readonly LignePleine[]): number {
  let nombre = 0;
  for (const ligne of lignes) {
    for (const cellule of ligne.cellules) {
      if (typeof cellule === 'string' && cellule !== cellule.trim()) {
        nombre += 1;
      }
    }
  }
  return nombre;
}

/**
 * Contrôle la qualité d'un tableau.
 *
 * Pré : tableau produit par `construireTableau` (lignes de même largeur que les en-têtes).
 * Post : les colonnes sont décrites sur les lignes non vides ; pour chaque colonne,
 *        remplies + vides = nombreLignes − lignesVides.nombre. Ne modifie pas le tableau.
 */
export function controlerQualite(tableau: Tableau): RapportQualite {
  const pleines: LignePleine[] = [];
  const numerosVides: number[] = [];
  tableau.lignes.forEach((cellules, rang) => {
    const numero = rang + PREMIERE_LIGNE_DE_DONNEES;
    if (cellules.every((cellule) => cellule === null)) {
      numerosVides.push(numero);
    } else {
      pleines.push({ numero, cellules });
    }
  });
  const numeros = pleines.map((ligne) => ligne.numero);
  const colonnes = tableau.entetes.map((nom, colonne) =>
    profilerColonne(nom, pleines.map((ligne) => ligne.cellules[colonne] ?? null), numeros),
  );
  const cellulesVides = colonnes.reduce((somme, colonne) => somme + colonne.vides, 0);
  const cellules = pleines.length * tableau.entetes.length;
  return {
    nombreLignes: tableau.lignes.length,
    nombreColonnes: tableau.entetes.length,
    lignesVides: { nombre: numerosVides.length, exemples: numerosVides.slice(0, EXEMPLES_MAX) },
    doublons: chercherDoublons(pleines),
    entetesAbsentes: [...tableau.entetesAbsentes],
    entetesEnDouble: entetesRepetees(tableau.entetes),
    colonnes,
    cellulesVides,
    tauxRemplissage: cellules === 0 ? null : ((cellules - cellulesVides) / cellules) * 100,
    espacesEnTrop: compterEspacesEnTrop(pleines),
  };
}
