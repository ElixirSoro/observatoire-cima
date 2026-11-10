"""Export de la base vers le fichier JSON lu par l'application web."""

from __future__ import annotations

import json
import re
import sqlite3
from pathlib import Path

MOTIF_DATE: re.Pattern[str] = re.compile(r"^\d{4}-\d{2}-\d{2}$")
COLONNES_SOURCE: tuple[str, ...] = (
    "id_source",
    "editeur",
    "titre",
    "exercice",
    "url",
    "acces",
    "date_consultation",
    "notes",
)
COLONNES_OBSERVATION: tuple[str, ...] = (
    "id_source",
    "page",
    "tableau",
    "pays",
    "exercice",
    "entite",
    "branche",
    "indicateur",
    "valeur",
    "unite",
    "origine",
    "statut",
)
SQL_SOURCES: str = (
    "SELECT id_source, editeur, titre, exercice, url, acces, date_consultation, notes "
    "FROM source WHERE id_source IN (SELECT DISTINCT id_source FROM observation) "
    "ORDER BY id_source"
)
SQL_OBSERVATIONS: str = (
    "SELECT id_source, page, tableau, pays, exercice, entite, branche, indicateur, valeur, "
    "unite, origine, statut FROM observation "
    "ORDER BY indicateur, exercice, branche, id_source"
)


def exporter_json(connexion: sqlite3.Connection, chemin_sortie: Path, date_mise_a_jour: str) -> int:
    """Écrit les observations et leurs sources dans un fichier JSON.

    Pré : date_mise_a_jour au format AAAA-MM-JJ ; le dossier de sortie existe ;
          la base contient au moins une observation.
    Post : fichier JSON UTF-8 écrit ; retourne le nombre d'observations exportées (>= 1).
           Seules les sources réellement utilisées sont exportées.
    Lève : ValueError (date invalide, base vide), FileNotFoundError (dossier absent).
    """
    if MOTIF_DATE.fullmatch(date_mise_a_jour) is None:
        raise ValueError(f"Date attendue au format AAAA-MM-JJ (reçu {date_mise_a_jour!r})")
    if not chemin_sortie.parent.is_dir():
        raise FileNotFoundError(f"Dossier de sortie introuvable : {chemin_sortie.parent}")

    observations = [
        dict(zip(COLONNES_OBSERVATION, ligne, strict=True))
        for ligne in connexion.execute(SQL_OBSERVATIONS)
    ]
    if len(observations) == 0:
        raise ValueError("La base ne contient aucune observation à exporter")
    sources = [
        dict(zip(COLONNES_SOURCE, ligne, strict=True)) for ligne in connexion.execute(SQL_SOURCES)
    ]
    assert len(sources) >= 1  # invariant : clé étrangère observation -> source

    contenu = {"mis_a_jour_le": date_mise_a_jour, "sources": sources, "observations": observations}
    chemin_sortie.write_text(
        json.dumps(contenu, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return len(observations)
