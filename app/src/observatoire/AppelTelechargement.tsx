import { Appel } from '../components/Appel';
import { APPEL, NOM_FICHIER_OBSERVATOIRE } from '../contenu';
import { type Donnees, versCsv } from '../lib/donnees';
import { useNavigation } from '../navigation';

function telechargerCsv(donnees: Donnees): void {
  const fichier = new Blob([versCsv(donnees.observations)], { type: 'text/csv;charset=utf-8' });
  const adresse = URL.createObjectURL(fichier);
  const lien = document.createElement('a');
  lien.href = adresse;
  lien.download = `${NOM_FICHIER_OBSERVATOIRE}.csv`;
  lien.click();
  URL.revokeObjectURL(adresse);
}

/** Bandeau de téléchargement des chiffres, en CSV ou en JSON. */
export function AppelTelechargement({ donnees }: { donnees: Donnees }) {
  const { racine } = useNavigation();
  return (
    <Appel id="titre-appel" titre={APPEL.titre} texte={APPEL.texte}>
      <button type="button" className="bouton bouton--plein" onClick={() => telechargerCsv(donnees)}>
        {APPEL.boutonCsv}
      </button>
      <a
        className="bouton bouton--contour"
        href={`${racine}data/observatoire.json`}
        download={`${NOM_FICHIER_OBSERVATOIRE}.json`}
      >
        {APPEL.boutonJson}
      </a>
    </Appel>
  );
}
