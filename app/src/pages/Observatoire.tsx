import { ETATS_CHARGEMENT, PAGES } from '../contenu';
import type { EtatDonnees } from '../lib/donnees';
import { AppelTelechargement } from '../observatoire/AppelTelechargement';
import { ChiffresCles } from '../observatoire/ChiffresCles';
import { Evolution } from '../observatoire/Evolution';
import { Hero } from '../observatoire/Hero';
import { Regles } from '../observatoire/Regles';
import { Sommaire } from '../observatoire/Sommaire';
import { Sources } from '../observatoire/Sources';
import { Structure } from '../observatoire/Structure';

const LIBELLE = PAGES.find((page) => page.id === 'observatoire')?.libelle ?? 'Observatoire';

export function Observatoire({ etat }: { etat: EtatDonnees }) {
  if (etat.phase === 'chargement') {
    return (
      <div className="ecran-etat largeur" aria-busy="true">
        <h1 className="tete-page__titre">{LIBELLE}</h1>
        <p>{ETATS_CHARGEMENT.chargement}</p>
      </div>
    );
  }
  if (etat.phase === 'erreur') {
    return (
      <div className="ecran-etat largeur" role="alert">
        <h1 className="tete-page__titre">{LIBELLE}</h1>
        <p>
          {ETATS_CHARGEMENT.erreur} {etat.message}
        </p>
        <p>
          Relancez <code>python -m obscima.construire</code> à la racine du projet, puis rechargez
          cette page.
        </p>
      </div>
    );
  }
  const { donnees } = etat;
  return (
    <>
      <Hero donnees={donnees} />
      <Sommaire />
      <ChiffresCles donnees={donnees} />
      <Evolution donnees={donnees} />
      <Structure donnees={donnees} />
      <Sources donnees={donnees} />
      <Regles />
      <AppelTelechargement donnees={donnees} />
    </>
  );
}
