import { describe, expect, it } from 'vitest';

import { COORDONNEES, NOM_ENTREPRISE, OFFRES, PAGE_OFFRES, PAGES, SECTIONS } from './contenu';
import { adresseDe, lireChemin } from './lib/chemins';
import { liensDeContact } from './lib/contact';
import { formaterFourchetteFcfa } from './lib/format';

describe('PAGES', () => {
  it("commence par l'accueil et n'a ni segment ni identifiant en double", () => {
    expect(PAGES[0]?.segment).toBe('');
    expect(new Set(PAGES.map((page) => page.segment)).size).toBe(PAGES.length);
    expect(new Set(PAGES.map((page) => page.id)).size).toBe(PAGES.length);
  });

  it('donne à chaque page une adresse qui se relit', () => {
    const segments = PAGES.map((page) => page.segment).filter((segment) => segment !== '');
    for (const page of PAGES) {
      const adresse = adresseDe('/site/', page.segment);
      expect(lireChemin(adresse, segments)).toEqual({ racine: '/site/', segment: page.segment });
    }
  });

  it('donne à chaque page un titre, un résumé et un nom de menu', () => {
    for (const page of PAGES) {
      expect(page.titre.length).toBeGreaterThan(5);
      expect(page.description.length).toBeGreaterThan(20);
      expect(page.libelle.length).toBeGreaterThan(2);
    }
  });
});

describe('OFFRES', () => {
  it('donne à chaque offre un livrable, un délai et une fourchette de prix valide', () => {
    expect(OFFRES.length).toBeGreaterThan(0);
    for (const offre of OFFRES) {
      expect(offre.livrables.length).toBeGreaterThan(0);
      expect(offre.delai).not.toBe('');
      expect(formaterFourchetteFcfa(offre.prixMinFcfa, offre.prixMaxFcfa)).toContain('FCFA');
    }
    expect(new Set(OFFRES.map((offre) => offre.id)).size).toBe(OFFRES.length);
    expect(PAGE_OFFRES.deroulement.etapes.length).toBeGreaterThan(0);
  });
});

describe('réglages du site', () => {
  it('a des coordonnées vides ou bien formées', () => {
    expect(() => liensDeContact(COORDONNEES)).not.toThrow();
  });

  it("ne porte pas le sigle du régulateur dans le nom de l'entreprise", () => {
    expect(NOM_ENTREPRISE.toUpperCase()).not.toContain('CIMA');
  });

  it("garde des ancres uniques pour les sections de l'observatoire", () => {
    expect(new Set(SECTIONS.map((section) => section.id)).size).toBe(SECTIONS.length);
  });
});
