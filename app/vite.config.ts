import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// base './' : le site fonctionne à la racine d'un domaine comme dans un sous-dossier.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
