import { Appel } from '../components/Appel';
import { TetePage } from '../components/TetePage';
import { APPEL_CONTACT, type Offre, OFFRES, PAGE_OFFRES } from '../contenu';
import { formaterFourchetteFcfa } from '../lib/format';
import { Lien } from '../navigation';

function FicheOffre({ offre }: { offre: Offre }) {
  const idTitre = `titre-offre-${offre.id}`;
  return (
    <article className="offre" aria-labelledby={idTitre}>
      <div>
        <h2 id={idTitre} className="offre__titre">
          {offre.titre}
        </h2>
        <p className="offre__resume">{offre.resume}</p>
        <p className="offre__pour-qui">{offre.pourQui}</p>
      </div>
      <dl className="offre__fiche">
        <div>
          <dt>{PAGE_OFFRES.libelles.livrables}</dt>
          <dd>
            <ul className="offre__livrables">
              {offre.livrables.map((livrable) => (
                <li key={livrable}>{livrable}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>{PAGE_OFFRES.libelles.delai}</dt>
          <dd>{offre.delai}</dd>
        </div>
        <div>
          <dt>{PAGE_OFFRES.libelles.prix}</dt>
          <dd className="offre__prix">{formaterFourchetteFcfa(offre.prixMinFcfa, offre.prixMaxFcfa)}</dd>
        </div>
      </dl>
    </article>
  );
}

function Deroulement() {
  const { titre, etapes } = PAGE_OFFRES.deroulement;
  return (
    <section className="section largeur" aria-labelledby="titre-deroulement">
      <h2 id="titre-deroulement" className="section__titre">
        {titre}
      </h2>
      <ol className="etapes">
        {etapes.map((etape, rang) => (
          <li key={etape.titre}>
            <span className="etapes__rang" aria-hidden="true">
              {rang + 1}
            </span>
            <h3 className="carte__titre">{etape.titre}</h3>
            <p className="carte__texte">{etape.texte}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Offres() {
  return (
    <>
      <TetePage titre={PAGE_OFFRES.titre} texte={PAGE_OFFRES.texte} />
      <div className="largeur offres">
        {OFFRES.map((offre) => (
          <FicheOffre key={offre.id} offre={offre} />
        ))}
        <p className="offres__note">{PAGE_OFFRES.notePrix}</p>
      </div>
      <Deroulement />
      <Appel id="titre-appel-offres" titre={APPEL_CONTACT.titre} texte={APPEL_CONTACT.texte}>
        <Lien className="bouton bouton--plein" vers="contact">
          {APPEL_CONTACT.bouton}
        </Lien>
      </Appel>
    </>
  );
}
