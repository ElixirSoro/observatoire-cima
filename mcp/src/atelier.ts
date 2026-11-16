/** Rapport de l'atelier, écrit en texte pour Claude. */

import { redigerConstats } from '../../app/src/atelier/constats';
import { decrireResume } from '../../app/src/atelier/libelles';
import { controlerQualite } from '../../app/src/atelier/qualite';
import type { Tableau } from '../../app/src/atelier/tableau';
import { formaterNombre } from '../../app/src/lib/format';

const NOMS_GENRE = { nombre: 'nombres', date: 'dates', texte: 'texte', booleen: 'vrai ou faux', vide: 'vide' } as const;

/**
 * Contrôle un tableau et écrit son rapport : mesures, défauts trouvés, profil des colonnes.
 * Post : texte non vide ; reprend les mêmes contrôles et les mêmes phrases que l'atelier du site.
 */
export function rapportFichier(tableau: Tableau): string {
  const rapport = controlerQualite(tableau);
  const constats = redigerConstats(rapport);
  const remplissage = rapport.tauxRemplissage === null ? '—' : `${formaterNombre(rapport.tauxRemplissage, 1)} %`;
  const origine = [
    `Fichier : ${tableau.nom}`,
    tableau.feuille === null ? null : `feuille lue : ${tableau.feuille}`,
    tableau.autresFeuilles.length === 0 ? null : `feuilles non lues : ${tableau.autresFeuilles.join(', ')}`,
  ].filter((partie) => partie !== null);
  const colonnes = rapport.colonnes.map((colonne) => {
    const total = colonne.remplies + colonne.vides;
    const part = total === 0 ? '—' : `${formaterNombre((colonne.remplies / total) * 100, 1)} %`;
    return `- ${colonne.nom} · ${NOMS_GENRE[colonne.genre]} · remplie à ${part} · ${decrireResume(colonne.resume)}`;
  });
  return [
    origine.join(' · '),
    `Mesures : ${formaterNombre(rapport.nombreLignes)} lignes de données (la ligne 1 porte les noms de colonnes), ${formaterNombre(rapport.nombreColonnes)} colonnes, ${remplissage} de cellules remplies, ${formaterNombre(rapport.doublons.nombre)} ligne(s) en double.`,
    '',
    'Défauts trouvés :',
    ...(constats.length === 0
      ? ['- Aucun défaut trouvé par ces contrôles.']
      : constats.map((constat) => `- [${constat.niveau === 'attention' ? 'à corriger' : 'à savoir'}] ${constat.texte}`)),
    '',
    'Colonne par colonne :',
    ...colonnes,
    '',
    "Limites : une valeur fausse mais bien écrite n'est pas détectée ; les doublons approchés non plus ; seule la première feuille d'un classeur est lue ; la virgule est lue comme séparateur décimal.",
  ].join('\n');
}
