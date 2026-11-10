import { useEffect, useState } from 'react';

import { Appel } from './components/Appel';
import { ChiffresCles } from './components/ChiffresCles';
import { Entete } from './components/Entete';
import { Evolution } from './components/Evolution';
import { Hero } from './components/Hero';
import { Methode } from './components/Methode';
import { Pied } from './components/Pied';
import { Sources } from './components/Sources';
import { Structure } from './components/Structure';
import { NOM_DU_SITE } from './contenu';
import { type Donnees, validerDonnees } from './lib/donnees';

const ADRESSE_DONNEES = `${import.meta.env.BASE_URL}data/observatoire.json`;

type Etat =
  | { phase: 'chargement' }
  | { phase: 'erreur'; message: string }
  | { phase: 'pret'; donnees: Donnees };

export function App() {
  const [etat, setEtat] = useState<Etat>({ phase: 'chargement' });

  useEffect(() => {
    const controleur = new AbortController();
    fetch(ADRESSE_DONNEES, { signal: controleur.signal })
      .then((reponse) => {
        if (!reponse.ok) {
          throw new Error(`Le fichier de données est introuvable (erreur ${reponse.status}).`);
        }
        return reponse.json() as Promise<unknown>;
      })
      .then((brut) => setEtat({ phase: 'pret', donnees: validerDonnees(brut) }))
      .catch((erreur: unknown) => {
        if (controleur.signal.aborted) {
          return;
        }
        const message = erreur instanceof Error ? erreur.message : 'Erreur inconnue.';
        setEtat({ phase: 'erreur', message });
      });
    return () => controleur.abort();
  }, []);

  if (etat.phase === 'chargement') {
    return (
      <main className="ecran-etat" aria-busy="true">
        <p>Chargement des chiffres.</p>
      </main>
    );
  }
  if (etat.phase === 'erreur') {
    return (
      <main className="ecran-etat" role="alert">
        <h1>{NOM_DU_SITE}</h1>
        <p>Les chiffres n'ont pas pu être chargés. {etat.message}</p>
        <p>
          Relancez <code>python -m obscima.construire</code> à la racine du projet, puis rechargez
          cette page.
        </p>
      </main>
    );
  }

  const { donnees } = etat;
  return (
    <>
      <a className="lien-evitement" href="#contenu">
        Aller au contenu
      </a>
      <Entete />
      <main id="contenu">
        <Hero donnees={donnees} />
        <ChiffresCles donnees={donnees} />
        <Evolution donnees={donnees} />
        <Structure donnees={donnees} />
        <Sources donnees={donnees} />
        <Methode />
        <Appel donnees={donnees} />
      </main>
      <Pied donnees={donnees} />
    </>
  );
}
