import { useId, useState } from 'react';

import { libelleIndicateur, SOURCES } from '../contenu';
import { type Donnees, type Observation, sourceDe } from '../lib/donnees';
import { formaterValeur } from '../lib/format';
import { Etat } from './Provenance';

function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function texteCherchable(donnees: Donnees, observation: Observation): string {
  const source = sourceDe(donnees, observation.id_source);
  return normaliser(
    [
      libelleIndicateur(observation.indicateur),
      observation.exercice,
      observation.branche,
      observation.origine,
      observation.unite,
      source?.editeur ?? '',
    ].join(' '),
  );
}

export function Sources({ donnees }: { donnees: Donnees }) {
  const [recherche, setRecherche] = useState('');
  const idChamp = useId();
  const mots = normaliser(recherche).split(/\s+/).filter((mot) => mot !== '');
  const resultats = donnees.observations.filter((observation) => {
    const texte = texteCherchable(donnees, observation);
    return mots.every((mot) => texte.includes(mot));
  });

  return (
    <section id="sources" className="section largeur" aria-labelledby="titre-sources">
      <h2 id="titre-sources" className="section__titre">
        {SOURCES.titre}
      </h2>
      <p className="section__texte">{SOURCES.texte}</p>

      <div className="recherche">
        <label htmlFor={idChamp}>{SOURCES.recherche}</label>
        <input
          id={idChamp}
          type="search"
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
          autoComplete="off"
        />
        <p className="recherche__compte" aria-live="polite">
          {resultats.length} chiffre{resultats.length > 1 ? 's' : ''} sur {donnees.observations.length}
        </p>
      </div>

      {resultats.length === 0 ? (
        <p className="tuile__absent">{SOURCES.aucunResultat}</p>
      ) : (
        <div className="tableau-defilant">
          <table className="tableau tableau--sources">
            <caption className="visuellement-cache">{SOURCES.titre}</caption>
            <thead>
              <tr>
                <th scope="col">Indicateur</th>
                <th scope="col">Année</th>
                <th scope="col" className="tableau__nombre">
                  Valeur
                </th>
                <th scope="col">Organisme</th>
                <th scope="col">Lu dans</th>
                <th scope="col">État</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((observation) => {
                const source = sourceDe(donnees, observation.id_source);
                const precision = observation.branche === 'Toutes' ? '' : `, ${observation.branche.toLowerCase()}`;
                return (
                  <tr
                    key={`${observation.indicateur}-${observation.exercice}-${observation.branche}-${observation.id_source}`}
                  >
                    <th scope="row">
                      {libelleIndicateur(observation.indicateur)}
                      {precision}
                    </th>
                    <td>{observation.exercice}</td>
                    <td className="tableau__nombre">{formaterValeur(observation.valeur, observation.unite)}</td>
                    <td>{observation.origine}</td>
                    <td>
                      {source === undefined ? (
                        observation.id_source
                      ) : (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.editeur}
                          <span className="visuellement-cache"> (nouvel onglet)</span>
                        </a>
                      )}
                    </td>
                    <td>
                      <Etat statut={observation.statut} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
