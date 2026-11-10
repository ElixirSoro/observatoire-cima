"""Base SQLite : création, registre des sources publiques, insertion des observations."""

from __future__ import annotations

import csv
import math
import sqlite3
from collections.abc import Sequence
from dataclasses import astuple, dataclass
from pathlib import Path

ACCES_AUTORISES: frozenset[str] = frozenset({"public_en_ligne", "communique_par_l_organisme"})
COLONNES_REGISTRE: tuple[str, ...] = (
    "id_source",
    "editeur",
    "titre",
    "exercice",
    "url",
    "acces",
    "date_consultation",
    "notes",
)
MAX_LIGNES_REGISTRE: int = 10_000
MAX_OBSERVATIONS_PAR_LOT: int = 100_000
EXERCICE_MIN: int = 1990
EXERCICE_MAX: int = 2100
SQL_SOURCE: str = "INSERT OR REPLACE INTO source VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
SQL_OBSERVATION: str = (
    "INSERT INTO observation (id_source, page, tableau, pays, exercice, entite, branche, "
    "indicateur, valeur, unite, origine) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
)


@dataclass(frozen=True)
class Observation:
    """Un chiffre, avec la source et la page où il peut être relu.

    `origine` nomme l'organisme qui a produit le chiffre (il peut différer de l'éditeur
    du document où on l'a lu).
    """

    id_source: str
    page: int
    tableau: str
    pays: str
    exercice: int
    entite: str
    branche: str
    indicateur: str
    valeur: float
    unite: str
    origine: str


def ouvrir_base(chemin_db: Path, chemin_schema: Path) -> sqlite3.Connection:
    """Ouvre (ou crée) la base et applique le schéma. L'appelant ferme la connexion.

    Pré : chemin_schema existe ; le dossier parent de chemin_db existe.
    Post : connexion ouverte, clés étrangères actives, tables présentes.
    Lève : FileNotFoundError.
    """
    if not chemin_schema.is_file():
        raise FileNotFoundError(f"Schéma introuvable : {chemin_schema}")
    if not chemin_db.parent.is_dir():
        raise FileNotFoundError(f"Dossier de la base introuvable : {chemin_db.parent}")

    connexion = sqlite3.connect(chemin_db)
    connexion.executescript(chemin_schema.read_text(encoding="utf-8"))
    connexion.execute("PRAGMA foreign_keys = ON")
    return connexion


def charger_registre(connexion: sqlite3.Connection, chemin_csv: Path) -> int:
    """Charge le registre des sources. Refuse toute source dont l'accès n'est pas autorisé.

    Pré : CSV UTF-8 avec exactement les colonnes COLONNES_REGISTRE.
    Post : retourne le nombre de sources chargées (>= 1).
    Lève : FileNotFoundError, ValueError (colonnes, accès, URL, exercice, registre vide).
    """
    if not chemin_csv.is_file():
        raise FileNotFoundError(f"Registre introuvable : {chemin_csv}")

    with chemin_csv.open(encoding="utf-8", newline="") as fichier:
        lecteur = csv.DictReader(fichier)
        if tuple(lecteur.fieldnames or ()) != COLONNES_REGISTRE:
            raise ValueError(f"Colonnes attendues : {COLONNES_REGISTRE}")
        lignes = [_valider_source(ligne) for ligne in _lire_borne(lecteur)]

    if len(lignes) == 0:
        raise ValueError("Registre des sources vide")
    with connexion:
        connexion.executemany(SQL_SOURCE, lignes)
    return len(lignes)


def _lire_borne(lecteur: csv.DictReader[str]) -> list[dict[str, str]]:
    """Lit au plus MAX_LIGNES_REGISTRE lignes ; erreur au-delà (R2)."""
    lignes: list[dict[str, str]] = []
    for rang, ligne in enumerate(lecteur):
        if rang >= MAX_LIGNES_REGISTRE:
            raise ValueError(f"Registre trop long (> {MAX_LIGNES_REGISTRE} lignes)")
        lignes.append(ligne)
    return lignes


def _valider_source(ligne: dict[str, str]) -> tuple[str | int | None, ...]:
    """Contrôle une ligne du registre et la met dans l'ordre des colonnes."""
    identifiant = ligne["id_source"].strip()
    if identifiant == "":
        raise ValueError("id_source vide dans le registre")
    if ligne["acces"] not in ACCES_AUTORISES:
        raise ValueError(
            f"Source {identifiant} refusée : accès {ligne['acces']!r} non autorisé "
            f"(autorisés : {sorted(ACCES_AUTORISES)})"
        )
    if not ligne["url"].startswith("https://"):
        raise ValueError(f"Source {identifiant} : une URL https est attendue")
    exercice = int(ligne["exercice"]) if ligne["exercice"].strip() != "" else None
    if exercice is not None and not EXERCICE_MIN <= exercice <= EXERCICE_MAX:
        raise ValueError(f"Source {identifiant} : exercice {exercice} hors plage")
    return (
        identifiant,
        ligne["editeur"],
        ligne["titre"],
        exercice,
        ligne["url"],
        ligne["acces"],
        ligne["date_consultation"],
        ligne["notes"],
    )


def inserer_observations(connexion: sqlite3.Connection, observations: Sequence[Observation]) -> int:
    """Insère un lot d'observations, en une transaction (tout ou rien).

    Pré : lot non vide, au plus MAX_OBSERVATIONS_PAR_LOT ; chaque source est au registre.
    Post : retourne le nombre de lignes insérées (= taille du lot).
    Lève : ValueError (lot ou observation invalide), LookupError (source absente du registre),
           sqlite3.IntegrityError (doublon).
    """
    if not 0 < len(observations) <= MAX_OBSERVATIONS_PAR_LOT:
        raise ValueError(f"Taille de lot invalide : {len(observations)}")

    connues = {ligne[0] for ligne in connexion.execute("SELECT id_source FROM source")}
    for observation in observations:
        _valider_observation(observation)
        if observation.id_source not in connues:
            raise LookupError(f"Source absente du registre : {observation.id_source!r}")

    with connexion:
        curseur = connexion.executemany(SQL_OBSERVATION, [astuple(o) for o in observations])
    if curseur.rowcount != len(observations):
        raise ValueError(f"{curseur.rowcount} lignes insérées pour {len(observations)} attendues")
    return curseur.rowcount


def _valider_observation(observation: Observation) -> None:
    """Refuse une observation sans page, sans libellé, ou dont la valeur n'est pas finie."""
    if observation.page < 1:
        raise ValueError(f"Numéro de page invalide : {observation.page}")
    if not math.isfinite(observation.valeur):
        raise ValueError(f"Valeur non finie pour {observation.indicateur!r}")
    if not EXERCICE_MIN <= observation.exercice <= EXERCICE_MAX:
        raise ValueError(f"Exercice hors plage : {observation.exercice}")
    champs = (
        observation.id_source,
        observation.indicateur,
        observation.unite,
        observation.pays,
        observation.origine,
    )
    if any(champ.strip() == "" for champ in champs):
        raise ValueError("id_source, indicateur, unite, pays et origine sont obligatoires")
