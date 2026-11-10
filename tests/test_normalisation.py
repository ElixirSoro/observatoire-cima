"""Tests de la conversion des nombres écrits à la française."""

import math

import pytest

from obscima.normalisation import convertir_nombre_fr


@pytest.mark.parametrize(
    ("texte", "attendu"),
    [
        ("1 234,5", 1234.5),
        ("601,94", 601.94),
        ("7,85%", 7.85),
        ("(12,3)", -12.3),
        ("-4", -4.0),
        ("1\u00a0439\u202f220", 1439220.0),
    ],
)
def test_nominal(texte: str, attendu: float) -> None:
    resultat = convertir_nombre_fr(texte)
    assert resultat is not None
    assert math.isclose(resultat, attendu)


@pytest.mark.parametrize("texte", ["", "  ", "-", "\u2014", "nd", "N/A"])
def test_cellule_vide_donne_none(texte: str) -> None:
    assert convertir_nombre_fr(texte) is None


@pytest.mark.parametrize("texte", ["Automobile", "12,3,4", "1.234,5", "12 milliards"])
def test_texte_non_numerique_refuse(texte: str) -> None:
    with pytest.raises(ValueError, match="non numérique"):
        convertir_nombre_fr(texte)


def test_type_invalide_refuse() -> None:
    with pytest.raises(TypeError):
        convertir_nombre_fr(12.5)  # type: ignore[arg-type]
