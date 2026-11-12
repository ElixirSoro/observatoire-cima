import { TetePage } from '../components/TetePage';
import { COORDONNEES, PAGE_CONTACT } from '../contenu';
import { liensDeContact } from '../lib/contact';

const LIENS = liensDeContact(COORDONNEES);

function Moyens() {
  if (LIENS.length === 0) {
    return <p className="contact__absent">{PAGE_CONTACT.absent}</p>;
  }
  return (
    <ul className="contact__moyens">
      {LIENS.map((lien) => (
        <li key={lien.moyen}>
          <span className="contact__moyen">{PAGE_CONTACT.moyens[lien.moyen]}</span>
          <a className="contact__lien" href={lien.adresse}>
            {lien.libelle}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Contact() {
  const { preparation } = PAGE_CONTACT;
  return (
    <>
      <TetePage titre={PAGE_CONTACT.titre} texte={PAGE_CONTACT.texte} />
      <div className="largeur contact">
        <Moyens />
        <aside className="methode__manques" aria-labelledby="titre-preparation">
          <h2 id="titre-preparation">{preparation.titre}</h2>
          <ul>
            {preparation.elements.map((element) => (
              <li key={element}>{element}</li>
            ))}
          </ul>
        </aside>
        <p className="contact__note">{PAGE_CONTACT.confidentialite}</p>
      </div>
    </>
  );
}
