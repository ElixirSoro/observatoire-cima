import { describe, expect, it } from 'vitest';

import { redigerConstats } from './constats';
import { decoderTexte, detecterSeparateur, lireCsv } from './csv';
import { tableauExemple } from './exemple';
import { extensionDe, versCellule } from './lecture';
import { decrireResume } from './libelles';
import { controlerQualite, profilerColonne } from './qualite';
import { quantile, resumerDates, resumerNombres, resumerTextes } from './statistiques';
import { construireTableau, LIMITES } from './tableau';
import { afficherCellule, interpreter } from './valeurs';

// Toutes les valeurs de ce fichier sont fictives.
const SOURCE = { nom: 'essai.csv', feuille: null, autresFeuilles: [] };

describe('lireCsv', () => {
  it('découpe lignes et champs, quel que soit le saut de ligne', () => {
    expect(lireCsv('a;b\r\n1;2\n3;4\r5;6')).toEqual([['a', 'b'], ['1', '2'], ['3', '4'], ['5', '6']]);
  });

  it('respecte les guillemets : séparateur, saut de ligne et guillemet doublé', () => {
    expect(lireCsv('nom,note\n"Durand, A.","dit ""le grand""\nsuite"\n')).toEqual([
      ['nom', 'note'],
      ['Durand, A.', 'dit "le grand"\nsuite'],
    ]);
  });

  it('garde les lignes vides et ignore le saut de ligne final', () => {
    expect(lireCsv('a;b\n\n1;2\n')).toEqual([['a', 'b'], [''], ['1', '2']]);
    expect(lireCsv('')).toEqual([]);
  });

  it('refuse un guillemet jamais refermé', () => {
    expect(() => lireCsv('a;b\n"ouvert;2')).toThrow(/guillemet/);
  });
});

describe('detecterSeparateur et decoderTexte', () => {
  it('choisit le séparateur le plus fréquent hors guillemets', () => {
    expect(detecterSeparateur('a;b;c\n1,5;2;3')).toBe(';');
    expect(detecterSeparateur('a,b,c\n"x;y;z;t",2,3')).toBe(',');
    expect(detecterSeparateur('a\tb\n1\t2')).toBe('\t');
    expect(detecterSeparateur('une seule colonne')).toBe(',');
  });

  it("lit l'UTF-8, retire la marque d'ordre, et se rabat sur Windows-1252", () => {
    expect(decoderTexte(new TextEncoder().encode('﻿été'))).toBe('été');
    expect(decoderTexte(new Uint8Array([0xe9, 0x74, 0xe9]))).toBe('été');
  });
});

describe('construireTableau', () => {
  it('égalise la largeur des lignes et nomme les colonnes sans en-tête', () => {
    const tableau = construireTableau([['a', '', 'c'], ['1'], ['1', '2', '3', '4']], SOURCE);
    expect(tableau.entetes).toEqual(['a', 'Colonne 2', 'c', 'Colonne 4']);
    expect(tableau.entetesAbsentes).toEqual([2, 4]);
    expect(tableau.lignes).toEqual([['1', null, null, null], ['1', '2', '3', '4']]);
  });

  it('rend vides les cellules blanches et les nombres non finis, sans modifier la source', () => {
    const brut = [['a', 'b'], ['  ', Number.NaN]];
    const tableau = construireTableau(brut, SOURCE);
    expect(tableau.lignes).toEqual([[null, null]]);
    expect(brut[1]).toEqual(['  ', Number.NaN]);
  });

  it('refuse un fichier vide ou trop large', () => {
    expect(() => construireTableau([], SOURCE)).toThrow(/vide/);
    expect(() => construireTableau([[]], SOURCE)).toThrow(/vide/);
    const tropLarge = [Array.from({ length: LIMITES.colonnesMax + 1 }, () => 'x')];
    expect(() => construireTableau(tropLarge, SOURCE)).toThrow(/colonnes/);
  });
});

describe('interpreter', () => {
  it('lit les nombres à la française et à l\'anglaise', () => {
    expect(interpreter('1 234,5')).toEqual({ genre: 'nombre', nombre: 1234.5 });
    expect(interpreter('12 000')).toEqual({ genre: 'nombre', nombre: 12000 });
    expect(interpreter('-3.25')).toEqual({ genre: 'nombre', nombre: -3.25 });
    expect(interpreter(42)).toEqual({ genre: 'nombre', nombre: 42 });
  });

  it('garde en texte les codes qui commencent par zéro et les textes ordinaires', () => {
    expect(interpreter('0102030405')).toEqual({ genre: 'texte', texte: '0102030405' });
    expect(interpreter('N/A')).toEqual({ genre: 'texte', texte: 'N/A' });
    expect(interpreter('1.234.567')).toEqual({ genre: 'texte', texte: '1.234.567' });
    expect(interpreter('0')).toEqual({ genre: 'nombre', nombre: 0 });
    expect(interpreter('0,5')).toEqual({ genre: 'nombre', nombre: 0.5 });
  });

  it('lit les dates réelles et refuse les dates impossibles', () => {
    expect(interpreter('03/09/2026')).toEqual({ genre: 'date', iso: '2026-09-03' });
    expect(interpreter('2026-9-3')).toEqual({ genre: 'date', iso: '2026-09-03' });
    expect(interpreter(new Date(Date.UTC(2026, 8, 3)))).toEqual({ genre: 'date', iso: '2026-09-03' });
    expect(interpreter('31/09/2026')).toEqual({ genre: 'texte', texte: '31/09/2026' });
    expect(interpreter('29/02/2025').genre).toBe('texte');
  });

  it('lit les vrai ou faux et les cellules vides', () => {
    expect(interpreter('VRAI')).toEqual({ genre: 'booleen', vrai: true });
    expect(interpreter(false)).toEqual({ genre: 'booleen', vrai: false });
    expect(interpreter(null).genre).toBe('vide');
    expect(interpreter('   ').genre).toBe('vide');
    expect(interpreter(Number.POSITIVE_INFINITY).genre).toBe('vide');
    expect(interpreter(new Date(Number.NaN)).genre).toBe('vide');
  });

  it('affiche une cellule comme dans le fichier', () => {
    expect(afficherCellule(null)).toBe('');
    expect(afficherCellule(true)).toBe('VRAI');
    expect(afficherCellule(new Date(Date.UTC(2026, 0, 5)))).toBe('2026-01-05');
    expect(afficherCellule(12.5)).toBe('12.5');
  });
});

describe('statistiques', () => {
  // Valeurs de référence calculées avec numpy 2.5 (quantile linéaire, écart-type ddof=1).
  it('égale le calcul de référence sur une série de nombres', () => {
    const resume = resumerNombres([12, 7, 3.5, 18, 7, 9.25, 21, 4]);
    expect(resume.effectif).toBe(8);
    expect(resume.minimum).toBe(3.5);
    expect(resume.maximum).toBe(21);
    expect(resume.moyenne).toBeCloseTo(10.21875, 12);
    expect(resume.mediane).toBeCloseTo(8.125, 12);
    expect(resume.quartile1).toBeCloseTo(6.25, 12);
    expect(resume.quartile3).toBeCloseTo(13.5, 12);
    expect(resume.ecartType).toBeCloseTo(6.385582952468564, 12);
  });

  it('traite une seule valeur et ne modifie pas la série reçue', () => {
    const serie = [5, 1, 3];
    resumerNombres(serie);
    expect(serie).toEqual([5, 1, 3]);
    expect(resumerNombres([7])).toMatchObject({ minimum: 7, mediane: 7, maximum: 7, ecartType: null });
    expect(quantile([1, 2, 3, 4], 0.1)).toBeCloseTo(1.3, 12);
  });

  it('refuse une série vide, une valeur non finie ou un quantile hors bornes', () => {
    expect(() => resumerNombres([])).toThrow(/Aucune valeur/);
    expect(() => resumerNombres([1, Number.NaN])).toThrow(/nombre fini/);
    expect(() => quantile([1, 2], 1.5)).toThrow(/hors de/);
    expect(() => quantile([1, 2], Number.NaN)).toThrow(/hors de/);
  });

  it('résume textes et dates', () => {
    expect(resumerTextes(['b', 'a', 'b', 'c', 'a', 'b'])).toEqual({
      effectif: 6,
      distinctes: 3,
      frequentes: [
        { valeur: 'b', effectif: 3 },
        { valeur: 'a', effectif: 2 },
        { valeur: 'c', effectif: 1 },
      ],
    });
    expect(resumerDates(['2026-09-08', '2026-09-03', '2026-10-01'])).toEqual({
      effectif: 3,
      premiere: '2026-09-03',
      derniere: '2026-10-01',
    });
    expect(() => resumerTextes([])).toThrow(/Aucune valeur/);
    expect(() => resumerDates([])).toThrow(/Aucune valeur/);
  });
});

describe('profilerColonne', () => {
  it('signale les valeurs qui ne sont pas du genre de la colonne', () => {
    const profil = profilerColonne('quantite', ['12', 'N/A', null, '7', '3'], [2, 3, 4, 5, 6]);
    expect(profil).toMatchObject({ genre: 'nombre', remplies: 4, vides: 1, nombreDiscordantes: 1 });
    expect(profil.discordances).toEqual([{ ligne: 3, valeur: 'N/A' }]);
  });

  it('ne signale rien dans une colonne de texte, et décrit une colonne vide', () => {
    expect(profilerColonne('code', ['A1', '12', 'B2'], [2, 3, 4]).nombreDiscordantes).toBe(0);
    expect(profilerColonne('vide', [null, null], [2, 3])).toMatchObject({
      genre: 'vide',
      remplies: 0,
      vides: 2,
      resume: { genre: 'vide' },
    });
  });

  it('refuse des longueurs différentes', () => {
    expect(() => profilerColonne('x', ['1'], [2, 3])).toThrow(/numéros de ligne/);
  });
});

describe("contrôle de qualité du fichier d'exemple", () => {
  const rapport = controlerQualite(tableauExemple());

  it('compte lignes, colonnes, lignes vides et doublons', () => {
    expect(rapport.nombreLignes).toBe(12);
    expect(rapport.nombreColonnes).toBe(7);
    expect(rapport.lignesVides).toEqual({ nombre: 1, exemples: [8] });
    expect(rapport.doublons).toEqual({ nombre: 1, exemples: [{ ligne: 7, premiere: 3 }] });
  });

  it('retrouve chaque défaut placé dans les colonnes', () => {
    const parNom = new Map(rapport.colonnes.map((colonne) => [colonne.nom, colonne]));
    expect(parNom.get('date_vente')).toMatchObject({ genre: 'date', nombreDiscordantes: 1 });
    expect(parNom.get('date_vente')?.discordances).toEqual([{ ligne: 10, valeur: '31/09/2026' }]);
    expect(parNom.get('ville')).toMatchObject({ genre: 'texte', remplies: 10, vides: 1 });
    expect(parNom.get('quantite')).toMatchObject({ genre: 'nombre', vides: 1, nombreDiscordantes: 1 });
    expect(parNom.get('montant_fcfa')).toMatchObject({ genre: 'nombre', remplies: 9, vides: 2 });
    expect(rapport.cellulesVides).toBe(4);
    expect(rapport.tauxRemplissage).toBeCloseTo((73 / 77) * 100, 10);
    expect(rapport.espacesEnTrop).toBe(2);
  });

  it('égale le calcul de référence sur la colonne des prix', () => {
    const prix = rapport.colonnes.find((colonne) => colonne.nom === 'prix_unitaire_fcfa');
    expect(prix?.resume.genre).toBe('nombre');
    if (prix?.resume.genre !== 'nombre') {
      return;
    }
    expect(prix.resume.nombres.effectif).toBe(11);
    expect(prix.resume.nombres.moyenne).toBeCloseTo(6727.272727272727, 9);
    expect(prix.resume.nombres.mediane).toBe(7000);
    expect(prix.resume.nombres.quartile1).toBe(2500);
    expect(prix.resume.nombres.quartile3).toBe(9500);
    expect(prix.resume.nombres.ecartType).toBeCloseTo(3939.312353467521, 9);
  });

  it('rédige un constat par défaut', () => {
    const constats = redigerConstats(rapport);
    expect(constats).toHaveLength(8);
    expect(constats.filter((constat) => constat.niveau === 'information')).toHaveLength(1);
    const textes = constats.map((constat) => constat.texte).join('\n');
    expect(textes).toContain('1 ligne est entièrement vide (ligne 8).');
    expect(textes).toContain('la ligne 7 répète la ligne 3');
    expect(textes).toContain('Colonne « quantite » : 1 valeur n’est pas un nombre (ligne 5 : « N/A »).');
    expect(textes).toContain('Colonne « montant_fcfa » : 2 cellules vides sur 11 (18,2 %).');
  });
});

describe('cas limites du contrôle', () => {
  it("ne trouve rien dans un tableau propre, et accepte un tableau sans ligne", () => {
    const propre = construireTableau([['a', 'b'], ['1', 'x'], ['2', 'y']], SOURCE);
    expect(redigerConstats(controlerQualite(propre))).toEqual([]);
    const sansLigne = controlerQualite(construireTableau([['a', 'b']], SOURCE));
    expect(sansLigne).toMatchObject({ nombreLignes: 0, tauxRemplissage: null, cellulesVides: 0 });
    expect(redigerConstats(sansLigne)).toEqual([]);
  });

  it('signale les en-têtes absents ou répétés et abrège les longues listes', () => {
    const brut = [['a', '', 'a'], ...Array.from({ length: 8 }, () => ['', '', ''])];
    const constats = redigerConstats(controlerQualite(construireTableau(brut, SOURCE)));
    const textes = constats.map((constat) => constat.texte).join('\n');
    expect(textes).toContain('1 colonne n’a pas de nom dans la première ligne (colonne 2).');
    expect(textes).toContain('« a »');
    expect(textes).toContain('8 lignes sont entièrement vides (ligne 2, 3, 4, 5, 6 et 3 autres).');
  });
});

describe('lecture', () => {
  it("trouve l'extension d'un nom de fichier", () => {
    expect(extensionDe('Ventes 2026.XLSX')).toBe('xlsx');
    expect(extensionDe('archive.tar.csv')).toBe('csv');
    expect(extensionDe('sans-extension')).toBe('');
    expect(extensionDe('.cache')).toBe('');
    expect(extensionDe('point-final.')).toBe('');
  });

  it("ramène une valeur de classeur à une cellule", () => {
    const date = new Date(Date.UTC(2026, 0, 1));
    expect(versCellule(undefined)).toBeNull();
    expect(versCellule('a')).toBe('a');
    expect(versCellule(3)).toBe(3);
    expect(versCellule(date)).toBe(date);
    expect(versCellule({ toString: () => 'objet' })).toBe('objet');
  });
});

describe('decrireResume', () => {
  it('résume chaque genre de colonne en une ligne', () => {
    const colonnes = new Map(controlerQualite(tableauExemple()).colonnes.map((c) => [c.nom, c.resume]));
    const prix = colonnes.get('prix_unitaire_fcfa');
    const dates = colonnes.get('date_vente');
    const clients = colonnes.get('client');
    if (prix === undefined || dates === undefined || clients === undefined) {
      throw new Error("Colonnes de l'exemple introuvables.");
    }
    expect(decrireResume(prix)).toBe('de 2\u202f500 à 12\u202f000 · moyenne 6\u202f727,27 · médiane 7\u202f000');
    expect(decrireResume(dates)).toBe('du 3 septembre 2026 au 12 septembre 2026');
    expect(decrireResume(clients)).toBe('7 valeurs distinctes · la plus fréquente : « Client 01 » (3 fois)');
    expect(decrireResume({ genre: 'booleen', vrais: 2, faux: 1 })).toBe('2 vrai, 1 faux');
    expect(decrireResume({ genre: 'vide' })).toBe('aucune valeur');
  });
});
