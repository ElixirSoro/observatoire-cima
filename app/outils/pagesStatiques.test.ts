import { describe, expect, it } from 'vitest';

import type { Page } from '../src/contenu';
import { htmlDePage } from './pagesStatiques';

const HTML = [
  '<html><head>',
  '<link rel="icon" href="./favicon.svg" />',
  '<meta',
  '  name="description"',
  '  content="Ancien résumé"',
  '/>',
  '<title>Ancien titre</title>',
  '<script type="module" src="./assets/index.js"></script>',
  '</head><body><a href="https://exemple.test/">Lien externe</a></body></html>',
].join('\n');

const ACCUEIL: Page = { id: 'accueil', segment: '', libelle: 'Accueil', titre: 'Titre A', description: 'Résumé A' };
const OFFRES: Page = {
  id: 'offres',
  segment: 'offres',
  libelle: 'Offres',
  titre: 'Offres & "prix" <indicatifs>',
  description: 'Résumé O',
};

describe('htmlDePage', () => {
  it("donne à l'accueil son titre et son résumé, sans toucher aux références", () => {
    const html = htmlDePage(HTML, ACCUEIL);
    expect(html).toContain('<title>Titre A</title>');
    expect(html).toContain('<meta name="description" content="Résumé A" />');
    expect(html).toContain('href="./favicon.svg"');
    expect(html).toContain('src="./assets/index.js"');
  });

  it("fait remonter d'un dossier les références d'une autre page", () => {
    const html = htmlDePage(HTML, OFFRES);
    expect(html).toContain('href="../favicon.svg"');
    expect(html).toContain('src="../assets/index.js"');
    expect(html).not.toContain('="./');
    expect(html).toContain('href="https://exemple.test/"');
  });

  it('protège les caractères spéciaux du titre', () => {
    expect(htmlDePage(HTML, OFFRES)).toContain(
      '<title>Offres &amp; &quot;prix&quot; &lt;indicatifs&gt;</title>',
    );
  });

  it("refuse un fichier d'accueil sans titre, sans résumé ou sans référence locale", () => {
    expect(() => htmlDePage(HTML.replace('<title>Ancien titre</title>', ''), OFFRES)).toThrow(/title/);
    expect(() => htmlDePage(HTML.replace('name="description"', 'name="autre"'), OFFRES)).toThrow(/title/);
    expect(() => htmlDePage(HTML.replaceAll('="./', '="/'), OFFRES)).toThrow(/référence locale/);
  });
});
