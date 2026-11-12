import { describe, expect, it } from 'vitest';

import { liensDeContact } from './contact';

// Coordonnées de test, sans rapport avec des coordonnées réelles.
describe('liensDeContact', () => {
  it('construit un lien de courriel et un lien WhatsApp', () => {
    const liens = liensDeContact({ courriel: 'bonjour@exemple.test', whatsapp: '+225 01 02 03 04 05' });
    expect(liens).toEqual([
      { moyen: 'courriel', libelle: 'bonjour@exemple.test', adresse: 'mailto:bonjour@exemple.test' },
      { moyen: 'whatsapp', libelle: '+225 01 02 03 04 05', adresse: 'https://wa.me/2250102030405' },
    ]);
  });

  it("ne construit rien quand rien n'est renseigné", () => {
    expect(liensDeContact({ courriel: '', whatsapp: '  ' })).toEqual([]);
  });

  it("n'affiche que la coordonnée renseignée", () => {
    const liens = liensDeContact({ courriel: '', whatsapp: '+2250102030405' });
    expect(liens.map((lien) => lien.moyen)).toEqual(['whatsapp']);
  });

  it('refuse une coordonnée mal formée', () => {
    expect(() => liensDeContact({ courriel: 'sans-arobase', whatsapp: '' })).toThrow(/courriel invalide/);
    expect(() => liensDeContact({ courriel: '', whatsapp: '0102030405' })).toThrow(/WhatsApp invalide/);
    expect(() => liensDeContact({ courriel: '', whatsapp: '+225 12' })).toThrow(/WhatsApp invalide/);
  });
});
