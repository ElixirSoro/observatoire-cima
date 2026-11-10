-- Observatoire CIMA : schéma de la base (SQLite).
-- Règle de conception : aucune observation sans source enregistrée ni numéro de page.
-- Aucune table ne contient de donnée sur une personne physique.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS source (
    id_source          TEXT PRIMARY KEY,
    editeur            TEXT NOT NULL,
    titre              TEXT NOT NULL,
    exercice           INTEGER,
    url                TEXT NOT NULL,
    acces              TEXT NOT NULL
                       CHECK (acces IN ('public_en_ligne', 'communique_par_l_organisme')),
    date_consultation  TEXT NOT NULL,
    notes              TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS observation (
    id_observation  INTEGER PRIMARY KEY,
    id_source       TEXT NOT NULL REFERENCES source (id_source),
    page            INTEGER NOT NULL CHECK (page >= 1),
    tableau         TEXT NOT NULL,
    pays            TEXT NOT NULL,
    exercice        INTEGER NOT NULL,
    entite          TEXT NOT NULL,
    branche         TEXT NOT NULL,
    indicateur      TEXT NOT NULL,
    valeur          REAL NOT NULL,
    unite           TEXT NOT NULL,
    origine         TEXT NOT NULL,
    statut          TEXT NOT NULL DEFAULT 'extrait'
                    CHECK (statut IN ('extrait', 'verifie')),
    UNIQUE (id_source, page, tableau, pays, exercice, entite, branche, indicateur)
);
