import { type ChangeEvent, useState } from 'react';

import { tableauExemple } from '../atelier/exemple';
import { lireFichier } from '../atelier/lecture';
import { controlerQualite, type RapportQualite } from '../atelier/qualite';
import { Resultat } from '../atelier/Resultat';
import { LIMITES, type Tableau } from '../atelier/tableau';
import { TetePage } from '../components/TetePage';
import { ATELIER } from '../contenu';
import { formaterNombre } from '../lib/format';

const OCTETS_PAR_MO = 1024 * 1024;
const FORMATS_ACCEPTES = '.xlsx,.csv,.tsv,.txt';

type Etat =
  | { phase: 'attente' }
  | { phase: 'lecture' }
  | { phase: 'erreur'; message: string }
  | { phase: 'pret'; tableau: Tableau; rapport: RapportQualite };

function etatDe(tableau: Tableau): Etat {
  return { phase: 'pret', tableau, rapport: controlerQualite(tableau) };
}

function messageDe(erreur: unknown): string {
  return erreur instanceof Error ? erreur.message : 'Erreur inconnue.';
}

function Depot({ surFichier, surExemple }: { surFichier: (fichier: File) => void; surExemple: () => void }) {
  const choisir = (evenement: ChangeEvent<HTMLInputElement>) => {
    const fichier = evenement.target.files?.[0];
    // Vider le champ permet de rouvrir le même fichier après l'avoir corrigé.
    evenement.target.value = '';
    if (fichier !== undefined) {
      surFichier(fichier);
    }
  };
  return (
    <div className="depot">
      <div className="depot__actions">
        <label className="bouton bouton--plein depot__fichier">
          {ATELIER.boutonFichier}
          <input className="visuellement-cache" type="file" accept={FORMATS_ACCEPTES} onChange={choisir} />
        </label>
        <button type="button" className="bouton bouton--contour" onClick={surExemple}>
          {ATELIER.boutonExemple}
        </button>
      </div>
      <p className="depot__note">{ATELIER.confidentialite}</p>
      <p className="depot__note">
        {ATELIER.formats} Jusqu'à {LIMITES.octetsMax / OCTETS_PAR_MO} Mo et {formaterNombre(LIMITES.lignesMax)}{' '}
        lignes.
      </p>
    </div>
  );
}

function Limites() {
  const { titre, elements } = ATELIER.limites;
  return (
    <aside className="methode__manques atelier__limites" aria-labelledby="titre-limites-atelier">
      <h2 id="titre-limites-atelier">{titre}</h2>
      <ul>
        {elements.map((element) => (
          <li key={element}>{element}</li>
        ))}
      </ul>
    </aside>
  );
}

export function Atelier() {
  const [etat, setEtat] = useState<Etat>({ phase: 'attente' });

  const ouvrir = (fichier: File) => {
    setEtat({ phase: 'lecture' });
    lireFichier(fichier)
      .then((tableau) => setEtat(etatDe(tableau)))
      .catch((erreur: unknown) => setEtat({ phase: 'erreur', message: messageDe(erreur) }));
  };
  const ouvrirExemple = () => {
    try {
      setEtat(etatDe(tableauExemple()));
    } catch (erreur) {
      setEtat({ phase: 'erreur', message: messageDe(erreur) });
    }
  };

  return (
    <>
      <TetePage titre={ATELIER.titre} texte={ATELIER.texte} />
      <div className="largeur atelier">
        <Depot surFichier={ouvrir} surExemple={ouvrirExemple} />
        <div aria-live="polite">
          {etat.phase === 'lecture' && <p className="atelier__etat">{ATELIER.lecture}</p>}
          {etat.phase === 'erreur' && (
            <p className="atelier__etat atelier__etat--erreur" role="alert">
              <strong>{ATELIER.erreur}</strong> {etat.message}
            </p>
          )}
          {etat.phase === 'pret' && <Resultat tableau={etat.tableau} rapport={etat.rapport} />}
        </div>
        <Limites />
      </div>
    </>
  );
}
