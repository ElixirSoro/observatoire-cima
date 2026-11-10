/**
 * TOUS LES TEXTES ET RÉGLAGES DU SITE SONT ICI.
 * Pour changer un titre, une explication ou le choix des chiffres mis en avant,
 * modifiez ce fichier : aucun autre fichier n'est à toucher.
 * Les chiffres eux-mêmes viennent de public/data/observatoire.json (voir README).
 */

import type { Critere } from './lib/donnees';

export const NOM_DU_SITE = 'Observatoire CIMA';

export const SECTIONS = [
  { id: 'chiffres-cles', libelle: 'Chiffres clés' },
  { id: 'evolution', libelle: 'Évolution' },
  { id: 'structure', libelle: 'Structure' },
  { id: 'sources', libelle: 'Sources' },
  { id: 'methode', libelle: 'Méthode' },
] as const;

export const HERO = {
  titre: "Le marché ivoirien de l'assurance, chiffre par chiffre.",
  texte:
    'Chaque chiffre de cette page renvoie au document public où il a été lu. Vous pouvez tout vérifier vous-même.',
  boutonPrincipal: { libelle: 'Voir les chiffres clés', cible: '#chiffres-cles' },
  boutonSecondaire: { libelle: 'Vérifier les sources', cible: '#sources' },
};

export interface ChiffreCle {
  titre: string;
  explication: string;
  critere: Critere;
}

/** Le premier chiffre de la liste est affiché en grand. */
export const CHIFFRES_CLES: ChiffreCle[] = [
  {
    titre: 'Primes émises en 2025',
    explication: 'Ce que les assurés ont payé aux assureurs sur un an, vie et non-vie réunies.',
    critere: { indicateur: 'primes_emises', exercice: 2025 },
  },
  {
    titre: 'Taux de pénétration en 2025',
    explication: 'Le poids des primes dans la richesse produite par le pays (PIB).',
    critere: { indicateur: 'taux_penetration', exercice: 2025 },
  },
  {
    titre: 'Prime par habitant en 2025',
    explication: "Ce que chaque habitant consacre en moyenne à l'assurance sur un an.",
    critere: { indicateur: 'densite_assurance', exercice: 2025 },
  },
  {
    titre: 'Primes du premier semestre 2026',
    explication: 'Les six premiers mois de 2026, dernier point connu.',
    critere: { indicateur: 'primes_emises_semestre_1', exercice: 2026 },
  },
];

export const EVOLUTION = {
  titre: 'Les primes émises, année par année',
  texte:
    "En milliards de FCFA. Deux organismes publient un total pour 2023 et ils ne donnent pas le même : les deux sont affichés, sans choisir à leur place.",
  indicateur: 'primes_emises',
  unite: 'milliards FCFA',
  /** Haut de l'échelle et graduations : à relever quand le marché dépasse 800 milliards. */
  echelleMax: 800,
  graduations: [0, 200, 400, 600, 800],
};

export const STRUCTURE = {
  titre: 'Qui compose le marché',
  texte: 'Situation à la fin de 2024.',
  exercice: 2024,
  partage: {
    titre: 'Répartition des primes en 2024',
    indicateur: 'primes_emises_branche',
    brancheVie: 'Vie',
    brancheTotal: 'Toutes',
    note: 'La part non-vie est calculée ici : total du marché moins les primes vie.',
  },
  acteurs: [
    { libelle: "Compagnies d'assurance non-vie", indicateur: 'nombre_compagnies', branche: 'Non-vie' },
    { libelle: "Compagnies d'assurance vie", indicateur: 'nombre_compagnies', branche: 'Vie' },
    { libelle: 'Compagnies de réassurance', indicateur: 'nombre_compagnies', branche: 'Réassurance' },
    { libelle: 'Sociétés de courtage', indicateur: 'nombre_societes_courtage', branche: 'Courtage' },
    { libelle: 'Gestionnaires de fonds santé', indicateur: 'nombre_gestionnaires_fonds_sante', branche: 'Santé' },
  ],
};

export const SOURCES = {
  titre: 'Tous les chiffres, avec leur source',
  texte: "Cherchez un chiffre, puis ouvrez le document où il a été lu.",
  recherche: 'Chercher un indicateur, une année, un organisme',
  aucunResultat: 'Aucun chiffre ne correspond à cette recherche. Essayez un mot plus court.',
};

export const METHODE = {
  titre: 'Comment ces chiffres sont établis',
  regles: [
    {
      titre: 'Des sources publiques uniquement',
      texte:
        'Chaque chiffre vient d\'un document publié en ligne par un organisme identifié. Aucune donnée privée ou interne à une entreprise n\'est utilisée.',
    },
    {
      titre: 'Recopié, pas estimé',
      texte:
        'Les chiffres sont repris tels qu\'ils sont publiés. Les seuls calculs faits ici sont des parts et des différences, et ils sont signalés.',
    },
    {
      titre: 'À confirmer tant que le rapport officiel n\'a pas été relu',
      texte:
        'Un chiffre lu dans un article ou une fiche de synthèse porte la mention « à confirmer ». Il passe à « vérifié » une fois relu dans le rapport de l\'organisme qui l\'a produit.',
    },
  ],
  manques: {
    titre: 'Ce qui manque encore',
    elements: [
      'Les comptes compagnie par compagnie.',
      'Les années 2019 à 2022.',
      'Les treize autres pays de la zone CIMA.',
    ],
  },
};

export const APPEL = {
  titre: 'Réutilisez ces chiffres',
  texte: 'Le fichier contient chaque chiffre, son unité, son organisme d\'origine et sa source.',
  boutonCsv: 'Télécharger en CSV',
  boutonJson: 'Télécharger en JSON',
};

export const PIED = {
  mention:
    "Version 0. Ce site ne vend pas d'assurance et ne donne pas de conseil. Les chiffres sont à confirmer sur les rapports officiels.",
};

export const ETATS = {
  extrait: 'À confirmer',
  verifie: 'Vérifié',
} as const;

/** Nom lisible de chaque indicateur de la base. Un indicateur absent d'ici s'affiche tel quel. */
export const LIBELLES_INDICATEUR: Record<string, string> = {
  primes_emises: 'Primes émises',
  primes_emises_semestre_1: 'Primes émises, premier semestre',
  primes_emises_usd: 'Primes émises, en dollars',
  primes_emises_branche: 'Primes émises par branche',
  taux_penetration: 'Taux de pénétration',
  densite_assurance: 'Prime par habitant',
  taux_sinistralite: 'Taux de sinistralité',
  nombre_compagnies: 'Nombre de compagnies',
  nombre_societes_courtage: 'Nombre de sociétés de courtage',
  nombre_gestionnaires_fonds_sante: 'Nombre de gestionnaires de fonds santé',
};

export function libelleIndicateur(indicateur: string): string {
  return LIBELLES_INDICATEUR[indicateur] ?? indicateur;
}
