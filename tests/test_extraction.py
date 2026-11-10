"""Tests de l'extraction, sur un PDF fabriqué pour le test (données fictives)."""

from pathlib import Path

import pytest
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Table, TableStyle

from obscima.extraction import extraire_tableaux_pdf

LIGNES_FICTIVES = [
    ["Branche", "2022", "2023"],
    ["Branche A", "1 000,5", "1 200,0"],
    ["Branche B", "500,0", "(20,5)"],
    ["Total", "1 500,5", "1 179,5"],
]


@pytest.fixture
def pdf_fictif(tmp_path: Path) -> Path:
    chemin = tmp_path / "rapport_fictif.pdf"
    tableau = Table(LIGNES_FICTIVES)
    tableau.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.5, colors.black)]))
    texte = Paragraph("Page sans tableau.", getSampleStyleSheet()["Normal"])
    SimpleDocTemplate(str(chemin), pagesize=A4).build([texte, PageBreak(), tableau])
    return chemin


def test_tableau_extrait_avec_sa_page(pdf_fictif: Path) -> None:
    tableaux = extraire_tableaux_pdf(pdf_fictif, 1, 2)
    assert len(tableaux) == 1
    assert tableaux[0].page == 2
    assert [list(ligne) for ligne in tableaux[0].lignes] == LIGNES_FICTIVES


def test_page_sans_tableau_donne_liste_vide(pdf_fictif: Path) -> None:
    assert extraire_tableaux_pdf(pdf_fictif, 1, 1) == []


def test_fichier_absent_refuse(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        extraire_tableaux_pdf(tmp_path / "absent.pdf", 1, 1)


def test_extension_invalide_refusee(tmp_path: Path) -> None:
    chemin = tmp_path / "rapport.txt"
    chemin.write_text("pas un pdf", encoding="utf-8")
    with pytest.raises(ValueError, match=r"\.pdf"):
        extraire_tableaux_pdf(chemin, 1, 1)


@pytest.mark.parametrize(("premiere", "derniere"), [(0, 1), (2, 1), (1, 3), (1, 500)])
def test_plage_de_pages_invalide_refusee(pdf_fictif: Path, premiere: int, derniere: int) -> None:
    with pytest.raises(ValueError):
        extraire_tableaux_pdf(pdf_fictif, premiere, derniere)
