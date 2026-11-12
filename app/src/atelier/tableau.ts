/** Le tableau lu dans un fichier : une ligne d'en-têtes, puis des lignes de cellules. */

/** Une cellule telle qu'elle sort du fichier. `null` : cellule vide. */
export type Cellule = string | number | boolean | Date | null;

export interface Provenance {
  /** Nom du fichier. */
  nom: string;
  /** Nom de la feuille lue, pour un classeur ; `null` pour un fichier texte. */
  feuille: string | null;
  /** Noms des feuilles du classeur qui n'ont pas été lues. */
  autresFeuilles: string[];
}

export interface Tableau extends Provenance {
  entetes: string[];
  /** Numéros (à partir de 1) des colonnes dont l'en-tête était vide dans le fichier. */
  entetesAbsentes: number[];
  /** Les lignes de données : toutes ont autant de cellules qu'il y a d'en-têtes. */
  lignes: Cellule[][];
}

export const LIMITES = {
  octetsMax: 20 * 1024 * 1024,
  lignesMax: 200_000,
  colonnesMax: 500,
} as const;

/** Numéro, dans le fichier, de la première ligne de données (la ligne 1 porte les en-têtes). */
export const PREMIERE_LIGNE_DE_DONNEES = 2;

function nettoyer(cellule: Cellule | undefined): Cellule {
  if (cellule === undefined || cellule === null) {
    return null;
  }
  if (typeof cellule === 'string') {
    return cellule.trim() === '' ? null : cellule;
  }
  if (typeof cellule === 'number') {
    return Number.isFinite(cellule) ? cellule : null;
  }
  if (cellule instanceof Date) {
    return Number.isNaN(cellule.getTime()) ? null : cellule;
  }
  return cellule;
}

function largeurDe(brut: readonly (readonly Cellule[])[]): number {
  let largeur = 0;
  for (const ligne of brut) {
    largeur = Math.max(largeur, ligne.length);
  }
  return largeur;
}

function texteEntete(cellule: Cellule): string {
  if (cellule instanceof Date) {
    return cellule.toISOString().slice(0, 10);
  }
  return String(cellule).trim();
}

/**
 * Met en forme les lignes brutes d'un fichier : première ligne en en-têtes, lignes de même largeur.
 *
 * Pré : brut contient au moins une ligne ; au plus 200 000 lignes de données et 500 colonnes.
 * Post : chaque ligne a `entetes.length` cellules ; une cellule blanche vaut `null` ;
 *        un en-tête vide est remplacé par « Colonne N » et signalé dans `entetesAbsentes`.
 * Lève : Error si le fichier est vide ou dépasse une limite. Ne modifie pas `brut`.
 */
export function construireTableau(brut: readonly (readonly Cellule[])[], provenance: Provenance): Tableau {
  const premiere = brut[0];
  const largeur = largeurDe(brut);
  if (premiere === undefined || largeur === 0) {
    throw new Error('Le fichier est vide : aucune ligne à lire.');
  }
  if (largeur > LIMITES.colonnesMax) {
    throw new Error(`Le fichier a ${largeur} colonnes ; la limite est de ${LIMITES.colonnesMax}.`);
  }
  if (brut.length - 1 > LIMITES.lignesMax) {
    throw new Error(`Le fichier a ${brut.length - 1} lignes ; la limite est de ${LIMITES.lignesMax}.`);
  }
  const entetes: string[] = [];
  const entetesAbsentes: number[] = [];
  for (let colonne = 0; colonne < largeur; colonne += 1) {
    const cellule = nettoyer(premiere[colonne]);
    if (cellule === null) {
      entetesAbsentes.push(colonne + 1);
    }
    entetes.push(cellule === null ? `Colonne ${colonne + 1}` : texteEntete(cellule));
  }
  const lignes = brut
    .slice(1)
    .map((ligne) => Array.from({ length: largeur }, (_, colonne) => nettoyer(ligne[colonne])));
  return { ...provenance, entetes, entetesAbsentes, lignes };
}
