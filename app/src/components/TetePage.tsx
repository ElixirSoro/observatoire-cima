/** Haut d'une page intérieure : son titre principal et une phrase d'introduction. */
export function TetePage({ titre, texte }: { titre: string; texte: string }) {
  return (
    <header className="tete-page largeur">
      <h1 className="tete-page__titre">{titre}</h1>
      <p className="tete-page__texte">{texte}</p>
    </header>
  );
}
