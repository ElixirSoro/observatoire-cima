"""Conversion des nombres écrits à la française dans les rapports (PDF) en flottants."""

from __future__ import annotations

import math
import re

MARQUEURS_VIDE: frozenset[str] = frozenset({"", "-", "\u2013", "\u2014", "nd", "n.d.", "na", "n/a"})
ESPACES: str = " \u00a0\u202f\u2009"
MOTIF_NOMBRE: re.Pattern[str] = re.compile(r"^-?\d+(\.\d+)?$")


def convertir_nombre_fr(texte: str) -> float | None:
    """Convertit « 1 234,5 », « (12,3) » ou « 7,85% » en flottant.

    Pré : texte est une chaîne (cellule de tableau).
    Post : None si la cellule est vide ou un tiret ; sinon un flottant fini.
           Le signe % est retiré sans division : « 7,85% » donne 7.85.
           Les parenthèses comptables donnent un nombre négatif.
    Lève : TypeError (pas une chaîne), ValueError (texte non numérique).
    """
    if not isinstance(texte, str):
        raise TypeError(f"Une chaîne est attendue (reçu {type(texte).__name__})")

    brut = texte.strip()
    if brut.lower() in MARQUEURS_VIDE:
        return None

    negatif = brut.startswith("(") and brut.endswith(")")
    if negatif:
        brut = brut[1:-1]
    brut = brut.rstrip("%").strip()
    for espace in ESPACES:
        brut = brut.replace(espace, "")
    brut = brut.replace(",", ".")

    if MOTIF_NOMBRE.fullmatch(brut) is None:
        raise ValueError(f"Cellule non numérique : {texte!r}")

    valeur = float(brut)
    if negatif:
        valeur = -valeur
    assert math.isfinite(valeur)  # invariant : le motif n'accepte que des chiffres
    return valeur
