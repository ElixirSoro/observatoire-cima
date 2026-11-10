import { NOM_DU_SITE, PIED, SECTIONS } from '../contenu';
import type { Donnees } from '../lib/donnees';
import { formaterDate } from '../lib/format';

export function Pied({ donnees }: { donnees: Donnees }) {
  return (
    <footer className="pied">
      <div className="largeur">
        <div className="pied__haut">
          <p className="pied__mention">{PIED.mention}</p>
          <nav aria-label="Sections, en bas de page">
            <ul className="pied__liens">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.libelle}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="pied__nom" aria-hidden="true">
          {NOM_DU_SITE}
        </p>
        <p className="pied__date">Mis à jour le {formaterDate(donnees.mis_a_jour_le)}.</p>
      </div>
    </footer>
  );
}
