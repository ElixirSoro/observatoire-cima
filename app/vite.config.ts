import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import { pagesStatiques } from './outils/pagesStatiques.ts';
import { PAGES_PUBLIEES } from './src/contenu.ts';

// Les fichiers lus par cette configuration sont importés avec leur extension « .ts » :
// le chargeur de configuration de Vite le demande.
// base './' : le site fonctionne à la racine d'un domaine comme dans un sous-dossier.
export default defineConfig({
  base: './',
  plugins: [react(), pagesStatiques(PAGES_PUBLIEES)],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'outils/**/*.test.ts'] },
});
