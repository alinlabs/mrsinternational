import { KONSEP_KONTEN_KANONIK } from '../data/kalender-kanonik';
import type { KonsepKonten, TambahanEditKonten } from '../types/kalender';
import { gabungkanKonsepDenganEdit } from '../utils/kalender';

const KUNCI_PENYIMPANAN_KALENDER = 'ragi_hotang_kalender_edit_v1';
export const EVENT_KALENDER_DIPERBARUI = 'ragi-hotang:kalender-diperbarui';

function bacaPetaEdit(): Record<string, TambahanEditKonten> {
  if (typeof window === 'undefined') return {};
  try {
    const mentah = window.localStorage.getItem(KUNCI_PENYIMPANAN_KALENDER);
    if (!mentah) return {};
    const terurai = JSON.parse(mentah) as unknown;
    if (terurai && typeof terurai === 'object' && !Array.isArray(terurai)) {
      return terurai as Record<string, TambahanEditKonten>;
    }
    return {};
  } catch {
    return {};
  }
}

function tulisPetaEdit(peta: Record<string, TambahanEditKonten>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KUNCI_PENYIMPANAN_KALENDER, JSON.stringify(peta));
    window.dispatchEvent(new CustomEvent(EVENT_KALENDER_DIPERBARUI));
  } catch {
    // Abaikan kuota storage penuh tanpa menjatuhkan UI
  }
}

export interface RepositoriKalender {
  muatSemua: () => KonsepKonten[];
  simpanEdit: (id: string, perubahan: TambahanEditKonten) => KonsepKonten[];
  resetSemua: () => KonsepKonten[];
}

export const repositoriKalenderLokal: RepositoriKalender = {
  muatSemua() {
    const petaEdit = bacaPetaEdit();
    return gabungkanKonsepDenganEdit(KONSEP_KONTEN_KANONIK, petaEdit);
  },

  simpanEdit(id, perubahan) {
    const petaSekarang = bacaPetaEdit();
    const sebelumnya = petaSekarang[id] ?? {};
    const petaBaru: Record<string, TambahanEditKonten> = {
      ...petaSekarang,
      [id]: {
        ...sebelumnya,
        ...perubahan,
        diperbaruiPada: new Date().toISOString(),
      },
    };
    tulisPetaEdit(petaBaru);
    return gabungkanKonsepDenganEdit(KONSEP_KONTEN_KANONIK, petaBaru);
  },

  resetSemua() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(KUNCI_PENYIMPANAN_KALENDER);
        window.dispatchEvent(new CustomEvent(EVENT_KALENDER_DIPERBARUI));
      } catch {
        // Abaikan
      }
    }
    return KONSEP_KONTEN_KANONIK;
  },
};
