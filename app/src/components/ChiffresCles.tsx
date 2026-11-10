import { CHIFFRES_CLES } from '../contenu';
import { type Donnees, trouver } from '../lib/donnees';
import { formaterNombre } from '../lib/format';
import { Provenance } from './Provenance';

export function ChiffresCles({ donnees }: { donnees: Donnees }) {
  return (
    <section id="chiffres-cles" className="section largeur" aria-labelledby="titre-chiffres-cles">
      <h2 id="titre-chiffres-cles" className="section__titre">
        Chiffres clés
      </h2>
      <div className="tuiles">
        {CHIFFRES_CLES.map((chiffre, rang) => {
          const observation = trouver(donnees.observations, chiffre.critere);
          return (
            <article key={chiffre.titre} className={rang === 0 ? 'tuile tuile--grande' : 'tuile'}>
              <h3 className="tuile__titre">{chiffre.titre}</h3>
              {observation === undefined ? (
                <p className="tuile__absent">
                  Ce chiffre n'est pas encore dans la base. Ajoutez-le dans le fichier de saisie.
                </p>
              ) : (
                <>
                  <p className="tuile__valeur">
                    {formaterNombre(observation.valeur)}
                    <span className="tuile__unite">
                      {observation.unite}
                    </span>
                  </p>
                  <p className="tuile__explication">{chiffre.explication}</p>
                  <Provenance donnees={donnees} observation={observation} />
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
