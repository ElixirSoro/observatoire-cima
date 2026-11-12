/** Liens de contact : une adresse de courriel et un numéro WhatsApp, sans formulaire. */

export interface Coordonnees {
  /** Adresse de courriel, ou chaîne vide si elle n'est pas encore renseignée. */
  courriel: string;
  /** Numéro WhatsApp au format international (« +225 … »), ou chaîne vide. */
  whatsapp: string;
}

export interface LienContact {
  moyen: 'courriel' | 'whatsapp';
  /** Texte montré au visiteur. */
  libelle: string;
  /** Adresse ouverte au clic. */
  adresse: string;
}

const COURRIEL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHIFFRES_MIN = 8;
const CHIFFRES_MAX = 15;

function lienCourriel(courriel: string): LienContact {
  if (!COURRIEL_VALIDE.test(courriel)) {
    throw new Error(`Adresse de courriel invalide : « ${courriel} ».`);
  }
  return { moyen: 'courriel', libelle: courriel, adresse: `mailto:${courriel}` };
}

function lienWhatsapp(numero: string): LienContact {
  const chiffres = numero.replaceAll(/[\s.-]/g, '');
  const forme = new RegExp(`^\\+\\d{${CHIFFRES_MIN},${CHIFFRES_MAX}}$`);
  if (!forme.test(chiffres)) {
    throw new Error(
      `Numéro WhatsApp invalide : « ${numero} ». Format attendu : +225 suivi du numéro.`,
    );
  }
  return { moyen: 'whatsapp', libelle: numero, adresse: `https://wa.me/${chiffres.slice(1)}` };
}

/**
 * Construit les liens de contact à afficher.
 *
 * Pré : chaque coordonnée est vide ou bien formée.
 * Post : au plus deux liens, courriel d'abord ; liste vide si rien n'est renseigné.
 * Lève : Error si une coordonnée renseignée est mal formée.
 */
export function liensDeContact(coordonnees: Coordonnees): LienContact[] {
  const courriel = coordonnees.courriel.trim();
  const whatsapp = coordonnees.whatsapp.trim();
  const liens: LienContact[] = [];
  if (courriel !== '') {
    liens.push(lienCourriel(courriel));
  }
  if (whatsapp !== '') {
    liens.push(lienWhatsapp(whatsapp));
  }
  return liens;
}
