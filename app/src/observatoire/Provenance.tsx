import { ETATS } from '../contenu';
import { type Donnees, type Observation, sourceDe, type Statut } from '../lib/donnees';

/** Pastille d'état : une forme et un texte, jamais la couleur seule. */
export function Etat({ statut }: { statut: Statut }) {
  return (
    <span className={`etat etat--${statut}`}>
      <span className="etat__signe" aria-hidden="true">
        {statut === 'verifie' ? '✓' : '!'}
      </span>
      {ETATS[statut]}
    </span>
  );
}

/** Ligne « qui a produit le chiffre, où il a été lu », avec le lien vers le document. */
export function Provenance({ donnees, observation }: { donnees: Donnees; observation: Observation }) {
  const source = sourceDe(donnees, observation.id_source);
  return (
    <p className="provenance">
      <span>Chiffre de {observation.origine}.</span>{' '}
      {source !== undefined && (
        <a href={source.url} target="_blank" rel="noreferrer">
          Ouvrir la source
          <span className="visuellement-cache"> (nouvel onglet)</span>
        </a>
      )}{' '}
      <Etat statut={observation.statut} />
    </p>
  );
}
