"""Tests de la chaîne saisie CSV -> base -> JSON de l'application."""

import json
import math
import shutil
from contextlib import closing
from pathlib import Path

import pytest

from obscima.construire import Chemins, chemins_par_defaut, reconstruire
from obscima.db import charger_registre, ouvrir_base
from obscima.export_json import exporter_json
from obscima.import_csv import COLONNES_SAISIE, lire_observations_csv

RACINE = Path(__file__).resolve().parents[1]
SAISIE_PROJET = RACINE / "data" / "saisie" / "chiffres_cles_ci.csv"
ENTETE = ",".join(COLONNES_SAISIE) + "\n"
LIGNE_VALIDE = 'DA-CI-2023,3,Tableau fictif,CI,2023,Marché,Toutes,valeur_de_test,"12,5",%,Test\n'


def ecrire_saisie(dossier: Path, contenu: str) -> Path:
    chemin = dossier / "saisie.csv"
    chemin.write_text(contenu, encoding="utf-8")
    return chemin


@pytest.fixture
def chemins(tmp_path: Path) -> Chemins:
    for dossier in ("saisie", "base", "sortie"):
        (tmp_path / dossier).mkdir()
    shutil.copy(SAISIE_PROJET, tmp_path / "saisie" / SAISIE_PROJET.name)
    return Chemins(
        schema=RACINE / "schema.sql",
        registre=RACINE / "sources" / "registre_sources.csv",
        dossier_saisie=tmp_path / "saisie",
        base=tmp_path / "base" / "base.sqlite",
        json_application=tmp_path / "sortie" / "observatoire.json",
    )


def test_saisie_du_projet_lisible() -> None:
    observations = lire_observations_csv(SAISIE_PROJET)
    assert len(observations) == 20
    primes_2025 = next(
        o for o in observations if o.indicateur == "primes_emises" and o.exercice == 2025
    )
    assert math.isclose(primes_2025.valeur, 688.8)
    assert primes_2025.origine == "ASA-CI"


def test_saisie_nominale(tmp_path: Path) -> None:
    observations = lire_observations_csv(ecrire_saisie(tmp_path, ENTETE + LIGNE_VALIDE))
    assert len(observations) == 1
    assert observations[0].page == 3
    assert math.isclose(observations[0].valeur, 12.5)


def test_saisie_vide_refusee(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="Aucune observation"):
        lire_observations_csv(ecrire_saisie(tmp_path, ENTETE))


def test_saisie_colonnes_invalides_refusees(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="Colonnes attendues"):
        lire_observations_csv(ecrire_saisie(tmp_path, "a,b\n1,2\n"))


@pytest.mark.parametrize(
    "ligne",
    [
        LIGNE_VALIDE.replace('"12,5"', "douze"),
        LIGNE_VALIDE.replace('"12,5"', "-"),
        LIGNE_VALIDE.replace(",3,", ",trois,"),
    ],
)
def test_saisie_cellule_invalide_cite_la_ligne(tmp_path: Path, ligne: str) -> None:
    with pytest.raises(ValueError, match="ligne 2"):
        lire_observations_csv(ecrire_saisie(tmp_path, ENTETE + ligne))


def test_saisie_absente_refusee(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        lire_observations_csv(tmp_path / "absent.csv")


def test_reconstruction_complete(chemins: Chemins) -> None:
    assert reconstruire(chemins, "2026-11-10") == 20
    contenu = json.loads(chemins.json_application.read_text(encoding="utf-8"))
    assert contenu["mis_a_jour_le"] == "2026-11-10"
    assert len(contenu["observations"]) == 20
    utilisees = {o["id_source"] for o in contenu["observations"]}
    assert {s["id_source"] for s in contenu["sources"]} == utilisees
    assert all(s["url"].startswith("https://") for s in contenu["sources"])


def test_reconstruction_rejouable(chemins: Chemins) -> None:
    reconstruire(chemins, "2026-11-10")
    assert reconstruire(chemins, "2026-11-11") == 20


def test_reconstruction_sans_saisie_refusee(chemins: Chemins) -> None:
    (chemins.dossier_saisie / SAISIE_PROJET.name).rename(chemins.dossier_saisie / "saisie.txt")
    with pytest.raises(ValueError, match="fichier"):
        reconstruire(chemins, "2026-11-10")


def test_export_date_invalide_refusee(chemins: Chemins) -> None:
    with closing(ouvrir_base(chemins.base, chemins.schema)) as connexion:
        charger_registre(connexion, chemins.registre)
        with pytest.raises(ValueError, match="AAAA-MM-JJ"):
            exporter_json(connexion, chemins.json_application, "10/11/2026")


def test_export_base_vide_refuse(chemins: Chemins) -> None:
    with closing(ouvrir_base(chemins.base, chemins.schema)) as connexion:
        charger_registre(connexion, chemins.registre)
        with pytest.raises(ValueError, match="aucune observation"):
            exporter_json(connexion, chemins.json_application, "2026-11-10")


def test_export_dossier_absent_refuse(chemins: Chemins, tmp_path: Path) -> None:
    with (
        closing(ouvrir_base(chemins.base, chemins.schema)) as connexion,
        pytest.raises(FileNotFoundError),
    ):
        exporter_json(connexion, tmp_path / "absent" / "x.json", "2026-11-10")


def test_chemins_par_defaut(tmp_path: Path) -> None:
    assert chemins_par_defaut(RACINE).schema == RACINE / "schema.sql"
    with pytest.raises(FileNotFoundError):
        chemins_par_defaut(tmp_path)
