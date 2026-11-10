import { HERO } from '../contenu';
import type { Donnees } from '../lib/donnees';
import { formaterDate } from '../lib/format';
import { Maree } from './Maree';

export function Hero({ donnees }: { donnees: Donnees }) {
  const nombreChiffres = donnees.observations.length;
  const nombreSources = donnees.sources.length;
  return (
    <section className="hero">
      <Maree />
      <div className="hero__contenu largeur">
        <h1 className="hero__titre">{HERO.titre}</h1>
        <p className="hero__texte">{HERO.texte}</p>
        <div className="hero__actions">
          <a className="bouton bouton--plein" href={HERO.boutonPrincipal.cible}>
            {HERO.boutonPrincipal.libelle}
          </a>
          <a className="bouton bouton--contour" href={HERO.boutonSecondaire.cible}>
            {HERO.boutonSecondaire.libelle}
          </a>
        </div>
        <p className="hero__etat">
          {nombreChiffres} chiffres tirés de {nombreSources} sources publiques. Mis à jour le{' '}
          {formaterDate(donnees.mis_a_jour_le)}.
        </p>
      </div>
    </section>
  );
}
