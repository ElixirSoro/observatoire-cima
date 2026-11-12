/**
 * TOUS LES TEXTES ET RÉGLAGES DU SITE SONT ICI.
 * Pour changer un titre, une explication ou le choix des chiffres mis en avant,
 * modifiez ce fichier : aucun autre fichier n'est à toucher.
 * Les chiffres eux-mêmes viennent de public/data/observatoire.json (voir README).
 */

import type { Coordonnees } from './lib/contact.ts';
import type { Critere } from './lib/donnees.ts';

/* ------------------------------------------------------------------ */
/* L'ENTREPRISE                                                        */
/* ------------------------------------------------------------------ */

/** NOM PROVISOIRE : à remplacer ici, et nulle part ailleurs, quand le nom est arrêté. */
export const NOM_ENTREPRISE = 'Tisserin Data';

/**
 * Coordonnées affichées sur la page Contact. Laissez une chaîne vide pour ne pas afficher
 * un moyen de contact. Le numéro WhatsApp s'écrit au format international : '+225 …'.
 */
export const COORDONNEES: Coordonnees = {
  courriel: '',
  whatsapp: '',
};

export type IdPage = 'accueil' | 'offres' | 'atelier' | 'observatoire' | 'methode' | 'contact';

export interface Page {
  id: IdPage;
  /** Dossier de la page dans l'adresse ; vide pour l'accueil. Minuscules, chiffres, tirets. */
  segment: string;
  /** Nom court, dans le menu. */
  libelle: string;
  /** Titre de l'onglet du navigateur. */
  titre: string;
  /** Résumé repris par les moteurs de recherche. */
  description: string;
}

/** Les pages du site, dans l'ordre du menu. La première est l'accueil. */
export const PAGES: readonly Page[] = [
  {
    id: 'accueil',
    segment: '',
    libelle: 'Accueil',
    titre: `${NOM_ENTREPRISE} — vos fichiers Excel, transformés en tableaux de bord`,
    description:
      'Nettoyage de données, tableaux de bord et rapports automatisés pour les entreprises et les cabinets, à Abidjan.',
  },
  {
    id: 'offres',
    segment: 'offres',
    libelle: 'Offres',
    titre: `Offres — ${NOM_ENTREPRISE}`,
    description:
      'Trois prestations de données : audit et nettoyage, tableau de bord, rapport mensuel automatisé. Livrable, délai et prix indicatif.',
  },
  {
    id: 'atelier',
    segment: 'atelier',
    libelle: 'Atelier',
    titre: `Atelier de données — ${NOM_ENTREPRISE}`,
    description:
      "Déposez un fichier Excel ou CSV et obtenez son état de santé : doublons, cellules vides, colonnes incohérentes. Le fichier reste sur votre appareil.",
  },
  {
    id: 'observatoire',
    segment: 'observatoire',
    libelle: 'Observatoire',
    titre: `Observatoire du marché ivoirien de l'assurance — ${NOM_ENTREPRISE}`,
    description:
      "Les chiffres du marché ivoirien de l'assurance, chacun relié à sa source publique.",
  },
  {
    id: 'methode',
    segment: 'methode',
    libelle: 'Méthode',
    titre: `Méthode — ${NOM_ENTREPRISE}`,
    description:
      'Comment le travail est fait : des résultats que vous pouvez refaire, des calculs testés, des données qui restent les vôtres.',
  },
  {
    id: 'contact',
    segment: 'contact',
    libelle: 'Contact',
    titre: `Contact — ${NOM_ENTREPRISE}`,
    description: 'Écrire ou appeler pour parler de vos fichiers. Aucun formulaire, aucune donnée enregistrée.',
  },
];

export const ACCUEIL = {
  titre: 'Vos fichiers Excel, transformés en tableaux de bord.',
  texte:
    'Nettoyage de données, tableaux de bord et rapports automatisés pour les entreprises et les cabinets, à Abidjan.',
  boutonPrincipal: 'Voir les offres',
  boutonSecondaire: "Consulter l'observatoire",
  offres: {
    titre: 'Trois prestations, un résultat livré à chaque fois',
    lien: 'Voir le détail des offres',
  },
  observatoire: {
    titre: "Un observatoire public du marché de l'assurance",
    texte:
      "Les chiffres du marché ivoirien de l'assurance, relevés un par un. Chacun renvoie au document public où il a été lu : c'est la même exigence que pour vos données.",
    lien: "Ouvrir l'observatoire",
  },
  methode: {
    titre: 'Comment le travail est fait',
    lien: 'Lire la méthode',
  },
};

/** Bandeau de bas de page, sur l'accueil, les offres et la méthode. */
export const APPEL_CONTACT = {
  titre: 'Parlons de vos fichiers',
  texte: 'Dites quel rapport vous prend le plus de temps. La réponse dit si une prestation peut vous aider, et laquelle.',
  bouton: 'Prendre contact',
  boutonOffres: 'Voir les offres',
};

export interface Offre {
  id: string;
  titre: string;
  /** Une phrase : le problème réglé. */
  resume: string;
  /** À qui la prestation s'adresse. */
  pourQui: string;
  /** Ce que le client reçoit à la fin. */
  livrables: string[];
  delai: string;
  /** Fourchette de prix indicative, en FCFA. */
  prixMinFcfa: number;
  prixMaxFcfa: number;
}

/** LES OFFRES : textes, délais et prix à valider avant la mise en ligne. */
export const OFFRES: Offre[] = [
  {
    id: 'audit',
    titre: 'Audit et nettoyage de données',
    resume: 'Vos fichiers sont remis en ordre : doublons, valeurs manquantes et incohérences sont trouvés et corrigés.',
    pourQui: 'Pour une entreprise dont les fichiers clients, ventes ou stocks ne se recoupent plus.',
    livrables: [
      'Le fichier nettoyé, au même format que le vôtre.',
      'Un rapport de qualité : ce qui a été trouvé, ligne par ligne.',
      'La liste des corrections faites, pour pouvoir les refaire ou les annuler.',
    ],
    delai: '3 à 5 jours ouvrés',
    prixMinFcfa: 50_000,
    prixMaxFcfa: 150_000,
  },
  {
    id: 'tableau-de-bord',
    titre: 'Tableau de bord',
    resume: "Vos chiffres d'activité tiennent sur un écran, mis à jour à partir de vos propres fichiers.",
    pourQui: 'Pour un dirigeant ou un responsable qui veut suivre ses ventes, ses coûts ou son activité sans refaire les calculs.',
    livrables: [
      'Un tableau de bord alimenté par vos fichiers.',
      'Une notice : comment le mettre à jour, comment lire chaque indicateur.',
      'La définition écrite de chaque calcul.',
    ],
    delai: '1 à 2 semaines',
    prixMinFcfa: 100_000,
    prixMaxFcfa: 300_000,
  },
  {
    id: 'rapport-automatise',
    titre: 'Rapport mensuel automatisé',
    resume: 'Le rapport qui prend plusieurs jours chaque mois se produit en quelques minutes.',
    pourQui: 'Pour une équipe qui recopie chaque mois les mêmes chiffres dans le même rapport.',
    livrables: [
      'Le rapport, en PDF ou en Excel, produit à partir de vos exports.',
      'La procédure pour le relancer vous-même chaque mois.',
      'Un contrôle des chiffres du premier rapport contre votre rapport habituel.',
    ],
    delai: '2 à 3 semaines',
    prixMinFcfa: 100_000,
    prixMaxFcfa: 400_000,
  },
];

export const PAGE_OFFRES = {
  titre: 'Trois prestations, un résultat livré à chaque fois',
  texte: 'Chaque prestation se termine par un livrable précis, à un prix annoncé avant de commencer.',
  libelles: { livrables: 'Vous recevez', delai: 'Délai', prix: 'Prix indicatif' },
  notePrix: 'Prix indicatifs. Le prix ferme est fixé par un devis, après un premier échange sur vos fichiers.',
  deroulement: {
    titre: 'Comment se passe une mission',
    etapes: [
      { titre: 'Un premier échange', texte: 'Vous décrivez le fichier ou le rapport qui pose problème, et ce que vous voudriez à la place.' },
      { titre: 'Un essai sur un extrait', texte: 'Quelques lignes de vos données suffisent pour montrer le résultat attendu.' },
      { titre: 'Un devis', texte: 'Le livrable, le délai et le prix sont écrits avant de commencer.' },
      { titre: 'La livraison', texte: 'Vous recevez le livrable et sa notice, et vous le prenez en main avec une explication.' },
    ],
  },
};

export const ATELIER = {
  titre: 'Atelier de données',
  texte: 'Déposez un fichier Excel ou CSV : vous obtenez son état de santé, colonne par colonne.',
  boutonFichier: 'Choisir un fichier',
  boutonExemple: 'Essayer avec un exemple fictif',
  formats: 'Formats lus : .xlsx, .csv, .tsv, .txt.',
  confidentialite:
    "Votre fichier est lu par votre navigateur, sur votre appareil. Il n'est envoyé à aucun serveur.",
  lecture: 'Lecture du fichier.',
  erreur: "Ce fichier n'a pas pu être lu.",
  resultat: {
    titre: 'État du fichier',
    feuille: 'Feuille lue',
    autresFeuilles: 'Feuilles non lues',
  },
  tuiles: {
    lignes: 'Lignes de données',
    colonnes: 'Colonnes',
    remplissage: 'Cellules remplies',
    doublons: 'Lignes en double',
  },
  constats: {
    titre: 'Ce qui a été trouvé',
    aucun: 'Aucun défaut trouvé par ces contrôles.',
    niveaux: { attention: 'À corriger', information: 'À savoir' },
  },
  colonnes: {
    titre: 'Colonne par colonne',
    entetes: { nom: 'Colonne', genre: 'Contenu', remplissage: 'Remplie à', resume: 'Résumé' },
  },
  genres: { nombre: 'Nombres', date: 'Dates', texte: 'Texte', booleen: 'Vrai ou faux', vide: 'Vide' },
  apercu: {
    titre: 'Aperçu',
    texte: 'Les premières lignes, telles que lues dans le fichier.',
    ligne: 'Ligne',
    vide: 'vide',
  },
  limites: {
    titre: 'Ce que ces contrôles ne voient pas',
    elements: [
      'Une valeur fausse mais bien écrite : un montant erroné reste un nombre.',
      "Les doublons approchés : deux lignes qui diffèrent d'une lettre ne sont pas rapprochées.",
      "Les autres feuilles d'un classeur : seule la première est lue.",
      'Les nombres écrits à l\'anglaise : « 1,234 » est lu 1,234 et non 1 234.',
    ],
  },
};

export const PAGE_METHODE = {
  titre: 'Comment le travail est fait',
  texte: 'Quatre règles valent pour chaque prestation comme pour chaque chiffre publié sur ce site.',
  regles: [
    {
      titre: 'Des résultats que vous pouvez refaire',
      texte: 'Chaque livrable vient avec la définition de ses calculs et la marche à suivre pour les reproduire sans aide.',
    },
    {
      titre: 'Des calculs testés',
      texte: "Un calcul est d'abord vérifié sur des cas dont le résultat est connu, puis appliqué à vos données.",
    },
    {
      titre: 'Vos données restent les vôtres',
      texte: 'Vos fichiers ne servent qu\'à votre mission. Ils ne sont ni réutilisés, ni montrés à un tiers.',
    },
    {
      titre: 'Des sources publiques pour les chiffres de marché',
      texte: "Les chiffres de l'observatoire viennent de documents publiés par des organismes identifiés, et chacun renvoie à sa source.",
    },
  ],
  limites: {
    titre: 'Ce que ce site ne fait pas',
    elements: [
      "Il ne vend pas d'assurance et ne présente aucun contrat.",
      "Il n'enregistre rien sur ses visiteurs : ni compte, ni formulaire, ni traceur.",
      "Il ne reçoit pas les fichiers ouverts dans l'atelier : ils sont lus sur votre appareil.",
      "Il ne remplace pas l'avis d'un expert-comptable, d'un juriste ou d'un actuaire.",
    ],
  },
};

export const PAGE_CONTACT = {
  titre: 'Écrire ou appeler',
  texte: 'Un message suffit pour commencer.',
  moyens: { courriel: 'Par courriel', whatsapp: 'Par WhatsApp' },
  absent: 'Les coordonnées seront ajoutées ici avant la mise en ligne du site.',
  preparation: {
    titre: "Pour préparer l'échange",
    elements: [
      'Le fichier ou le rapport qui vous prend le plus de temps.',
      'Ce que vous aimeriez obtenir à la place.',
      'La fréquence à laquelle vous le produisez.',
    ],
  },
  confidentialite: "Ce site n'a pas de formulaire et n'enregistre aucune information sur ses visiteurs.",
};

export const PIED = {
  mention:
    "Ce site ne vend pas d'assurance et ne présente aucun contrat. Les chiffres de l'observatoire sont à confirmer sur les rapports officiels.",
  avecDate: "Chiffres de l'observatoire mis à jour le",
  sansDate: "Chiffres de l'observatoire en cours de chargement.",
};

/* ------------------------------------------------------------------ */
/* L'OBSERVATOIRE                                                      */
/* ------------------------------------------------------------------ */

/** Nom des fichiers proposés au téléchargement, sans extension. */
export const NOM_FICHIER_OBSERVATOIRE = 'observatoire-assurance';

export const SECTIONS = [
  { id: 'chiffres-cles', libelle: 'Chiffres clés' },
  { id: 'evolution', libelle: 'Évolution' },
  { id: 'structure', libelle: 'Structure' },
  { id: 'sources', libelle: 'Sources' },
  { id: 'methode', libelle: 'Règles' },
] as const;

export const SOMMAIRE = { titre: 'Dans cette page' };

export const ETATS_CHARGEMENT = {
  chargement: 'Chargement des chiffres.',
  erreur: "Les chiffres n'ont pas pu être chargés.",
};

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
