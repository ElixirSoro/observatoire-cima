import { SECTIONS, SOMMAIRE } from '../contenu';

/** Liens vers les sections de la page de l'observatoire. */
export function Sommaire() {
  return (
    <nav className="sommaire largeur" aria-labelledby="titre-sommaire">
      <p id="titre-sommaire" className="sommaire__titre">
        {SOMMAIRE.titre}
      </p>
      <ul className="sommaire__liens">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.libelle}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
