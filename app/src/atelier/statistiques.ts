/** Statistiques descriptives d'une colonne. */

export interface ResumeNombres {
  effectif: number;
  minimum: number;
  maximum: number;
  moyenne: number;
  mediane: number;
  quartile1: number;
  quartile3: number;
  /** Écart-type de l'échantillon (division par n − 1) ; `null` s'il n'y a qu'une valeur. */
  ecartType: number | null;
}

export interface ResumeTextes {
  effectif: number;
  distinctes: number;
  /** Les valeurs les plus fréquentes, de la plus fréquente à la moins fréquente. */
  frequentes: { valeur: string; effectif: number }[];
}

export interface ResumeDates {
  effectif: number;
  /** Première et dernière date, au format AAAA-MM-JJ. */
  premiere: string;
  derniere: string;
}

const FREQUENTES_MAX = 5;

function exigerNonVide(valeurs: readonly unknown[], quoi: string): void {
  if (valeurs.length === 0) {
    throw new Error(`Aucune valeur à résumer (${quoi}).`);
  }
}

/**
 * Quantile par interpolation linéaire entre les deux valeurs voisines
 * (méthode par défaut de numpy et d'Excel, dite « type 7 »).
 *
 * Pré : tri est trié par ordre croissant et non vide ; 0 ≤ p ≤ 1.
 * Lève : Error si tri est vide ou p hors de [0, 1].
 */
export function quantile(tri: readonly number[], p: number): number {
  exigerNonVide(tri, 'quantile');
  if (!(p >= 0 && p <= 1)) {
    throw new Error(`Quantile demandé hors de [0, 1] : ${p}.`);
  }
  const position = (tri.length - 1) * p;
  const bas = Math.floor(position);
  const valeurBasse = tri[bas];
  const valeurHaute = tri[Math.min(bas + 1, tri.length - 1)];
  if (valeurBasse === undefined || valeurHaute === undefined) {
    throw new Error(`Quantile incalculable à la position ${position}.`);
  }
  return valeurBasse + (valeurHaute - valeurBasse) * (position - bas);
}

/**
 * Résume une série de nombres.
 *
 * Pré : au moins une valeur ; toutes finies.
 * Post : minimum ≤ quartile1 ≤ mediane ≤ quartile3 ≤ maximum. Ne modifie pas `valeurs`.
 * Lève : Error si la série est vide ou contient une valeur non finie.
 */
export function resumerNombres(valeurs: readonly number[]): ResumeNombres {
  exigerNonVide(valeurs, 'nombres');
  if (!valeurs.every((valeur) => Number.isFinite(valeur))) {
    throw new Error('La série contient une valeur qui n’est pas un nombre fini.');
  }
  const tri = [...valeurs].sort((a, b) => a - b);
  const effectif = tri.length;
  const moyenne = tri.reduce((somme, valeur) => somme + valeur, 0) / effectif;
  const carres = tri.reduce((somme, valeur) => somme + (valeur - moyenne) ** 2, 0);
  return {
    effectif,
    minimum: quantile(tri, 0),
    maximum: quantile(tri, 1),
    moyenne,
    mediane: quantile(tri, 0.5),
    quartile1: quantile(tri, 0.25),
    quartile3: quantile(tri, 0.75),
    ecartType: effectif > 1 ? Math.sqrt(carres / (effectif - 1)) : null,
  };
}

/**
 * Résume une série de textes : nombre de valeurs distinctes et valeurs les plus fréquentes.
 * À effectif égal, l'ordre alphabétique départage.
 * Lève : Error si la série est vide.
 */
export function resumerTextes(valeurs: readonly string[]): ResumeTextes {
  exigerNonVide(valeurs, 'textes');
  const effectifs = new Map<string, number>();
  for (const valeur of valeurs) {
    effectifs.set(valeur, (effectifs.get(valeur) ?? 0) + 1);
  }
  const frequentes = [...effectifs.entries()]
    .map(([valeur, effectif]) => ({ valeur, effectif }))
    .sort((a, b) => b.effectif - a.effectif || a.valeur.localeCompare(b.valeur, 'fr'))
    .slice(0, FREQUENTES_MAX);
  return { effectif: valeurs.length, distinctes: effectifs.size, frequentes };
}

/**
 * Résume une série de dates au format AAAA-MM-JJ.
 * Lève : Error si la série est vide.
 */
export function resumerDates(valeurs: readonly string[]): ResumeDates {
  exigerNonVide(valeurs, 'dates');
  const tri = [...valeurs].sort();
  const premiere = tri[0];
  const derniere = tri.at(-1);
  if (premiere === undefined || derniere === undefined) {
    throw new Error('Dates introuvables après le tri.');
  }
  return { effectif: tri.length, premiere, derniere };
}
