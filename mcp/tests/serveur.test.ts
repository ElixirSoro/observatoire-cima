import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { copie, creerChargeur, type DonneesChargees } from '../src/donnees';
import { cheminComplet } from '../src/fichierLocal';
import { chercherChiffres, normaliser } from '../src/observatoire';
import { creerServeur } from '../src/serveur';

// Les fichiers de test sont fictifs.
const FIXTURES = fileURLToPath(new URL('./fixtures/', import.meta.url));
const COPIE: DonneesChargees = copie();
const chargerCopie = async () => COPIE;

async function connecter(fichiersLocaux: boolean): Promise<Client> {
  const [cote1, cote2] = InMemoryTransport.createLinkedPair();
  await creerServeur({ charger: chargerCopie, fichiersLocaux }).connect(cote1);
  const client = new Client({ name: 'essai', version: '0.0.0' });
  await client.connect(cote2);
  return client;
}

async function appeler(client: Client, outil: string, args: Record<string, unknown> = {}) {
  const resultat = await client.callTool({ name: outil, arguments: args });
  const contenu = resultat.content as { type: string; text: string }[];
  return { texte: contenu.map((bloc) => bloc.text).join('\n'), erreur: resultat.isError === true };
}

describe('outils exposés', () => {
  it('expose quatre outils en local, trois sans accès aux fichiers', async () => {
    const local = await connecter(true);
    const enLigne = await connecter(false);
    const noms = (await local.listTools()).tools.map((outil) => outil.name).sort();
    expect(noms).toEqual(['atelier_controler_fichier', 'observatoire_chercher', 'observatoire_indicateurs', 'observatoire_sources']);
    expect((await enLigne.listTools()).tools.map((outil) => outil.name)).not.toContain('atelier_controler_fichier');
    expect(local.getInstructions()).toContain('citez toujours');
  });

  it('déclare tous les outils en lecture seule', async () => {
    const outils = (await (await connecter(true)).listTools()).tools;
    expect(outils.every((outil) => outil.annotations?.readOnlyHint === true)).toBe(true);
  });
});

describe('observatoire', () => {
  it('trouve un chiffre avec sa source, sa page et son statut', async () => {
    const { texte, erreur } = await appeler(await connecter(false), 'observatoire_chercher', {
      indicateur: 'primes_emises',
      exercice: 2025,
    });
    expect(erreur).toBe(false);
    expect(texte).toContain('1 chiffre trouvé.');
    expect(texte).toContain('688,8 milliards FCFA');
    expect(texte).toContain('statut : À confirmer');
    expect(texte).toMatch(/p\. 1 — https:\/\//);
    expect(texte).toContain('Copie des données intégrée');
  });

  it('cherche par mots sans tenir compte des accents ni des majuscules', async () => {
    const { texte } = await appeler(await connecter(false), 'observatoire_chercher', { texte: 'PRIMES vie', exercice: 2024 });
    expect(texte).toContain('266');
    expect(normaliser('Non-vie  Réassurance')).toBe('non vie reassurance');
  });

  it('dit quand rien ne correspond, et limite le nombre de résultats', async () => {
    const client = await connecter(false);
    expect((await appeler(client, 'observatoire_chercher', { exercice: 1995 })).texte).toContain('Aucun chiffre ne correspond');
    const { texte } = await appeler(client, 'observatoire_chercher', { limite: 3 });
    expect(texte).toMatch(/^\d+ chiffres trouvés, 3 affichés/m);
  });

  it('refuse une limite hors bornes', async () => {
    const { erreur } = await appeler(await connecter(false), 'observatoire_chercher', { limite: 500 });
    expect(erreur).toBe(true);
    expect(() => chercherChiffres(COPIE, { limite: 0 })).toThrow(/Limite invalide/);
  });

  it('liste les indicateurs et les sources', async () => {
    const client = await connecter(false);
    const indicateurs = (await appeler(client, 'observatoire_indicateurs')).texte;
    expect(indicateurs).toContain('primes_emises — Primes émises');
    const sources = (await appeler(client, 'observatoire_sources')).texte;
    expect(sources).toContain(`${COPIE.donnees.sources.length} sources au registre.`);
    expect(sources).toContain('Atlas Magazine');
  });
});

describe('chargeur', () => {
  it('se rabat sur la copie intégrée quand la version en ligne ne répond pas', async () => {
    const charger = creerChargeur('http://127.0.0.1:9/observatoire.json');
    const chargees = await charger();
    expect(chargees.origine).toBe('copie');
    expect(chargees.donnees.observations.length).toBeGreaterThan(0);
  });

  it('garde les données une heure en mémoire', async () => {
    let instant = 0;
    const charger = creerChargeur('http://127.0.0.1:9/x.json', () => instant);
    const premiere = await charger();
    instant = 59 * 60 * 1000;
    expect(await charger()).toBe(premiere);
    instant = 61 * 60 * 1000;
    expect(await charger()).not.toBe(premiere);
  });
});

describe('atelier', () => {
  let dossier = '';
  beforeAll(async () => {
    dossier = await mkdtemp(join(tmpdir(), 'atelier-'));
    await writeFile(join(dossier, 'propre.csv'), 'a;b\n1;x\n2;y\n');
    await writeFile(join(dossier, 'image.png'), 'pas une image');
  });
  afterAll(() => undefined);

  it('contrôle un classeur Excel : feuilles, mesures et défauts', async () => {
    const { texte, erreur } = await appeler(await connecter(true), 'atelier_controler_fichier', {
      chemin: join(FIXTURES, 'classeur-fictif.xlsx'),
    });
    expect(erreur).toBe(false);
    expect(texte).toContain('feuille lue : Ventes · feuilles non lues : Notes');
    expect(texte).toContain('6 lignes de données');
    expect(texte).toContain('la ligne 5 répète la ligne 2');
    expect(texte).toContain('« N/A »');
    expect(texte).toContain('date_vente · dates');
  });

  it('lit un CSV en Windows-1252 et un fichier propre', async () => {
    const client = await connecter(true);
    const latin = (await appeler(client, 'atelier_controler_fichier', { chemin: join(FIXTURES, 'windows-1252-fictif.csv') })).texte;
    expect(latin).toContain('région · texte');
    expect(latin).toContain('Gbêkê');
    const propre = (await appeler(client, 'atelier_controler_fichier', { chemin: join(dossier, 'propre.csv') })).texte;
    expect(propre).toContain('Aucun défaut trouvé');
  });

  it('refuse un fichier absent, un chemin relatif, un ancien .xls et un format inconnu', async () => {
    const client = await connecter(true);
    const cas = [
      [join(dossier, 'absent.csv'), /introuvable/],
      ['ventes.csv', /Chemin complet attendu/],
      [join(FIXTURES, 'ancien.xls'), /ancien classeur/],
      [join(dossier, 'image.png'), /Format non pris en charge/],
      [dossier, /n'est pas un fichier/],
    ] as const;
    for (const [chemin, motif] of cas) {
      const { texte, erreur } = await appeler(client, 'atelier_controler_fichier', { chemin });
      expect(erreur).toBe(true);
      expect(texte).toMatch(motif);
    }
  });

  it('développe « ~ » vers le dossier personnel', () => {
    expect(cheminComplet('~/Documents/a.csv')).toMatch(/^\/.+\/Documents\/a\.csv$/);
    expect(() => cheminComplet('./a.csv')).toThrow(/Chemin complet/);
  });
});
