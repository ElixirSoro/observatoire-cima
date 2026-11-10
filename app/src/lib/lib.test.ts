import { describe, expect, it } from 'vitest';

import {
  filtrer,
  type Observation,
  partEnPourcent,
  trouver,
  validerDonnees,
  versCsv,
} from './donnees';
import { formaterDate, formaterNombre, formaterValeur } from './format';

// Valeurs de test, sans rapport avec des chiffres réels.
const BASE: Observation = {
  id_source: 'S-1',
  page: 1,
  tableau: 'Tableau fictif',
  pays: 'CI',
  exercice: 2024,
  entite: 'Marché',
  branche: 'Toutes',
  indicateur: 'test',
  valeur: 10,
  unite: 'milliards FCFA',
  origine: 'Organisme B',
  statut: 'extrait',
};
const OBSERVATIONS: Observation[] = [
  BASE,
  { ...BASE, exercice: 2023, valeur: 8 },
  { ...BASE, origine: 'Organisme A', valeur: 11 },
  { ...BASE, indicateur: 'autre', branche: 'Vie, épargne', valeur: 2.5 },
];

describe('trouver et filtrer', () => {
  it('trouve par indicateur, exercice et origine', () => {
    expect(trouver(OBSERVATIONS, { indicateur: 'test', exercice: 2024, origine: 'Organisme A' })?.valeur).toBe(11);
  });
  it("retourne undefined si rien ne correspond", () => {
    expect(trouver(OBSERVATIONS, { indicateur: 'test', exercice: 1999 })).toBeUndefined();
  });
  it('trie par exercice puis par origine', () => {
    expect(filtrer(OBSERVATIONS, 'test').map((o) => o.valeur)).toEqual([8, 11, 10]);
  });
});

describe('partEnPourcent', () => {
  it('calcule une part', () => {
    expect(partEnPourcent(25, 200)).toBeCloseTo(12.5);
  });
  it('refuse un total nul', () => {
    expect(() => partEnPourcent(1, 0)).toThrow(/incalculable/);
  });
});

describe('versCsv', () => {
  it("écrit l'en-tête et protège les virgules", () => {
    const lignes = versCsv(OBSERVATIONS).trimEnd().split('\n');
    expect(lignes).toHaveLength(5);
    expect(lignes[0]).toBe('indicateur,exercice,branche,valeur,unite,origine,statut,id_source');
    expect(lignes[4]).toContain('"Vie, épargne"');
  });
});

describe('validerDonnees', () => {
  it('accepte un fichier bien formé', () => {
    const donnees = validerDonnees({ mis_a_jour_le: '2026-01-01', sources: [], observations: [BASE] });
    expect(donnees.observations).toHaveLength(1);
  });
  it.each([
    [null],
    [{ mis_a_jour_le: '2026-01-01', sources: [] }],
    [{ mis_a_jour_le: '2026-01-01', sources: [], observations: [] }],
    [{ mis_a_jour_le: '2026-01-01', sources: [], observations: [{ ...BASE, valeur: 'dix' }] }],
  ])('refuse un fichier mal formé', (brut) => {
    expect(() => validerDonnees(brut)).toThrow();
  });
});

describe('formats', () => {
  it('écrit les nombres à la française', () => {
    expect(formaterNombre(1234.5)).toMatch(/^1\s234,5$/);
    expect(formaterNombre(628.042)).toBe('628,042');
  });
  it("ajoute l'unité", () => {
    expect(formaterValeur(1.2, '%')).toBe('1,2 %');
    expect(formaterValeur(22, 'nombre')).toBe('22');
    expect(formaterValeur(37.7, 'USD par habitant')).toBe('37,7 USD par habitant');
  });
  it('écrit les dates en toutes lettres', () => {
    expect(formaterDate('2026-11-10')).toBe('10 novembre 2026');
    expect(formaterDate('2026-03-01')).toBe('1er mars 2026');
  });
  it('refuse une date ou un nombre invalide', () => {
    expect(() => formaterDate('10/11/2026')).toThrow();
    expect(() => formaterDate('2026-13-01')).toThrow();
    expect(() => formaterNombre(Number.NaN)).toThrow();
  });
});
