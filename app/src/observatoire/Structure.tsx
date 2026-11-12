import { STRUCTURE } from '../contenu';
import { type Donnees, partEnPourcent, trouver } from '../lib/donnees';
import { formaterNombre } from '../lib/format';
import { Provenance } from './Provenance';

const MILLIERS_PAR_MILLIARD = 1_000_000;

export function Structure({ donnees }: { donnees: Donnees }) {
  const { partage, exercice } = STRUCTURE;
  const vie = trouver(donnees.observations, {
    indicateur: partage.indicateur,
    exercice,
    branche: partage.brancheVie,
  });
  const total = trouver(donnees.observations, {
    indicateur: partage.indicateur,
    exercice,
    branche: partage.brancheTotal,
  });
  const partVie = vie !== undefined && total !== undefined ? partEnPourcent(vie.valeur, total.valeur) : null;

  return (
    <section id="structure" className="section largeur" aria-labelledby="titre-structure">
      <h2 id="titre-structure" className="section__titre">
        {STRUCTURE.titre}
      </h2>
      <p className="section__texte">{STRUCTURE.texte}</p>

      <div className="structure">
        <div className="structure__partage">
          <h3 className="structure__sous-titre">{partage.titre}</h3>
          {partVie === null || vie === undefined || total === undefined ? (
            <p className="tuile__absent">
              La répartition vie et non-vie n'est pas encore dans la base pour {exercice}.
            </p>
          ) : (
            <>
              <div
                className="partage"
                role="img"
                aria-label={`Vie ${formaterNombre(partVie, 1)} %, non-vie ${formaterNombre(100 - partVie, 1)} %`}
              >
                <div className="partage__segment serie-1" style={{ width: `${partVie}%` }} />
                <div className="partage__segment serie-2" style={{ width: `${100 - partVie}%` }} />
              </div>
              <dl className="partage__legende">
                <div>
                  <dt>
                    <span className="legende__pastille serie-1" aria-hidden="true" />
                    Vie
                  </dt>
                  <dd>
                    {formaterNombre(partVie, 1)} %, soit{' '}
                    {formaterNombre(vie.valeur / MILLIERS_PAR_MILLIARD, 1)} milliards FCFA
                  </dd>
                </div>
                <div>
                  <dt>
                    <span className="legende__pastille serie-2" aria-hidden="true" />
                    Non-vie
                  </dt>
                  <dd>
                    {formaterNombre(100 - partVie, 1)} %, soit{' '}
                    {formaterNombre((total.valeur - vie.valeur) / MILLIERS_PAR_MILLIARD, 1)} milliards
                    FCFA
                  </dd>
                </div>
              </dl>
              <p className="structure__note">{partage.note}</p>
              <Provenance donnees={donnees} observation={vie} />
            </>
          )}
        </div>

        <div className="structure__acteurs">
          <h3 className="structure__sous-titre">Les acteurs</h3>
          <ul className="acteurs">
            {STRUCTURE.acteurs.map((acteur) => {
              const observation = trouver(donnees.observations, {
                indicateur: acteur.indicateur,
                exercice,
                branche: acteur.branche,
              });
              return (
                <li key={acteur.libelle}>
                  <span className="acteurs__nombre">
                    {observation === undefined ? 'n. c.' : formaterNombre(observation.valeur)}
                  </span>
                  <span>{acteur.libelle}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
