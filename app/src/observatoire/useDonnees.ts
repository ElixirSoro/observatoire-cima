import { useEffect, useState } from 'react';

import { type EtatDonnees, validerDonnees } from '../lib/donnees';

const FICHIER_DONNEES = 'data/observatoire.json';

/** Lit le fichier de données de l'observatoire, une fois, à partir de la racine du site. */
export function useDonnees(racine: string): EtatDonnees {
  const [etat, setEtat] = useState<EtatDonnees>({ phase: 'chargement' });

  useEffect(() => {
    const controleur = new AbortController();
    fetch(`${racine}${FICHIER_DONNEES}`, { signal: controleur.signal })
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
  }, [racine]);

  return etat;
}
