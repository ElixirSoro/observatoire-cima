/** Lecture d'un fichier choisi par l'utilisateur. Le fichier reste dans le navigateur. */

import { decoderTexte, lireCsv } from './csv';
import {
  CONSEIL_XLS,
  EXTENSION_ANCIEN_CLASSEUR,
  EXTENSION_CLASSEUR,
  EXTENSIONS_TEXTE,
  extensionDe,
  messageClasseur,
  messageFormat,
  versCellule,
} from './formats';
import { construireTableau, LIMITES, type Tableau } from './tableau';

const OCTETS_PAR_MO = 1024 * 1024;

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
  throw new Error(messageFormat(fichier.name));
}
