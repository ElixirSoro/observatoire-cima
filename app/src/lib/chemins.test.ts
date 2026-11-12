import { describe, expect, it } from 'vitest';

import { adresseDe, lireChemin } from './chemins';

const SEGMENTS = ['offres', 'observatoire', 'contact'] as const;

describe('lireChemin', () => {
  it("reconnaît l'accueil et une page à la racine d'un domaine", () => {
    expect(lireChemin('/', SEGMENTS)).toEqual({ racine: '/', segment: '' });
    expect(lireChemin('/offres/', SEGMENTS)).toEqual({ racine: '/', segment: 'offres' });
  });

  it('reconnaît les pages dans un sous-dossier', () => {
    expect(lireChemin('/depot/', SEGMENTS)).toEqual({ racine: '/depot/', segment: '' });
    expect(lireChemin('/depot/contact/', SEGMENTS)).toEqual({ racine: '/depot/', segment: 'contact' });
    expect(lireChemin('/a/b/observatoire/', SEGMENTS)).toEqual({
      racine: '/a/b/',
      segment: 'observatoire',
    });
  });

  it('accepte index.html et une adresse sans barre finale', () => {
    expect(lireChemin('/depot/index.html', SEGMENTS)).toEqual({ racine: '/depot/', segment: '' });
    expect(lireChemin('/depot/offres/index.html', SEGMENTS)).toEqual({
      racine: '/depot/',
      segment: 'offres',
    });
    expect(lireChemin('/depot/offres', SEGMENTS)).toEqual({ racine: '/depot/', segment: 'offres' });
    expect(lireChemin('/depot', SEGMENTS)).toEqual({ racine: '/depot/', segment: '' });
  });

  it("traite un dossier inconnu comme la racine d'un site", () => {
    expect(lireChemin('/depot/inconnue/', SEGMENTS)).toEqual({
      racine: '/depot/inconnue/',
      segment: '',
    });
  });

  it('refuse un chemin ou un segment invalide', () => {
    expect(() => lireChemin('offres/', SEGMENTS)).toThrow(/Chemin d'adresse invalide/);
    expect(() => lireChemin(`/${'a'.repeat(2048)}`, SEGMENTS)).toThrow(/Chemin d'adresse invalide/);
    expect(() => lireChemin('/', [''])).toThrow(/Segment de page invalide/);
    expect(() => lireChemin('/', ['a/b'])).toThrow(/Segment de page invalide/);
  });
});

describe('adresseDe', () => {
  it("construit l'adresse de l'accueil et d'une page", () => {
    expect(adresseDe('/', '')).toBe('/');
    expect(adresseDe('/depot/', '')).toBe('/depot/');
    expect(adresseDe('/depot/', 'offres')).toBe('/depot/offres/');
  });

  it('est la réciproque de lireChemin', () => {
    for (const segment of ['', ...SEGMENTS]) {
      const adresse = adresseDe('/depot/', segment);
      expect(lireChemin(adresse, SEGMENTS)).toEqual({ racine: '/depot/', segment });
    }
  });

  it('refuse une racine ou un segment invalide', () => {
    expect(() => adresseDe('depot/', 'offres')).toThrow(/Racine du site invalide/);
    expect(() => adresseDe('/depot', 'offres')).toThrow(/Racine du site invalide/);
    expect(() => adresseDe('/', 'Offres')).toThrow(/Segment de page invalide/);
  });
});
