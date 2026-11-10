import { useState } from 'react';

import { EVOLUTION } from '../contenu';
import { type Donnees, filtrer, type Observation, sourceDe } from '../lib/donnees';
import { formaterNombre } from '../lib/format';
import { Etat } from './Provenance';

interface Groupe {
  exercice: number;
  barres: Observation[];
  /** Vrai si des années manquent entre ce groupe et le précédent. */
  apresUnTrou: boolean;
}

function grouperParExercice(observations: Observation[]): Groupe[] {
  const groupes: Groupe[] = [];
  for (const observation of observations) {
    const dernier = groupes.at(-1);
    if (dernier !== undefined && dernier.exercice === observation.exercice) {
      dernier.barres.push(observation);
    } else {
      const apresUnTrou = dernier !== undefined && observation.exercice - dernier.exercice > 1;
      groupes.push({ exercice: observation.exercice, barres: [observation], apresUnTrou });
    }
  }
  return groupes;
}

export function Evolution({ donnees }: { donnees: Donnees }) {
  const [vueTableau, setVueTableau] = useState(false);
  const [survol, setSurvol] = useState<Observation | null>(null);

  const observations = filtrer(donnees.observations, EVOLUTION.indicateur);
  const groupes = grouperParExercice(observations);
  // L'ordre des origines fixe la couleur de chaque série : il ne dépend pas des filtres.
  const origines = [...new Set(observations.map((o) => o.origine))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );
  const sourceSurvolee = survol === null ? undefined : sourceDe(donnees, survol.id_source);

  return (
    <section id="evolution" className="section largeur" aria-labelledby="titre-evolution">
      <h2 id="titre-evolution" className="section__titre">
        {EVOLUTION.titre}
      </h2>
      <p className="section__texte">{EVOLUTION.texte}</p>

      <div className="graphique">
        <div className="graphique__barre-outils">
          <ul className="legende" aria-label="Organisme qui publie le chiffre">
            {origines.map((origine, rang) => (
              <li key={origine}>
                <span className={`legende__pastille serie-${rang + 1}`} aria-hidden="true" />
                {origine}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="bouton bouton--discret"
            aria-pressed={vueTableau}
            onClick={() => setVueTableau(!vueTableau)}
          >
            {vueTableau ? 'Voir le graphique' : 'Voir le tableau'}
          </button>
        </div>

        {vueTableau ? (
          <TableauEvolution donnees={donnees} observations={observations} />
        ) : (
          <>
            <div className="barres" role="group" aria-label={`${EVOLUTION.titre}, en ${EVOLUTION.unite}`}>
              <div className="barres__grille" aria-hidden="true">
                {EVOLUTION.graduations.map((graduation) => (
                  <div
                    key={graduation}
                    className="barres__graduation"
                    style={{ bottom: `${(graduation / EVOLUTION.echelleMax) * 100}%` }}
                  >
                    <span>{formaterNombre(graduation)}</span>
                  </div>
                ))}
              </div>
              <div className="barres__groupes">
                {groupes.map((groupe) => (
                  <div
                    key={groupe.exercice}
                    className={groupe.apresUnTrou ? 'barres__groupe barres__groupe--apres-trou' : 'barres__groupe'}
                  >
                    <div className="barres__colonnes">
                      {groupe.barres.map((observation) => (
                        <button
                          key={observation.origine}
                          type="button"
                          className={`barre serie-${origines.indexOf(observation.origine) + 1}`}
                          style={{ height: `${(observation.valeur / EVOLUTION.echelleMax) * 100}%` }}
                          aria-label={`${observation.exercice}, ${observation.origine} : ${formaterNombre(observation.valeur)} ${observation.unite}`}
                          onMouseEnter={() => setSurvol(observation)}
                          onMouseLeave={() => setSurvol(null)}
                          onFocus={() => setSurvol(observation)}
                          onBlur={() => setSurvol(null)}
                        >
                          <span className="barre__valeur barre__valeur--longue">{formaterNombre(observation.valeur, 1)}</span>
                          <span className="barre__valeur barre__valeur--courte">{formaterNombre(observation.valeur, 0)}</span>
                        </button>
                      ))}
                    </div>
                    <span className="barres__annee">{groupe.exercice}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="graphique__detail" aria-live="polite">
              {survol === null ? (
                'Les étiquettes sont arrondies. Survolez ou sélectionnez une barre pour voir le chiffre exact et sa source. Le trait pointillé signale des années non relevées.'
              ) : (
                <>
                  <strong>
                    {survol.exercice} : {formaterNombre(survol.valeur)} {survol.unite}
                  </strong>
                  . Chiffre de {survol.origine}
                  {sourceSurvolee !== undefined && `, lu dans : ${sourceSurvolee.editeur}`}.
                </>
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function TableauEvolution({ donnees, observations }: { donnees: Donnees; observations: Observation[] }) {
  return (
    <div className="tableau-defilant">
      <table className="tableau">
        <caption className="visuellement-cache">{EVOLUTION.titre}</caption>
        <thead>
          <tr>
            <th scope="col">Année</th>
            <th scope="col" className="tableau__nombre">
              {EVOLUTION.unite}
            </th>
            <th scope="col">Organisme</th>
            <th scope="col">Lu dans</th>
            <th scope="col">État</th>
          </tr>
        </thead>
        <tbody>
          {observations.map((observation) => {
            const source = sourceDe(donnees, observation.id_source);
            return (
              <tr key={`${observation.exercice}-${observation.origine}`}>
                <th scope="row">{observation.exercice}</th>
                <td className="tableau__nombre">{formaterNombre(observation.valeur)}</td>
                <td>{observation.origine}</td>
                <td>
                  {source === undefined ? (
                    observation.id_source
                  ) : (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.editeur}
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
  );
}
