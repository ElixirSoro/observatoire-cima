"""Tests des contrôles de cohérence (somme des lignes contre total imprimé)."""

import math

import pytest

from obscima.controle import ecart_relatif_au_total, exiger_total_coherent


def test_ecart_nul_quand_la_somme_colle() -> None:
    assert math.isclose(ecart_relatif_au_total([10.0, 20.0, 70.0], 100.0), 0.0, abs_tol=1e-12)


def test_ecart_mesure() -> None:
    assert math.isclose(ecart_relatif_au_total([10.0, 20.0], 40.0), 0.25)


def test_arrondis_toleres() -> None:
    exiger_total_coherent([33.3, 33.3, 33.3], 100.0)


def test_total_incoherent_refuse() -> None:
    with pytest.raises(ValueError, match="incohérente"):
        exiger_total_coherent([10.0, 20.0], 100.0)


@pytest.mark.parametrize("total", [0.0, math.nan, math.inf])
def test_total_invalide_refuse(total: float) -> None:
    with pytest.raises(ValueError, match="total attendu"):
        ecart_relatif_au_total([1.0], total)


def test_liste_vide_refusee() -> None:
    with pytest.raises(ValueError, match="Aucune valeur"):
        ecart_relatif_au_total([], 10.0)


def test_valeur_non_finie_refusee() -> None:
    with pytest.raises(ValueError, match="finies"):
        ecart_relatif_au_total([1.0, math.nan], 10.0)


@pytest.mark.parametrize("tolerance", [0.0, 1.0, -0.1])
def test_tolerance_invalide_refusee(tolerance: float) -> None:
    with pytest.raises(ValueError, match="Tolérance"):
        exiger_total_coherent([1.0], 1.0, tolerance)
