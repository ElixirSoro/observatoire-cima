"""Tests de la base : registre des sources et insertion des observations."""

import math
import sqlite3
from collections.abc import Iterator
from contextlib import closing
from dataclasses import replace
from pathlib import Path

import pytest

from obscima.db import Observation, charger_registre, inserer_observations, ouvrir_base

RACINE = Path(__file__).resolve().parents[1]
SCHEMA = RACINE / "schema.sql"
REGISTRE = RACINE / "sources" / "registre_sources.csv"
ENTETE = "id_source,editeur,titre,exercice,url,acces,date_consultation,notes\n"
# Valeur de test, sans rapport avec un chiffre réel.
OBSERVATION_FICTIVE = Observation(
    id_source="DA-CI-2023",
    page=12,
    tableau="Tableau fictif",
    pays="CI",
    exercice=2023,
    entite="Marché",
    branche="Toutes",
    indicateur="valeur_de_test",
    valeur=123.4,
    unite="milliards FCFA",
    origine="Organisme fictif",
)


@pytest.fixture
def connexion(tmp_path: Path) -> Iterator[sqlite3.Connection]:
    with closing(ouvrir_base(tmp_path / "base.sqlite", SCHEMA)) as base:
        yield base


def ecrire_registre(dossier: Path, ligne: str) -> Path:
    chemin = dossier / "registre.csv"
    chemin.write_text(ENTETE + ligne, encoding="utf-8")
    return chemin


def test_registre_du_projet_se_charge(connexion: sqlite3.Connection) -> None:
    nombre = charger_registre(connexion, REGISTRE)
    assert nombre == 11
    acces = {ligne[0] for ligne in connexion.execute("SELECT DISTINCT acces FROM source")}
    assert acces == {"public_en_ligne"}


def test_source_interne_refusee(connexion: sqlite3.Connection, tmp_path: Path) -> None:
    ligne = (
        "X-1,Employeur,Fichier interne,2025,https://exemple.org/x,interne_employeur,2026-11-10,\n"
    )
    with pytest.raises(ValueError, match="non autorisé"):
        charger_registre(connexion, ecrire_registre(tmp_path, ligne))


def test_url_non_https_refusee(connexion: sqlite3.Connection, tmp_path: Path) -> None:
    ligne = "X-2,Editeur,Titre,2025,C:/dossier/fichier.xlsx,public_en_ligne,2026-11-10,\n"
    with pytest.raises(ValueError, match="https"):
        charger_registre(connexion, ecrire_registre(tmp_path, ligne))


def test_registre_vide_refuse(connexion: sqlite3.Connection, tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="vide"):
        charger_registre(connexion, ecrire_registre(tmp_path, ""))


def test_colonnes_inattendues_refusees(connexion: sqlite3.Connection, tmp_path: Path) -> None:
    chemin = tmp_path / "registre.csv"
    chemin.write_text("id_source,url\nA,https://exemple.org\n", encoding="utf-8")
    with pytest.raises(ValueError, match="Colonnes attendues"):
        charger_registre(connexion, chemin)


def test_insertion_nominale(connexion: sqlite3.Connection) -> None:
    charger_registre(connexion, REGISTRE)
    assert inserer_observations(connexion, [OBSERVATION_FICTIVE]) == 1
    ligne = connexion.execute("SELECT id_source, page, valeur, statut FROM observation").fetchone()
    assert ligne[:2] == ("DA-CI-2023", 12)
    assert math.isclose(ligne[2], 123.4)
    assert ligne[3] == "extrait"


def test_source_absente_du_registre_refusee(connexion: sqlite3.Connection) -> None:
    charger_registre(connexion, REGISTRE)
    inconnue = replace(OBSERVATION_FICTIVE, id_source="FICHIER-INCONNU")
    with pytest.raises(LookupError, match="absente du registre"):
        inserer_observations(connexion, [inconnue])


@pytest.mark.parametrize(
    "invalide",
    [
        replace(OBSERVATION_FICTIVE, page=0),
        replace(OBSERVATION_FICTIVE, valeur=math.nan),
        replace(OBSERVATION_FICTIVE, exercice=1800),
        replace(OBSERVATION_FICTIVE, unite=" "),
        replace(OBSERVATION_FICTIVE, origine=""),
    ],
)
def test_observation_invalide_refusee(connexion: sqlite3.Connection, invalide: Observation) -> None:
    charger_registre(connexion, REGISTRE)
    with pytest.raises(ValueError):
        inserer_observations(connexion, [invalide])


def test_lot_vide_refuse(connexion: sqlite3.Connection) -> None:
    with pytest.raises(ValueError, match="lot"):
        inserer_observations(connexion, [])


def test_doublon_refuse_et_lot_annule(connexion: sqlite3.Connection) -> None:
    charger_registre(connexion, REGISTRE)
    autre = replace(OBSERVATION_FICTIVE, indicateur="autre_valeur_de_test")
    with pytest.raises(sqlite3.IntegrityError):
        inserer_observations(connexion, [autre, OBSERVATION_FICTIVE, OBSERVATION_FICTIVE])
    assert connexion.execute("SELECT COUNT(*) FROM observation").fetchone()[0] == 0


def test_schema_absent_refuse(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        ouvrir_base(tmp_path / "base.sqlite", tmp_path / "absent.sql")
