import { ATELIER } from '../contenu';
import { formaterNombre } from '../lib/format';
import { type Constat, redigerConstats } from './constats';
import { decrireResume } from './libelles';
import type { RapportQualite } from './qualite';
import { PREMIERE_LIGNE_DE_DONNEES, type Tableau } from './tableau';
import { afficherCellule } from './valeurs';

const LIGNES_APERCU = 15;
const DECIMALES_PART = 1;

function Tuiles({ rapport }: { rapport: RapportQualite }) {
  const remplissage =
    rapport.tauxRemplissage === null ? '—' : `${formaterNombre(rapport.tauxRemplissage, DECIMALES_PART)} %`;
  const tuiles = [
    { titre: ATELIER.tuiles.lignes, valeur: formaterNombre(rapport.nombreLignes) },
    { titre: ATELIER.tuiles.colonnes, valeur: formaterNombre(rapport.nombreColonnes) },
    { titre: ATELIER.tuiles.remplissage, valeur: remplissage },
    { titre: ATELIER.tuiles.doublons, valeur: formaterNombre(rapport.doublons.nombre) },
  ];
  return (
    <dl className="mesures">
      {tuiles.map((tuile) => (
        <div key={tuile.titre}>
          <dt>{tuile.titre}</dt>
          <dd>{tuile.valeur}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListeConstats({ constats }: { constats: Constat[] }) {
  if (constats.length === 0) {
    return <p className="constats__aucun">{ATELIER.constats.aucun}</p>;
  }
  return (
    <ul className="constats">
      {constats.map((constat) => (
        <li key={constat.texte} className={`constat constat--${constat.niveau}`}>
          <span className="constat__niveau">{ATELIER.constats.niveaux[constat.niveau]}</span>
          <span>{constat.texte}</span>
        </li>
      ))}
    </ul>
  );
}

function TableauColonnes({ rapport }: { rapport: RapportQualite }) {
  const { entetes } = ATELIER.colonnes;
  return (
    <div className="tableau-defilant">
      <table className="tableau tableau--colonnes">
        <thead>
          <tr>
            <th scope="col">{entetes.nom}</th>
            <th scope="col">{entetes.genre}</th>
            <th scope="col" className="tableau__nombre">
              {entetes.remplissage}
            </th>
            <th scope="col">{entetes.resume}</th>
          </tr>
        </thead>
        <tbody>
          {rapport.colonnes.map((colonne, rang) => {
            const total = colonne.remplies + colonne.vides;
            const part = total === 0 ? '—' : `${formaterNombre((colonne.remplies / total) * 100, DECIMALES_PART)} %`;
            return (
              <tr key={`${rang}-${colonne.nom}`}>
                <th scope="row">{colonne.nom}</th>
                <td>{ATELIER.genres[colonne.genre]}</td>
                <td className="tableau__nombre">{part}</td>
                <td>{decrireResume(colonne.resume)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Apercu({ tableau }: { tableau: Tableau }) {
  const lignes = tableau.lignes.slice(0, LIGNES_APERCU);
  return (
    <div className="tableau-defilant">
      <table className="tableau tableau--apercu">
        <thead>
          <tr>
            <th scope="col">{ATELIER.apercu.ligne}</th>
            {tableau.entetes.map((entete, rang) => (
              <th key={`${rang}-${entete}`} scope="col">
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, rang) => (
            <tr key={rang}>
              <th scope="row">{rang + PREMIERE_LIGNE_DE_DONNEES}</th>
              {ligne.map((cellule, colonne) =>
                cellule === null ? (
                  <td key={colonne} className="tableau__vide">
                    {ATELIER.apercu.vide}
                  </td>
                ) : (
                  <td key={colonne}>{afficherCellule(cellule)}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Origine({ tableau }: { tableau: Tableau }) {
  return (
    <p className="resultat__origine">
      <strong>{tableau.nom}</strong>
      {tableau.feuille !== null && ` · ${ATELIER.resultat.feuille} : ${tableau.feuille}`}
      {tableau.autresFeuilles.length > 0 &&
        ` · ${ATELIER.resultat.autresFeuilles} : ${tableau.autresFeuilles.join(', ')}`}
    </p>
  );
}

/** L'état d'un fichier lu : mesures, défauts trouvés, colonnes, aperçu. */
export function Resultat({ tableau, rapport }: { tableau: Tableau; rapport: RapportQualite }) {
  return (
    <section className="resultat" aria-labelledby="titre-resultat">
      <h2 id="titre-resultat" className="section__titre">
        {ATELIER.resultat.titre}
      </h2>
      <Origine tableau={tableau} />
      <Tuiles rapport={rapport} />
      <h3 className="resultat__sous-titre">{ATELIER.constats.titre}</h3>
      <ListeConstats constats={redigerConstats(rapport)} />
      <h3 className="resultat__sous-titre">{ATELIER.colonnes.titre}</h3>
      <TableauColonnes rapport={rapport} />
      <h3 className="resultat__sous-titre">{ATELIER.apercu.titre}</h3>
      <p className="section__texte">{ATELIER.apercu.texte}</p>
      <Apercu tableau={tableau} />
    </section>
  );
}
