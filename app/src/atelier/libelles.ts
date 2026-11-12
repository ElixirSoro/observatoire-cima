/** Phrases courtes qui résument une colonne. */

import { formaterDate, formaterNombre } from '../lib/format';
import type { Resume } from './qualite';

const DECIMALES_MOYENNE = 2;

/**
 * Résume en une ligne les statistiques d'une colonne.
 * Post : texte non vide, sans retour à la ligne.
 */
export function decrireResume(resume: Resume): string {
  switch (resume.genre) {
    case 'nombre': {
      const { minimum, maximum, moyenne, mediane } = resume.nombres;
      return `de ${formaterNombre(minimum)} à ${formaterNombre(maximum)} · moyenne ${formaterNombre(moyenne, DECIMALES_MOYENNE)} · médiane ${formaterNombre(mediane, DECIMALES_MOYENNE)}`;
    }
    case 'date':
      return `du ${formaterDate(resume.dates.premiere)} au ${formaterDate(resume.dates.derniere)}`;
    case 'texte': {
      const premiere = resume.textes.frequentes[0];
      const distinctes = `${formaterNombre(resume.textes.distinctes)} ${resume.textes.distinctes > 1 ? 'valeurs distinctes' : 'valeur distincte'}`;
      return premiere === undefined
        ? distinctes
        : `${distinctes} · la plus fréquente : « ${premiere.valeur} » (${formaterNombre(premiere.effectif)} fois)`;
    }
    case 'booleen':
      return `${formaterNombre(resume.vrais)} vrai, ${formaterNombre(resume.faux)} faux`;
    case 'vide':
      return 'aucune valeur';
  }
}
