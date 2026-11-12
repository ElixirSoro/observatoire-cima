/** Lecture d'un fichier texte à séparateurs (CSV) : décodage, choix du séparateur, découpage. */

const SEPARATEURS = [';', ',', '\t'] as const;
export type Separateur = (typeof SEPARATEURS)[number];

const GUILLEMET = '"';
const LIGNES_SONDEES = 10;
const CARACTERES_SONDES = 20_000;
const MARQUE_ORDRE = '﻿';

/**
 * Transforme les octets d'un fichier en texte.
 *
 * Essaie l'UTF-8 ; si le fichier n'est pas de l'UTF-8 valide, le lit en Windows-1252,
 * l'encodage habituel des CSV enregistrés par Excel en français.
 * Post : texte sans marque d'ordre des octets en tête.
 */
export function decoderTexte(octets: Uint8Array): string {
  let texte: string;
  try {
    texte = new TextDecoder('utf-8', { fatal: true }).decode(octets);
  } catch (erreur) {
    if (!(erreur instanceof TypeError)) {
      throw erreur;
    }
    texte = new TextDecoder('windows-1252').decode(octets);
  }
  return texte.startsWith(MARQUE_ORDRE) ? texte.slice(1) : texte;
}

function compterHorsGuillemets(ligne: string, separateur: Separateur): number {
  let nombre = 0;
  let entreGuillemets = false;
  for (const caractere of ligne) {
    if (caractere === GUILLEMET) {
      entreGuillemets = !entreGuillemets;
    } else if (caractere === separateur && !entreGuillemets) {
      nombre += 1;
    }
  }
  return nombre;
}

/**
 * Choisit le séparateur le plus fréquent dans les dix premières lignes.
 * À égalité, l'ordre de préférence est point-virgule, virgule, tabulation.
 * Post : la virgule si aucun séparateur n'apparaît (fichier à une seule colonne).
 */
export function detecterSeparateur(texte: string): Separateur {
  const lignes = texte.slice(0, CARACTERES_SONDES).split(/\r\n|\n|\r/).slice(0, LIGNES_SONDEES);
  let meilleur: Separateur = ',';
  let record = 0;
  for (const separateur of SEPARATEURS) {
    let total = 0;
    for (const ligne of lignes) {
      total += compterHorsGuillemets(ligne, separateur);
    }
    if (total > record) {
      record = total;
      meilleur = separateur;
    }
  }
  return meilleur;
}

/**
 * Découpe un texte CSV en lignes de champs.
 *
 * Pré : texte déjà décodé. Un champ entre guillemets peut contenir le séparateur,
 *       un saut de ligne, ou un guillemet doublé ("").
 * Post : une ligne vide du fichier donne une ligne à un seul champ vide ;
 *        le saut de ligne final n'ajoute pas de ligne.
 * Lève : Error si un guillemet ouvert n'est jamais refermé.
 */
export function lireCsv(texte: string, separateur: Separateur = detecterSeparateur(texte)): string[][] {
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let champ = '';
  let entreGuillemets = false;
  for (let i = 0; i < texte.length; i += 1) {
    const caractere = texte.charAt(i);
    const suivant = texte.charAt(i + 1);
    if (entreGuillemets) {
      if (caractere !== GUILLEMET) {
        champ += caractere;
      } else if (suivant === GUILLEMET) {
        champ += GUILLEMET;
        i += 1;
      } else {
        entreGuillemets = false;
      }
    } else if (caractere === GUILLEMET && champ === '') {
      entreGuillemets = true;
    } else if (caractere === separateur) {
      ligne.push(champ);
      champ = '';
    } else if (caractere === '\n' || caractere === '\r') {
      i += caractere === '\r' && suivant === '\n' ? 1 : 0;
      ligne.push(champ);
      lignes.push(ligne);
      ligne = [];
      champ = '';
    } else {
      champ += caractere;
    }
  }
  if (entreGuillemets) {
    throw new Error('Fichier CSV mal formé : un guillemet est ouvert et jamais refermé.');
  }
  if (champ !== '' || ligne.length > 0) {
    ligne.push(champ);
    lignes.push(ligne);
  }
  return lignes;
}
