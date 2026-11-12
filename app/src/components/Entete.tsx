import { NOM_DU_SITE, PAGES_PUBLIEES } from '../contenu';
import { Lien } from '../navigation';

const PAGES_DU_MENU = PAGES_PUBLIEES.filter((page) => page.segment !== '');

/** Barre de navigation fixe : la page affichée est soulignée. */
export function Entete() {
  return (
    <header className="entete">
      <Lien className="entete__nom" vers="">
        {NOM_DU_SITE}
      </Lien>
      <nav aria-label="Pages du site">
        <ul className="entete__liens">
          {PAGES_DU_MENU.map((page) => (
            <li key={page.id}>
              <Lien vers={page.segment}>{page.libelle}</Lien>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
