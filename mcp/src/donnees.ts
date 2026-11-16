/**
 * Les chiffres de l'observatoire : la version publiée en ligne si elle répond,
 * sinon la copie intégrée au serveur au moment de sa construction.
 */

import copieIntegree from '../../app/public/data/observatoire.json';
import { type Donnees, validerDonnees } from '../../app/src/lib/donnees';

/** Adresse publique du fichier de données de l'observatoire. */
export const ADRESSE_DONNEES = 'https://elixirsoro.github.io/observatoire-cima/data/observatoire.json';

const DELAI_MS = 5_000;
const DUREE_CACHE_MS = 60 * 60 * 1_000;

export interface DonneesChargees {
  donnees: Donnees;
  /** « en ligne » : fichier publié, lu à l'instant ; « copie » : copie intégrée au serveur. */
  origine: 'en ligne' | 'copie';
}

export type Chargeur = () => Promise<DonneesChargees>;

/** La copie intégrée, vérifiée. Lève une erreur si elle est mal formée. */
export function copie(): DonneesChargees {
  return { donnees: validerDonnees(copieIntegree), origine: 'copie' };
}

async function lireEnLigne(adresse: string): Promise<Donnees> {
  const reponse = await fetch(adresse, { signal: AbortSignal.timeout(DELAI_MS) });
  if (!reponse.ok) {
    throw new Error(`Réponse ${reponse.status} pour ${adresse}`);
  }
  return validerDonnees(await reponse.json());
}

/**
 * Crée un chargeur qui garde les données une heure en mémoire.
 *
 * Post : ne lève jamais d'erreur réseau : si la lecture en ligne échoue (absence de réseau,
 *        délai de 5 s dépassé, fichier mal formé), la copie intégrée est utilisée.
 * Lève : Error seulement si la copie intégrée elle-même est mal formée.
 */
export function creerChargeur(adresse: string = ADRESSE_DONNEES, maintenant: () => number = Date.now): Chargeur {
  let enCache: { valeur: DonneesChargees; depuis: number } | null = null;
  return async () => {
    if (enCache !== null && maintenant() - enCache.depuis < DUREE_CACHE_MS) {
      return enCache.valeur;
    }
    let valeur: DonneesChargees;
    try {
      valeur = { donnees: await lireEnLigne(adresse), origine: 'en ligne' };
    } catch (erreur) {
      if (!(erreur instanceof Error)) {
        throw erreur;
      }
      valeur = copie();
    }
    enCache = { valeur, depuis: maintenant() };
    return valeur;
  };
}
