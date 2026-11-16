/** Réponses des outils de l'observatoire, écrites en texte pour Claude. */

import { ETATS, libelleIndicateur } from '../../app/src/contenu';
import type { Donnees, Observation } from '../../app/src/lib/donnees';
import { formaterDate, formaterValeur } from '../../app/src/lib/format';
import type { DonneesChargees } from './donnees';

export const LIMITE_DEFAUT = 50;
export const LIMITE_MAX = 200;

export interface Filtre {
  /** Code exact d'un indicateur (« primes_emises »). */
  indicateur?: string;
  exercice?: number;
  /** Branche, sans tenir compte des majuscules ni des accents. */
  branche?: string;
  /** Mots cherchés dans l'indicateur, son nom, la branche, l'organisme et le titre de la source. */
  texte?: string;
  limite?: number;
}

/** Minuscules, sans accents ni espaces superflues : « Non-vie » et « non vie » se rejoignent. */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replaceAll(/[\s_-]+/g, ' ')
    .trim();
}

function texteDe(donnees: Donnees, observation: Observation): string {
  const source = donnees.sources.find((candidate) => candidate.id_source === observation.id_source);
  return normaliser(
    [observation.indicateur, libelleIndicateur(observation.indicateur), observation.branche, observation.origine, source?.titre ?? '']
      .join(' '),
  );
}

function correspond(donnees: Donnees, observation: Observation, filtre: Filtre): boolean {
  if (filtre.indicateur !== undefined && observation.indicateur !== filtre.indicateur) {
    return false;
  }
  if (filtre.exercice !== undefined && observation.exercice !== filtre.exercice) {
    return false;
  }
  if (filtre.branche !== undefined && normaliser(observation.branche) !== normaliser(filtre.branche)) {
    return false;
  }
  if (filtre.texte === undefined) {
    return true;
  }
  const cible = texteDe(donnees, observation);
  return normaliser(filtre.texte)
    .split(' ')
    .filter((mot) => mot !== '')
    .every((mot) => cible.includes(mot));
}

function ligneObservation(donnees: Donnees, observation: Observation): string {
  const source = donnees.sources.find((candidate) => candidate.id_source === observation.id_source);
  const lien = source === undefined ? observation.id_source : `${source.editeur}, « ${source.titre} », p. ${observation.page} — ${source.url}`;
  return [
    `- ${libelleIndicateur(observation.indicateur)} (${observation.indicateur})`,
    `exercice ${observation.exercice}`,
    `branche : ${observation.branche}`,
    `**${formaterValeur(observation.valeur, observation.unite)}**`,
    `chiffre de ${observation.origine}`,
    `statut : ${ETATS[observation.statut]}`,
    `source : ${lien}`,
  ].join(' · ');
}

function entete(chargees: DonneesChargees): string {
  const date = formaterDate(chargees.donnees.mis_a_jour_le);
  return chargees.origine === 'en ligne'
    ? `Données de l'observatoire publiées en ligne, mises à jour le ${date}.`
    : `Copie des données intégrée au serveur (mise à jour du ${date}) : la version en ligne n'a pas pu être lue.`;
}

/**
 * Cherche des chiffres et les écrit avec leur source.
 *
 * Pré : limite, si donnée, entre 1 et 200 (bornes contrôlées par le schéma de l'outil).
 * Post : au plus `limite` chiffres, triés par indicateur, exercice puis branche ; le nombre
 *        total trouvé est toujours indiqué.
 * Lève : Error si la limite est hors bornes.
 */
export function chercherChiffres(chargees: DonneesChargees, filtre: Filtre): string {
  const limite = filtre.limite ?? LIMITE_DEFAUT;
  if (!Number.isInteger(limite) || limite < 1 || limite > LIMITE_MAX) {
    throw new Error(`Limite invalide : ${limite} (attendu : entier de 1 à ${LIMITE_MAX}).`);
  }
  const { donnees } = chargees;
  const trouves = donnees.observations
    .filter((observation) => correspond(donnees, observation, filtre))
    .sort(
      (a, b) =>
        a.indicateur.localeCompare(b.indicateur) || a.exercice - b.exercice || a.branche.localeCompare(b.branche, 'fr'),
    );
  if (trouves.length === 0) {
    return `${entete(chargees)}\n\nAucun chiffre ne correspond à cette recherche. L'outil observatoire_indicateurs donne la liste des indicateurs disponibles.`;
  }
  const affiches = trouves.slice(0, limite);
  const compte =
    affiches.length < trouves.length
      ? `${trouves.length} chiffres trouvés, ${affiches.length} affichés (augmenter « limite » pour voir la suite).`
      : `${trouves.length} ${trouves.length > 1 ? 'chiffres trouvés' : 'chiffre trouvé'}.`;
  return [entete(chargees), compte, '', ...affiches.map((observation) => ligneObservation(donnees, observation))].join('\n');
}

/** Liste les indicateurs disponibles, avec leurs unités, branches et exercices. */
export function listerIndicateurs(chargees: DonneesChargees): string {
  const groupes = new Map<string, Observation[]>();
  for (const observation of chargees.donnees.observations) {
    groupes.set(observation.indicateur, [...(groupes.get(observation.indicateur) ?? []), observation]);
  }
  const lignes = [...groupes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([indicateur, observations]) => {
      const exercices = [...new Set(observations.map((o) => o.exercice))].sort((a, b) => a - b).join(', ');
      const branches = [...new Set(observations.map((o) => o.branche))].sort((a, b) => a.localeCompare(b, 'fr')).join(', ');
      const unites = [...new Set(observations.map((o) => o.unite))].join(', ');
      return `- ${indicateur} — ${libelleIndicateur(indicateur)} · unité : ${unites} · exercices : ${exercices} · branches : ${branches} · ${observations.length} chiffre(s)`;
    });
  return [entete(chargees), `${groupes.size} indicateurs, pays : Côte d'Ivoire.`, '', ...lignes].join('\n');
}

/** Liste le registre des sources. */
export function listerSources(chargees: DonneesChargees): string {
  const lignes = chargees.donnees.sources.map((source) => {
    const exercice = source.exercice === null ? 'exercice non précisé' : `exercice ${source.exercice}`;
    return `- ${source.id_source} : ${source.editeur}, « ${source.titre} » (${exercice}) — ${source.url} · consulté le ${formaterDate(source.date_consultation)}${source.notes === '' ? '' : ` · ${source.notes}`}`;
  });
  return [entete(chargees), `${chargees.donnees.sources.length} sources au registre.`, '', ...lignes].join('\n');
}
