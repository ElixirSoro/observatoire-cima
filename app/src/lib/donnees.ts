/** Types et fonctions de lecture du fichier public/data/observatoire.json. */

export type Statut = 'extrait' | 'verifie';

export interface Observation {
  id_source: string;
  page: number;
  tableau: string;
  pays: string;
  exercice: number;
  entite: string;
  branche: string;
  indicateur: string;
  valeur: number;
  unite: string;
  origine: string;
  statut: Statut;
}

export interface Source {
  id_source: string;
  editeur: string;
  titre: string;
  exercice: number | null;
  url: string;
  acces: string;
  date_consultation: string;
  notes: string;
}

export interface Donnees {
  mis_a_jour_le: string;
  sources: Source[];
  observations: Observation[];
}

export interface Critere {
  indicateur: string;
  exercice: number;
  branche?: string;
  origine?: string;
}

const COLONNES_CSV = [
  'indicateur',
  'exercice',
  'branche',
  'valeur',
  'unite',
  'origine',
  'statut',
  'id_source',
] as const;

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

/** Vérifie la forme du fichier de données. Lève une erreur lisible s'il est incomplet. */
export function validerDonnees(brut: unknown): Donnees {
  if (!estObjet(brut)) {
    throw new Error('Fichier de données illisible : un objet est attendu.');
  }
  const { mis_a_jour_le, sources, observations } = brut;
  if (typeof mis_a_jour_le !== 'string' || !Array.isArray(sources) || !Array.isArray(observations)) {
    throw new Error('Fichier de données incomplet : date, sources ou observations manquantes.');
  }
  if (observations.length === 0) {
    throw new Error('Le fichier de données ne contient aucun chiffre.');
  }
  for (const observation of observations) {
    if (
      !estObjet(observation) ||
      typeof observation.indicateur !== 'string' ||
      typeof observation.valeur !== 'number' ||
      !Number.isFinite(observation.valeur) ||
      typeof observation.id_source !== 'string'
    ) {
      throw new Error('Fichier de données invalide : un chiffre est mal formé.');
    }
  }
  return brut as unknown as Donnees;
}

/** Retourne l'unique observation qui répond au critère, ou undefined. */
export function trouver(observations: readonly Observation[], critere: Critere): Observation | undefined {
  return observations.find(
    (o) =>
      o.indicateur === critere.indicateur &&
      o.exercice === critere.exercice &&
      (critere.branche === undefined || o.branche === critere.branche) &&
      (critere.origine === undefined || o.origine === critere.origine),
  );
}

/** Retourne les observations d'un indicateur, triées par exercice puis par origine. */
export function filtrer(observations: readonly Observation[], indicateur: string): Observation[] {
  return observations
    .filter((o) => o.indicateur === indicateur)
    .sort((a, b) => a.exercice - b.exercice || a.origine.localeCompare(b.origine, 'fr'));
}

export function sourceDe(donnees: Donnees, idSource: string): Source | undefined {
  return donnees.sources.find((s) => s.id_source === idSource);
}

/** Part d'une valeur dans un total, en pourcentage. Lève une erreur si le total est nul. */
export function partEnPourcent(valeur: number, total: number): number {
  if (!Number.isFinite(valeur) || !Number.isFinite(total) || total === 0) {
    throw new Error(`Part incalculable (valeur ${valeur}, total ${total}).`);
  }
  return (valeur / total) * 100;
}

function celluleCsv(valeur: string | number): string {
  const texte = String(valeur);
  return /[",\n;]/.test(texte) ? `"${texte.replaceAll('"', '""')}"` : texte;
}

/** Met les observations au format CSV (séparateur virgule, une ligne d'en-tête). */
export function versCsv(observations: readonly Observation[]): string {
  const lignes = observations.map((o) => COLONNES_CSV.map((c) => celluleCsv(o[c])).join(','));
  return [COLONNES_CSV.join(','), ...lignes].join('\n') + '\n';
}
