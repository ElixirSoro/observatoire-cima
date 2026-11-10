import { useEffect, useRef } from 'react';

const COUCHES = [
  { couleur: '#1c5c66', hauteur: 0.46, amplitude: 34, longueur: 520, vitesse: 0.00011 },
  { couleur: '#15474f', hauteur: 0.6, amplitude: 27, longueur: 380, vitesse: 0.00017 },
  { couleur: '#0e3239', hauteur: 0.74, amplitude: 21, longueur: 290, vitesse: 0.00024 },
  { couleur: '#061a1e', hauteur: 0.88, amplitude: 15, longueur: 210, vitesse: 0.00032 },
] as const;
const PAS_PIXELS = 8;
const EFFET_DEFILEMENT = 0.004;
const DENSITE_MAX = 2;

function dessiner(toile: HTMLCanvasElement, temps: number, defilement: number): void {
  const contexte = toile.getContext('2d');
  if (contexte === null) {
    return;
  }
  const { width: largeur, height: hauteur } = toile;
  contexte.clearRect(0, 0, largeur, hauteur);
  for (const couche of COUCHES) {
    const phase = temps * couche.vitesse * 1000 + defilement * EFFET_DEFILEMENT;
    const base = hauteur * couche.hauteur;
    contexte.beginPath();
    contexte.moveTo(0, hauteur);
    for (let x = 0; x <= largeur + PAS_PIXELS; x += PAS_PIXELS) {
      const y =
        base +
        Math.sin(x / couche.longueur + phase) * couche.amplitude +
        Math.sin(x / (couche.longueur * 0.41) - phase * 1.7) * couche.amplitude * 0.35;
      contexte.lineTo(x, y);
    }
    contexte.lineTo(largeur, hauteur);
    contexte.closePath();
    contexte.fillStyle = couche.couleur;
    contexte.fill();
  }
}

/**
 * Fond animé du haut de page : une lagune de nuit, du plus clair (au loin) au plus sombre
 * (devant, de la couleur de la page). Les vagues avancent avec le temps
 * et avec le défilement. L'animation s'arrête hors écran et pour les personnes
 * qui ont demandé moins de mouvement.
 */
export function Maree() {
  const reference = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const toile = reference.current;
    if (toile === null) {
      return;
    }
    const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let image = 0;
    let visible = true;

    const ajuster = () => {
      const densite = Math.min(window.devicePixelRatio || 1, DENSITE_MAX);
      toile.width = Math.round(toile.clientWidth * densite);
      toile.height = Math.round(toile.clientHeight * densite);
      dessiner(toile, performance.now() / 1000, window.scrollY);
    };
    const boucle = (horodatage: number) => {
      dessiner(toile, horodatage / 1000, window.scrollY);
      if (visible && !document.hidden) {
        image = requestAnimationFrame(boucle);
      }
    };
    const relancer = () => {
      cancelAnimationFrame(image);
      if (!mouvementReduit && visible && !document.hidden) {
        image = requestAnimationFrame(boucle);
      }
    };

    const tailles = new ResizeObserver(ajuster);
    tailles.observe(toile);
    const presence = new IntersectionObserver(([entree]) => {
      visible = entree?.isIntersecting ?? false;
      relancer();
    });
    presence.observe(toile);
    document.addEventListener('visibilitychange', relancer);
    ajuster();
    relancer();

    return () => {
      cancelAnimationFrame(image);
      tailles.disconnect();
      presence.disconnect();
      document.removeEventListener('visibilitychange', relancer);
    };
  }, []);

  return <canvas ref={reference} className="maree" aria-hidden="true" />;
}
