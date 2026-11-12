/**
 * Navigation entre les pages sans recharger le site.
 *
 * Chaque page a une adresse réelle (un fichier index.html par page) : un lien ouvert dans
 * un nouvel onglet ou une page rechargée fonctionnent sans ce code. Ce code évite seulement
 * le rechargement quand on passe d'une page à l'autre.
 */

import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type Page, PAGES_PUBLIEES } from './contenu';
import { adresseDe, lireChemin } from './lib/chemins';

const ID_CONTENU = 'contenu';
const BOUTON_PRINCIPAL = 0;
const SEGMENTS = PAGES_PUBLIEES.map((page) => page.segment).filter((segment) => segment !== '');

interface Navigation {
  /** Adresse du dossier racine du site, terminée par « / ». */
  racine: string;
  page: Page;
  /** Affiche la page dont le segment est donné, et l'inscrit dans l'historique. */
  aller: (segment: string) => void;
}

const Contexte = createContext<Navigation | null>(null);

function pageDuSegment(segment: string): Page {
  const page = PAGES_PUBLIEES.find((candidate) => candidate.segment === segment);
  if (page === undefined) {
    throw new Error(`Aucune page ne correspond au segment « ${segment} ».`);
  }
  return page;
}

/** Après un changement de page : titre de l'onglet, haut de page, et lecture reprise au contenu. */
function annoncerPage(page: Page): void {
  document.title = page.titre;
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.getElementById(ID_CONTENU)?.focus({ preventScroll: true });
}

export function FournisseurNavigation({ children }: { children: ReactNode }) {
  const [chemin, setChemin] = useState(() => window.location.pathname);
  const aNavigue = useRef(false);
  const { racine, segment } = lireChemin(chemin, SEGMENTS);
  const page = pageDuSegment(segment);

  useEffect(() => {
    const suivreHistorique = () => {
      aNavigue.current = true;
      setChemin(window.location.pathname);
    };
    window.addEventListener('popstate', suivreHistorique);
    return () => window.removeEventListener('popstate', suivreHistorique);
  }, []);

  useEffect(() => {
    if (aNavigue.current) {
      annoncerPage(page);
    } else {
      document.title = page.titre;
    }
  }, [page]);

  const aller = useCallback(
    (cible: string) => {
      const adresse = adresseDe(racine, pageDuSegment(cible).segment);
      aNavigue.current = true;
      window.history.pushState(null, '', adresse);
      setChemin(adresse);
    },
    [racine],
  );

  const valeur = useMemo(() => ({ racine, page, aller }), [racine, page, aller]);
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useNavigation(): Navigation {
  const navigation = useContext(Contexte);
  if (navigation === null) {
    throw new Error('useNavigation doit être appelé sous FournisseurNavigation.');
  }
  return navigation;
}

function estClicSimple(evenement: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    evenement.button === BOUTON_PRINCIPAL &&
    !evenement.metaKey &&
    !evenement.ctrlKey &&
    !evenement.shiftKey &&
    !evenement.altKey
  );
}

interface ProprietesLien {
  /** Segment de la page visée ; chaîne vide pour l'accueil. */
  vers: string;
  className?: string;
  children: ReactNode;
}

/** Lien vers une page du site. Un clic avec Ctrl, Cmd ou la molette garde son effet habituel. */
export function Lien({ vers, className, children }: ProprietesLien) {
  const { racine, page, aller } = useNavigation();
  const suivre = (evenement: MouseEvent<HTMLAnchorElement>) => {
    if (!estClicSimple(evenement)) {
      return;
    }
    evenement.preventDefault();
    aller(vers);
  };
  return (
    <a
      className={className}
      href={adresseDe(racine, vers)}
      aria-current={page.segment === vers ? 'page' : undefined}
      onClick={suivre}
    >
      {children}
    </a>
  );
}

export { ID_CONTENU };
