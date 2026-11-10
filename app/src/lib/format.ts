/** Mise en forme des nombres et des dates, à la française. */

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

const DECIMALES_MAX = 3;

/** « 688,8 », « 1 233 », « 628,042 » : au plus trois décimales, jamais d'arrondi caché. */
export function formaterNombre(valeur: number, decimalesMax: number = DECIMALES_MAX): string {
  if (!Number.isFinite(valeur)) {
    throw new Error(`Nombre non fini : ${valeur}`);
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimalesMax }).format(valeur);
}

/** « 688,8 milliards FCFA », « 1,2 % », « 22 ». */
export function formaterValeur(valeur: number, unite: string): string {
  const nombre = formaterNombre(valeur);
  if (unite === 'nombre') {
    return nombre;
  }
  return unite === '%' ? `${nombre} %` : `${nombre} ${unite}`;
}

/** « 2026-11-10 » devient « 10 novembre 2026 ». */
export function formaterDate(iso: string): string {
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (correspondance === null) {
    throw new Error(`Date attendue au format AAAA-MM-JJ (reçu « ${iso} »).`);
  }
  const [, annee, mois, jour] = correspondance;
  const nomMois = MOIS[Number(mois) - 1];
  if (nomMois === undefined) {
    throw new Error(`Mois invalide dans la date « ${iso} ».`);
  }
  const numeroJour = Number(jour);
  return `${numeroJour === 1 ? '1er' : numeroJour} ${nomMois} ${annee}`;
}
