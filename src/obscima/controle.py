"""Contrôles de cohérence appliqués aux chiffres extraits avant insertion en base."""

from __future__ import annotations

import math
from collections.abc import Sequence

TOLERANCE_RELATIVE_DEFAUT: float = 0.005


def ecart_relatif_au_total(valeurs: Sequence[float], total_attendu: float) -> float:
    """Calcule l'écart relatif entre la somme des lignes et le total imprimé.

    Pré : valeurs non vide, toutes finies ; total_attendu fini et non nul.
    Post : écart relatif >= 0 (0.01 = 1 %).
    Lève : ValueError si une précondition n'est pas respectée.
    """
    if len(valeurs) == 0:
        raise ValueError("Aucune valeur à sommer")
    if not all(math.isfinite(v) for v in valeurs):
        raise ValueError("Toutes les valeurs doivent être finies")
    if not math.isfinite(total_attendu) or math.isclose(total_attendu, 0.0, abs_tol=1e-12):
        raise ValueError(f"Le total attendu doit être fini et non nul (reçu {total_attendu})")

    ecart = abs(math.fsum(valeurs) - total_attendu) / abs(total_attendu)
    assert ecart >= 0.0  # invariant : valeur absolue
    return ecart


def exiger_total_coherent(
    valeurs: Sequence[float],
    total_attendu: float,
    tolerance_relative: float = TOLERANCE_RELATIVE_DEFAUT,
) -> None:
    """Refuse un tableau dont la somme des lignes s'écarte du total imprimé.

    Pré : tolerance_relative dans ]0, 1[.
    Post : ne retourne rien si l'écart est dans la tolérance.
    Lève : ValueError (tolérance invalide, ou écart supérieur à la tolérance).
    """
    if not 0.0 < tolerance_relative < 1.0:
        raise ValueError(f"Tolérance attendue dans ]0, 1[ (reçu {tolerance_relative})")

    ecart = ecart_relatif_au_total(valeurs, total_attendu)
    if ecart > tolerance_relative:
        raise ValueError(
            f"Somme des lignes incohérente avec le total : écart {ecart:.4%} "
            f"> tolérance {tolerance_relative:.4%} (total attendu {total_attendu})"
        )
