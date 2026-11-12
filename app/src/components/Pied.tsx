import { NOM_ENTREPRISE, PAGES, PIED } from '../contenu';
import { formaterDate } from '../lib/format';
import { Lien } from '../navigation';

/** Pied de page. La date n'est affichée que si les chiffres de l'observatoire sont chargés. */
export function Pied({ misAJourLe }: { misAJourLe: string | null }) {
  return (
    <footer className="pied">
      <div className="largeur">
        <div className="pied__haut">
          <p className="pied__mention">{PIED.mention}</p>
          <nav aria-label="Pages du site, en bas de page">
            <ul className="pied__liens">
              {PAGES.map((page) => (
                <li key={page.id}>
                  <Lien vers={page.segment}>{page.libelle}</Lien>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="pied__nom" aria-hidden="true">
          {NOM_ENTREPRISE}
        </p>
        <p className="pied__date">
          {misAJourLe === null
            ? PIED.sansDate
            : `${PIED.avecDate} ${formaterDate(misAJourLe)}.`}
        </p>
      </div>
    </footer>
  );
}
