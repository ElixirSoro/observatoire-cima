/** Un fichier d'exemple, entièrement fictif, avec des défauts placés exprès. */

import { lireCsv } from './csv';
import { construireTableau, type Tableau } from './tableau';

export const NOM_EXEMPLE = 'exemple-ventes-fictives.csv';

/**
 * Ventes fictives. Défauts placés : une ligne répétée, une ligne vide, des cellules vides,
 * une quantité écrite « N/A », une date impossible, des espaces en fin de texte.
 */
const CSV_EXEMPLE = [
  'date_vente;client;ville;produit;quantite;prix_unitaire_fcfa;montant_fcfa',
  '03/09/2026;Client 01;Abidjan;Produit A;12;2 500;30 000',
  '03/09/2026;Client 02;Bouaké;Produit B;4;7 000;28 000',
  '04/09/2026;Client 03;Abidjan ;Produit A;20;2 500;50 000',
  '05/09/2026;Client 01;Abidjan;Produit C;N/A;12 000;',
  '05/09/2026;Client 04;;Produit B;6;7 000;42 000',
  '03/09/2026;Client 02;Bouaké;Produit B;4;7 000;28 000',
  ';;;;;;',
  '08/09/2026;Client 05;Korhogo;Produit A;15;2 500;37 500',
  '31/09/2026;Client 03;Abidjan;Produit C;2;12 000;24 000',
  '10/09/2026;Client 06;San-Pédro;Produit B ;9;7 000;63 000',
  '11/09/2026;Client 01;Abidjan;Produit A;;2 500;',
  '12/09/2026;Client 07;Yamoussoukro;Produit C;3;12 000;36 000',
].join('\n');

/** Le tableau d'exemple, lu par le même chemin qu'un fichier déposé. */
export function tableauExemple(): Tableau {
  return construireTableau(lireCsv(CSV_EXEMPLE), { nom: NOM_EXEMPLE, feuille: null, autresFeuilles: [] });
}
