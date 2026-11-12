import { Appel } from '../components/Appel';
import { Maree } from '../components/Maree';
import { ACCUEIL, APPEL_CONTACT, CHIFFRES_CLES, OFFRES, PAGE_METHODE } from '../contenu';
import { type EtatDonnees, trouver } from '../lib/donnees';
import { formaterFourchetteFcfa, formaterNombre } from '../lib/format';
import { Lien } from '../navigation';
import { Provenance } from '../observatoire/Provenance';

const NOMBRE_REGLES_APERCU = 3;

function HeroAccueil() {
  return (
    <section className="hero hero--accueil">
      <Maree />
      <div className="hero__contenu largeur">
        <h1 className="hero__titre">{ACCUEIL.titre}</h1>
        <p className="hero__texte">{ACCUEIL.texte}</p>
        <div className="hero__actions">
          <Lien className="bouton bouton--plein" vers="offres">
            {ACCUEIL.boutonPrincipal}
          </Lien>
          <Lien className="bouton bouton--contour" vers="observatoire">
            {ACCUEIL.boutonSecondaire}
          </Lien>
        </div>
      </div>
    </section>
  );
}

function ApercuOffres() {
  return (
    <section className="section largeur" aria-labelledby="titre-apercu-offres">
      <h2 id="titre-apercu-offres" className="section__titre">
        {ACCUEIL.offres.titre}
      </h2>
      <div className="cartes">
        {OFFRES.map((offre) => (
          <article key={offre.id} className="carte">
            <h3 className="carte__titre">{offre.titre}</h3>
            <p className="carte__texte">{offre.resume}</p>
            <p className="carte__prix">{formaterFourchetteFcfa(offre.prixMinFcfa, offre.prixMaxFcfa)}</p>
          </article>
        ))}
      </div>
      <p className="section__suite">
        <Lien className="bouton bouton--contour" vers="offres">
          {ACCUEIL.offres.lien}
        </Lien>
      </p>
    </section>
  );
}

/** Le premier chiffre clé de l'observatoire, s'il est chargé et présent dans la base. */
function ChiffreVedette({ etat }: { etat: EtatDonnees }) {
  const chiffre = CHIFFRES_CLES[0];
  if (etat.phase !== 'pret' || chiffre === undefined) {
    return null;
  }
  const observation = trouver(etat.donnees.observations, chiffre.critere);
  if (observation === undefined) {
    return null;
  }
  return (
    <div className="apercu__chiffre">
      <p className="tuile__titre">{chiffre.titre}</p>
      <p className="apercu__valeur">
        {formaterNombre(observation.valeur)}
        <span className="tuile__unite">{observation.unite}</span>
      </p>
      <Provenance donnees={etat.donnees} observation={observation} />
    </div>
  );
}

function ApercuObservatoire({ etat }: { etat: EtatDonnees }) {
  return (
    <section className="section largeur" aria-labelledby="titre-apercu-observatoire">
      <div className="apercu">
        <div>
          <h2 id="titre-apercu-observatoire" className="section__titre">
            {ACCUEIL.observatoire.titre}
          </h2>
          <p className="section__texte">{ACCUEIL.observatoire.texte}</p>
          <p className="section__suite">
            <Lien className="bouton bouton--contour" vers="observatoire">
              {ACCUEIL.observatoire.lien}
            </Lien>
          </p>
        </div>
        <ChiffreVedette etat={etat} />
      </div>
    </section>
  );
}

function ApercuMethode() {
  return (
    <section className="section largeur" aria-labelledby="titre-apercu-methode">
      <h2 id="titre-apercu-methode" className="section__titre">
        {ACCUEIL.methode.titre}
      </h2>
      <div className="cartes">
        {PAGE_METHODE.regles.slice(0, NOMBRE_REGLES_APERCU).map((regle) => (
          <article key={regle.titre} className="carte">
            <h3 className="carte__titre">{regle.titre}</h3>
            <p className="carte__texte">{regle.texte}</p>
          </article>
        ))}
      </div>
      <p className="section__suite">
        <Lien className="bouton bouton--contour" vers="methode">
          {ACCUEIL.methode.lien}
        </Lien>
      </p>
    </section>
  );
}

export function Accueil({ etat }: { etat: EtatDonnees }) {
  return (
    <>
      <HeroAccueil />
      <ApercuOffres />
      <ApercuObservatoire etat={etat} />
      <ApercuMethode />
      <Appel id="titre-appel-accueil" titre={APPEL_CONTACT.titre} texte={APPEL_CONTACT.texte}>
        <Lien className="bouton bouton--plein" vers="contact">
          {APPEL_CONTACT.bouton}
        </Lien>
      </Appel>
    </>
  );
}
