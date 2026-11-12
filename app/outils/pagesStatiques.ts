/**
 * Fabrique un fichier index.html par page du site, au moment de la construction.
 *
 * Sans cela, seule l'adresse de l'accueil existerait chez l'hébergeur : recharger la page
 * « offres » donnerait une erreur. Chaque page reçoit aussi son titre et son résumé.
 */

import type { Plugin } from 'vite';

import type { Page } from '../src/contenu.ts';

const FICHIER_RACINE = 'index.html';
const TITRE = /<title>[^<]*<\/title>/g;
const RESUME = /<meta\s+name="description"\s+content="[^"]*"\s*\/>/g;
const REFERENCE_LOCALE = /(src|href)="\.\//g;

function echapper(texte: string): string {
  return texte
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function compter(texte: string, motif: RegExp): number {
  return [...texte.matchAll(motif)].length;
}

/**
 * Produit le fichier HTML d'une page à partir de celui de l'accueil.
 *
 * Pré : htmlRacine contient exactement une balise title, une balise meta description
 *       et au moins une référence locale (src ou href commençant par « ./ »).
 * Post : titre et résumé de la page ; pour une page autre que l'accueil, les références
 *        locales remontent d'un dossier (« ../ »).
 * Lève : Error si le fichier de l'accueil n'a pas la forme attendue.
 */
export function htmlDePage(htmlRacine: string, page: Page): string {
  if (compter(htmlRacine, TITRE) !== 1 || compter(htmlRacine, RESUME) !== 1) {
    throw new Error('index.html doit contenir une seule balise title et une seule meta description.');
  }
  const nombreReferences = compter(htmlRacine, REFERENCE_LOCALE);
  if (nombreReferences === 0) {
    throw new Error('index.html ne contient aucune référence locale (src ou href en « ./ »).');
  }
  const avecTextes = htmlRacine
    .replace(TITRE, `<title>${echapper(page.titre)}</title>`)
    .replace(RESUME, `<meta name="description" content="${echapper(page.description)}" />`);
  if (page.segment === '') {
    return avecTextes;
  }
  const html = avecTextes.replace(REFERENCE_LOCALE, '$1="../');
  if (compter(html, REFERENCE_LOCALE) !== 0 || compter(html, /(src|href)="\.\.\//g) !== nombreReferences) {
    throw new Error(`Références locales mal réécrites pour la page « ${page.segment} ».`);
  }
  return html;
}

/** Module de construction Vite : ajoute un dossier et un index.html par page. */
export function pagesStatiques(pages: readonly Page[]): Plugin {
  return {
    name: 'pages-statiques',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, fichiers) {
      const racine = fichiers[FICHIER_RACINE];
      if (racine === undefined || racine.type !== 'asset' || typeof racine.source !== 'string') {
        throw new Error(`${FICHIER_RACINE} introuvable parmi les fichiers construits.`);
      }
      const htmlRacine = racine.source;
      for (const page of pages) {
        const source = htmlDePage(htmlRacine, page);
        if (page.segment === '') {
          racine.source = source;
        } else {
          this.emitFile({ type: 'asset', fileName: `${page.segment}/${FICHIER_RACINE}`, source });
        }
      }
    },
  };
}
