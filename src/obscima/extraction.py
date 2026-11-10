"""Extraction des tableaux d'un rapport PDF, page par page, avec le numéro de page."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pdfplumber

MAX_PAGES_PAR_APPEL: int = 400


@dataclass(frozen=True)
class TableauBrut:
    """Tableau tel qu'il est lu dans le PDF : aucune interprétation des cellules."""

    page: int
    rang_dans_la_page: int
    lignes: tuple[tuple[str, ...], ...]


def extraire_tableaux_pdf(
    chemin_pdf: Path, premiere_page: int, derniere_page: int
) -> list[TableauBrut]:
    """Extrait les tableaux des pages [premiere_page, derniere_page] (numérotées dès 1).

    Pré : chemin_pdf existe et se termine par .pdf ; 1 <= premiere_page <= derniere_page ;
          au plus MAX_PAGES_PAR_APPEL pages ; derniere_page <= nombre de pages du PDF.
    Post : liste (éventuellement vide) de tableaux non vides ; cellules vides rendues par "".
    Lève : FileNotFoundError, ValueError.
    """
    if not chemin_pdf.is_file():
        raise FileNotFoundError(f"PDF introuvable : {chemin_pdf}")
    if chemin_pdf.suffix.lower() != ".pdf":
        raise ValueError(f"Un fichier .pdf est attendu (reçu {chemin_pdf.name})")
    if premiere_page < 1 or derniere_page < premiere_page:
        raise ValueError(f"Plage de pages invalide : {premiere_page} à {derniere_page}")
    if derniere_page - premiere_page + 1 > MAX_PAGES_PAR_APPEL:
        raise ValueError(f"Au plus {MAX_PAGES_PAR_APPEL} pages par appel")

    tableaux: list[TableauBrut] = []
    with pdfplumber.open(chemin_pdf) as pdf:
        nombre_pages = len(pdf.pages)
        if derniere_page > nombre_pages:
            raise ValueError(f"Le PDF a {nombre_pages} pages (demandé : {derniere_page})")
        for numero in range(premiere_page, derniere_page + 1):  # R2 : borne fixe
            bruts = pdf.pages[numero - 1].extract_tables()
            tableaux.extend(_convertir_page(numero, bruts))
    return tableaux


def _convertir_page(numero_page: int, bruts: list[list[list[str | None]]]) -> list[TableauBrut]:
    """Transforme les tableaux bruts d'une page en TableauBrut, en écartant les vides."""
    assert numero_page >= 1  # invariant interne : validé par l'appelant
    resultat: list[TableauBrut] = []
    for rang, brut in enumerate(bruts, start=1):
        lignes = tuple(tuple((cellule or "").strip() for cellule in ligne) for ligne in brut)
        if any(any(cellule != "" for cellule in ligne) for ligne in lignes):
            resultat.append(TableauBrut(page=numero_page, rang_dans_la_page=rang, lignes=lignes))
    return resultat
