import { useEffect, useState } from 'react';

import { NOM_DU_SITE, SECTIONS } from '../contenu';

/** Barre de navigation fixe : la section en cours de lecture est soulignée. */
export function Entete() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setActive(entree.target.id);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const section of SECTIONS) {
      const element = document.getElementById(section.id);
      if (element !== null) {
        observateur.observe(element);
      }
    }
    return () => observateur.disconnect();
  }, []);

  return (
    <header className="entete">
      <a className="entete__nom" href="#contenu">
        {NOM_DU_SITE}
      </a>
      <nav aria-label="Sections de la page">
        <ul className="entete__liens">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} aria-current={active === section.id ? 'true' : undefined}>
                {section.libelle}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
