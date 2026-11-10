"""Commande unique : reconstruit la base et le fichier de données de l'application.

Usage, depuis la racine du projet :  python -m obscima.construire
"""

from __future__ import annotations

import datetime
import logging
import sqlite3
import sys
from contextlib import closing
from dataclasses import dataclass
from pathlib import Path

from obscima.db import charger_registre, inserer_observations, ouvrir_base
from obscima.export_json import exporter_json
from obscima.import_csv import lire_observations_csv

MAX_FICHIERS_SAISIE: int = 500
JOURNAL = logging.getLogger("obscima.construire")


@dataclass(frozen=True)
class Chemins:
    """Emplacements utilisés par la reconstruction, relatifs à la racine du projet."""

    schema: Path
    registre: Path
    dossier_saisie: Path
    base: Path
    json_application: Path


def chemins_par_defaut(racine: Path) -> Chemins:
    """Retourne les emplacements standards du projet.

    Pré : racine est le dossier qui contient schema.sql.
    Lève : FileNotFoundError si schema.sql n'y est pas.
    """
    if not (racine / "schema.sql").is_file():
        raise FileNotFoundError(f"schema.sql introuvable dans {racine} : lancer depuis la racine")
    return Chemins(
        schema=racine / "schema.sql",
        registre=racine / "sources" / "registre_sources.csv",
        dossier_saisie=racine / "data" / "saisie",
        base=racine / "data" / "base" / "observatoire.sqlite",
        json_application=racine / "app" / "public" / "data" / "observatoire.json",
    )


def reconstruire(chemins: Chemins, date_mise_a_jour: str) -> int:
    """Recharge le registre et toutes les saisies, puis exporte le JSON de l'application.

    Pré : au moins un fichier .csv dans le dossier de saisie.
    Post : la base ne contient que le contenu des fichiers de saisie ; retourne le nombre
           d'observations exportées (>= 1).
    Lève : FileNotFoundError, ValueError, LookupError, sqlite3.IntegrityError.
    """
    fichiers = sorted(chemins.dossier_saisie.glob("*.csv"))
    if not 0 < len(fichiers) <= MAX_FICHIERS_SAISIE:
        raise ValueError(
            f"{len(fichiers)} fichier(s) .csv dans {chemins.dossier_saisie} "
            f"(attendu : 1 à {MAX_FICHIERS_SAISIE})"
        )

    with closing(ouvrir_base(chemins.base, chemins.schema)) as connexion:
        _vider_observations(connexion)
        charger_registre(connexion, chemins.registre)
        for fichier in fichiers:  # R2 : borné par MAX_FICHIERS_SAISIE
            nombre = inserer_observations(connexion, lire_observations_csv(fichier))
            JOURNAL.info("%s : %d observations", fichier.name, nombre)
        return exporter_json(connexion, chemins.json_application, date_mise_a_jour)


def _vider_observations(connexion: sqlite3.Connection) -> None:
    """Supprime les observations existantes : la base est toujours reconstruite en entier."""
    with connexion:
        connexion.execute("DELETE FROM observation")
    restant = connexion.execute("SELECT COUNT(*) FROM observation").fetchone()[0]
    assert restant == 0  # invariant : la suppression vient d'être validée


def main() -> int:
    """Point d'entrée de la commande. Retourne 0 si tout s'est bien passé, 1 sinon."""
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    try:
        chemins = chemins_par_defaut(Path.cwd())
        total = reconstruire(chemins, datetime.date.today().isoformat())
    except (FileNotFoundError, ValueError, LookupError, sqlite3.IntegrityError) as erreur:
        JOURNAL.error("Reconstruction interrompue : %s", erreur)
        return 1
    JOURNAL.info("%d observations exportées vers %s", total, chemins.json_application)
    return 0


if __name__ == "__main__":
    sys.exit(main())
