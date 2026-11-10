"""Lecture d'un fichier de saisie (CSV) et conversion en observations."""

from __future__ import annotations

import csv
from pathlib import Path

from obscima.db import Observation
from obscima.normalisation import convertir_nombre_fr

COLONNES_SAISIE: tuple[str, ...] = (
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
)
MAX_LIGNES_SAISIE: int = 100_000


def lire_observations_csv(chemin_csv: Path) -> list[Observation]:
    """Lit un fichier de saisie et retourne ses observations.

    Pré : CSV UTF-8 avec exactement les colonnes COLONNES_SAISIE ; nombres écrits à la
          française (« 688,8 », « 1 233 ») ; au plus MAX_LIGNES_SAISIE lignes.
    Post : liste non vide, dans l'ordre du fichier.
    Lève : FileNotFoundError, ValueError (colonnes, fichier vide ou trop long, cellule invalide).
    """
    if not chemin_csv.is_file():
        raise FileNotFoundError(f"Fichier de saisie introuvable : {chemin_csv}")

    observations: list[Observation] = []
    with chemin_csv.open(encoding="utf-8", newline="") as fichier:
        lecteur = csv.DictReader(fichier)
        if tuple(lecteur.fieldnames or ()) != COLONNES_SAISIE:
            raise ValueError(f"Colonnes attendues : {COLONNES_SAISIE}")
        for rang, ligne in enumerate(lecteur, start=2):  # la ligne 1 est l'en-tête
            if rang - 1 > MAX_LIGNES_SAISIE:
                raise ValueError(f"Fichier trop long (> {MAX_LIGNES_SAISIE} lignes)")
            observations.append(_convertir_ligne(ligne, rang, chemin_csv.name))

    if len(observations) == 0:
        raise ValueError(f"Aucune observation dans {chemin_csv.name}")
    return observations


def _convertir_ligne(ligne: dict[str, str], rang: int, nom_fichier: str) -> Observation:
    """Convertit une ligne du CSV ; toute erreur cite le fichier et le numéro de ligne."""
    assert rang >= 2  # invariant interne : numérotation après l'en-tête
    try:
        valeur = convertir_nombre_fr(ligne["valeur"])
        page = int(ligne["page"])
        exercice = int(ligne["exercice"])
    except (TypeError, ValueError) as erreur:
        raise ValueError(f"{nom_fichier}, ligne {rang} : {erreur}") from erreur
    if valeur is None:
        raise ValueError(f"{nom_fichier}, ligne {rang} : valeur vide")

    return Observation(
        id_source=ligne["id_source"].strip(),
        page=page,
        tableau=ligne["tableau"].strip(),
        pays=ligne["pays"].strip(),
        exercice=exercice,
        entite=ligne["entite"].strip(),
        branche=ligne["branche"].strip(),
        indicateur=ligne["indicateur"].strip(),
        valeur=valeur,
        unite=ligne["unite"].strip(),
        origine=ligne["origine"].strip(),
    )
