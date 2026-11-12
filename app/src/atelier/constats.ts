/** Les défauts trouvés par le contrôle de qualité, écrits en phrases. */

import { formaterNombre } from '../lib/format';
import type { Genre } from './valeurs';
import type { ProfilColonne, RapportQualite } from './qualite';

export interface Constat {
  /** « attention » : un défaut à corriger ; « information » : à savoir, sans gravité. */
  niveau: 'attention' | 'information';
  texte: string;
}

const NOMS_GENRE: Record<Genre, string> = {
  nombre: 'un nombre',
  date: 'une date',
  booleen: 'un vrai ou faux',
  texte: 'un texte',
  vide: 'vide',
};

function accorder(nombre: number, singulier: string, pluriel: string): string {
  return `${formaterNombre(nombre)} ${nombre > 1 ? pluriel : singulier}`;
}

/** « 4 », « 4 et 9 », « 4, 9 et 12 ». */
function enumerer(elements: readonly string[]): string {
  if (elements.length <= 1) {
    return elements.join('');
  }
  return `${elements.slice(0, -1).join(', ')} et ${elements.at(-1) ?? ''}`;
}

/** Ajoute « et N autres » quand tous les cas ne sont pas cités. */
function avecReste(cites: readonly string[], total: number): string {
  const reste = total - cites.length;
  return reste > 0 ? `${cites.join(', ')} et ${accorder(reste, 'autre', 'autres')}` : enumerer(cites);
}

function constatsEntetes(rapport: RapportQualite): Constat[] {
  const constats: Constat[] = [];
  if (rapport.entetesAbsentes.length > 0) {
    const numeros = enumerer(rapport.entetesAbsentes.map(String));
    constats.push({
      niveau: 'attention',
      texte: `${accorder(rapport.entetesAbsentes.length, 'colonne n’a pas de nom', 'colonnes n’ont pas de nom')} dans la première ligne (colonne ${numeros}). Un nom provisoire lui est donné ici.`,
    });
  }
  if (rapport.entetesEnDouble.length > 0) {
    const noms = enumerer(rapport.entetesEnDouble.map((nom) => `« ${nom} »`));
    constats.push({
      niveau: 'attention',
      texte: `Un même nom de colonne est utilisé plusieurs fois : ${noms}.`,
    });
  }
  return constats;
}

function constatsLignes(rapport: RapportQualite): Constat[] {
  const constats: Constat[] = [];
  const { lignesVides, doublons } = rapport;
  if (lignesVides.nombre > 0) {
    const lignes = avecReste(lignesVides.exemples.map(String), lignesVides.nombre);
    constats.push({
      niveau: 'attention',
      texte: `${accorder(lignesVides.nombre, 'ligne est entièrement vide', 'lignes sont entièrement vides')} (ligne ${lignes}).`,
    });
  }
  if (doublons.nombre > 0) {
    const cas = doublons.exemples.map((doublon) => `la ligne ${doublon.ligne} répète la ligne ${doublon.premiere}`);
    constats.push({
      niveau: 'attention',
      texte: `${accorder(doublons.nombre, 'ligne répète', 'lignes répètent')} une ligne déjà présente : ${avecReste(cas, doublons.nombre)}.`,
    });
  }
  return constats;
}

function constatsColonne(colonne: ProfilColonne): Constat[] {
  const constats: Constat[] = [];
  const total = colonne.remplies + colonne.vides;
  if (colonne.genre === 'vide') {
    return total === 0 ? [] : [{ niveau: 'attention', texte: `Colonne « ${colonne.nom} » : entièrement vide.` }];
  }
  if (colonne.nombreDiscordantes > 0) {
    const cas = colonne.discordances.map((exemple) => `ligne ${exemple.ligne} : « ${exemple.valeur} »`);
    constats.push({
      niveau: 'attention',
      texte: `Colonne « ${colonne.nom} » : ${accorder(colonne.nombreDiscordantes, 'valeur n’est pas', 'valeurs ne sont pas')} ${NOMS_GENRE[colonne.genre]} (${avecReste(cas, colonne.nombreDiscordantes)}).`,
    });
  }
  if (colonne.vides > 0) {
    const part = formaterNombre((colonne.vides / total) * 100, 1);
    constats.push({
      niveau: 'attention',
      texte: `Colonne « ${colonne.nom} » : ${accorder(colonne.vides, 'cellule vide', 'cellules vides')} sur ${formaterNombre(total)} (${part} %).`,
    });
  }
  return constats;
}

/**
 * Écrit en phrases les défauts d'un rapport de qualité, du plus général au plus précis :
 * en-têtes, lignes, puis colonne par colonne.
 * Post : liste vide si aucun défaut n'a été trouvé.
 */
export function redigerConstats(rapport: RapportQualite): Constat[] {
  const constats = [
    ...constatsEntetes(rapport),
    ...constatsLignes(rapport),
    ...rapport.colonnes.flatMap(constatsColonne),
  ];
  if (rapport.espacesEnTrop > 0) {
    constats.push({
      niveau: 'information',
      texte: `${accorder(rapport.espacesEnTrop, 'cellule de texte commence ou finit', 'cellules de texte commencent ou finissent')} par une espace.`,
    });
  }
  return constats;
}
