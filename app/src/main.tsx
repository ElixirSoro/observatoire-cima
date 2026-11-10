import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/schibsted-grotesk';
import './styles/tokens.css';
import './styles/app.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const racine = document.getElementById('racine');
if (racine === null) {
  throw new Error("Élément #racine introuvable dans index.html");
}
createRoot(racine).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
