import type { ReactNode } from 'react';

/** Bandeau d'appel à l'action : un titre, une phrase, un ou deux boutons. */
export function Appel({ id, titre, texte, children }: { id: string; titre: string; texte: string; children: ReactNode }) {
  return (
    <section className="appel" aria-labelledby={id}>
      <div className="largeur appel__contenu">
        <div>
          <h2 id={id} className="appel__titre">
            {titre}
          </h2>
          <p className="appel__texte">{texte}</p>
        </div>
        <div className="appel__actions">{children}</div>
      </div>
    </section>
  );
}
