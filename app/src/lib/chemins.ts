/**
 * Adresses des pages du site.
 *
 * Le site est fait de fichiers statiques : la page « offres » est le fichier offres/index.html.
 * La racine du site se déduit de l'adresse affichée, sans réglage propre à l'hébergeur :
 * le site fonctionne à la racine d'un domaine comme dans un sous-dossier.
 */

export interface Emplacement {
  /** Adresse du dossier racine du site, toujours terminée par « / ». */
  racine: string;
  /** Segment de la page affichée ; chaîne vide pour la page d'accueil. */
  segment: string;
}

const LONGUEUR_MAX_CHEMIN = 2048;
const FICHIER_INDEX = 'index.html';
const SEGMENT_VALIDE = /^[a-z0-9-]+$/;

function exigerSegmentsValides(segments: readonly string[]): void {
  for (const segment of segments) {
    if (!SEGMENT_VALIDE.test(segment)) {
      throw new Error(
        `Segment de page invalide « ${segment} » : lettres minuscules, chiffres et tirets attendus.`,
      );
    }
  }
}

/**
 * Sépare un chemin d'adresse en racine du site et segment de page.
 *
 * Pré : chemin commence par « / » et fait au plus 2 048 caractères ; segments non vides.
 * Post : racine commence et finit par « / » ; segment vaut « » ou l'un des segments reçus.
 * Lève : Error si le chemin ou un segment est invalide.
 * Limite connue : un site hébergé dans un dossier qui porte le nom d'une page
 * (par exemple /offres/) serait pris pour cette page.
 */
export function lireChemin(chemin: string, segments: readonly string[]): Emplacement {
  if (!chemin.startsWith('/') || chemin.length > LONGUEUR_MAX_CHEMIN) {
    throw new Error(`Chemin d'adresse invalide : « ${chemin.slice(0, 80)} ».`);
  }
  exigerSegmentsValides(segments);

  const sansIndex = chemin.endsWith(FICHIER_INDEX) ? chemin.slice(0, -FICHIER_INDEX.length) : chemin;
  const dossier = sansIndex.endsWith('/') ? sansIndex : `${sansIndex}/`;
  const parties = dossier.split('/');
  // « /a/offres/ » se découpe en ['', 'a', 'offres', ''] : la page est l'avant-dernier élément.
  const dernier = parties.at(-2) ?? '';
  if (!segments.includes(dernier)) {
    return { racine: dossier, segment: '' };
  }
  const racine = dossier.slice(0, dossier.length - dernier.length - 1);
  if (!racine.endsWith('/')) {
    throw new Error(`Racine du site introuvable dans « ${chemin.slice(0, 80)} ».`);
  }
  return { racine, segment: dernier };
}

/**
 * Adresse d'une page à partir de la racine du site.
 *
 * Pré : racine commence et finit par « / » ; segment vide ou valide.
 * Post : adresse terminée par « / ».
 * Lève : Error si la racine ou le segment est invalide.
 */
export function adresseDe(racine: string, segment: string): string {
  if (!racine.startsWith('/') || !racine.endsWith('/')) {
    throw new Error(`Racine du site invalide : « ${racine} ».`);
  }
  if (segment === '') {
    return racine;
  }
  exigerSegmentsValides([segment]);
  return `${racine}${segment}/`;
}
