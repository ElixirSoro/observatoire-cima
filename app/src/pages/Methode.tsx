import { Appel } from '../components/Appel';
import { TetePage } from '../components/TetePage';
import { APPEL_CONTACT, PAGE_METHODE } from '../contenu';
import { Lien } from '../navigation';

export function Methode() {
  const { regles, limites } = PAGE_METHODE;
  return (
    <>
      <TetePage titre={PAGE_METHODE.titre} texte={PAGE_METHODE.texte} />
      <div className="largeur">
        <div className="methode">
          <dl className="methode__regles">
            {regles.map((regle) => (
              <div key={regle.titre}>
                <dt>{regle.titre}</dt>
                <dd>{regle.texte}</dd>
              </div>
            ))}
          </dl>
          <aside className="methode__manques" aria-labelledby="titre-limites">
            <h2 id="titre-limites">{limites.titre}</h2>
            <ul>
              {limites.elements.map((element) => (
                <li key={element}>{element}</li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
      <Appel id="titre-appel-methode" titre={APPEL_CONTACT.titre} texte={APPEL_CONTACT.texte}>
        <Lien className="bouton bouton--plein" vers="contact">
          {APPEL_CONTACT.bouton}
        </Lien>
        <Lien className="bouton bouton--contour" vers="offres">
          {APPEL_CONTACT.boutonOffres}
        </Lien>
      </Appel>
    </>
  );
}
