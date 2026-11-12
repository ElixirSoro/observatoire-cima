import { Entete } from './components/Entete';
import { Pied } from './components/Pied';
import type { IdPage } from './contenu';
import type { EtatDonnees } from './lib/donnees';
import { FournisseurNavigation, ID_CONTENU, useNavigation } from './navigation';
import { useDonnees } from './observatoire/useDonnees';
import { Accueil } from './pages/Accueil';
import { Atelier } from './pages/Atelier';
import { Contact } from './pages/Contact';
import { Methode } from './pages/Methode';
import { Observatoire } from './pages/Observatoire';
import { Offres } from './pages/Offres';

function ContenuPage({ id, etat }: { id: IdPage; etat: EtatDonnees }) {
  switch (id) {
    case 'accueil':
      return <Accueil etat={etat} />;
    case 'offres':
      return <Offres />;
    case 'atelier':
      return <Atelier />;
    case 'observatoire':
      return <Observatoire etat={etat} />;
    case 'methode':
      return <Methode />;
    case 'contact':
      return <Contact />;
  }
}

function Site() {
  const { racine, page } = useNavigation();
  const etat = useDonnees(racine);
  return (
    <>
      <a className="lien-evitement" href={`#${ID_CONTENU}`}>
        Aller au contenu
      </a>
      <Entete />
      <main id={ID_CONTENU} tabIndex={-1}>
        <ContenuPage id={page.id} etat={etat} />
      </main>
      <Pied misAJourLe={etat.phase === 'pret' ? etat.donnees.mis_a_jour_le : null} />
    </>
  );
}

export function App() {
  return (
    <FournisseurNavigation>
      <Site />
    </FournisseurNavigation>
  );
}
