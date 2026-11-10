import { APPEL } from '../contenu';
import { type Donnees, versCsv } from '../lib/donnees';

const NOM_FICHIER_CSV = 'observatoire-cima.csv';

function telechargerCsv(donnees: Donnees): void {
  const fichier = new Blob([versCsv(donnees.observations)], { type: 'text/csv;charset=utf-8' });
  const adresse = URL.createObjectURL(fichier);
  const lien = document.createElement('a');
  lien.href = adresse;
  lien.download = NOM_FICHIER_CSV;
  lien.click();
  URL.revokeObjectURL(adresse);
}

export function Appel({ donnees }: { donnees: Donnees }) {
  return (
    <section className="appel" aria-labelledby="titre-appel">
      <div className="largeur appel__contenu">
        <div>
          <h2 id="titre-appel" className="appel__titre">
            {APPEL.titre}
          </h2>
          <p className="appel__texte">{APPEL.texte}</p>
        </div>
        <div className="appel__actions">
          <button type="button" className="bouton bouton--plein" onClick={() => telechargerCsv(donnees)}>
            {APPEL.boutonCsv}
          </button>
          <a
            className="bouton bouton--contour"
            href={`${import.meta.env.BASE_URL}data/observatoire.json`}
            download="observatoire-cima.json"
          >
            {APPEL.boutonJson}
          </a>
        </div>
      </div>
    </section>
  );
}
