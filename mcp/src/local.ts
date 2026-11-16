/** Point d'entrée local : Claude Desktop lance ce programme et lui parle par l'entrée et la sortie standard. */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { creerChargeur } from './donnees';
import { creerServeur } from './serveur';

const serveur = creerServeur({ charger: creerChargeur(), fichiersLocaux: true });
serveur.connect(new StdioServerTransport()).catch((erreur: unknown) => {
  // La sortie standard sert au protocole : les erreurs vont sur la sortie d'erreur.
  console.error('Le serveur MCP n’a pas pu démarrer :', erreur);
  process.exit(1);
});
