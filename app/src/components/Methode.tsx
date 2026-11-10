import { METHODE } from '../contenu';

export function Methode() {
  return (
    <section id="methode" className="section largeur" aria-labelledby="titre-methode">
      <h2 id="titre-methode" className="section__titre">
        {METHODE.titre}
      </h2>
      <div className="methode">
        <dl className="methode__regles">
          {METHODE.regles.map((regle) => (
            <div key={regle.titre}>
              <dt>{regle.titre}</dt>
              <dd>{regle.texte}</dd>
            </div>
          ))}
        </dl>
        <aside className="methode__manques" aria-labelledby="titre-manques">
          <h3 id="titre-manques">{METHODE.manques.titre}</h3>
          <ul>
            {METHODE.manques.elements.map((element) => (
              <li key={element}>{element}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
