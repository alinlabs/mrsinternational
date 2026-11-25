import {
  buatDaftarFlightDefault,
  CREATIVE_MATRIX_KANONIK,
  KURS_PLANNING_USD_IDR_KANONIK,
  STATE_AWAL_IKLAN_ANGGARAN,
} from '../data/iklan-kanonik';
import type {
  BarisCreativeMatrix,
  EntriBelanjaAktual,
  FlightKampanyeIklan,
  IdSkenarioAnggaran,
  PersetujuanAnggaran,
  StateIklanAnggaran,
} from '../types/iklan';

const KUNCI_PENYIMPANAN_IKLAN = 'ragi_hotang_iklan_v1';
export const EVENT_IKLAN_DIPERBARUI = 'ragi-hotang:iklan-diperbarui';

function buatStateAwal(): StateIklanAnggaran {
  return {
    ...STATE_AWAL_IKLAN_ANGGARAN,
    daftarFlight: buatDaftarFlightDefault(STATE_AWAL_IKLAN_ANGGARAN.skenarioAktif),
    creativeMatrix: [...CREATIVE_MATRIX_KANONIK],
  };
}

function bacaState(): StateIklanAnggaran {
  if (typeof window === 'undefined') return buatStateAwal();
  try {
    const mentah = window.localStorage.getItem(KUNCI_PENYIMPANAN_IKLAN);
    if (!mentah) return buatStateAwal();
    const terurai = JSON.parse(mentah) as Partial<StateIklanAnggaran> | null;
    if (!terurai || typeof terurai !== 'object') return buatStateAwal();

    const skenarioAktif: IdSkenarioAnggaran =
      terurai.skenarioAktif === 'hemat' ||
      terurai.skenarioAktif === 'menengah' ||
      terurai.skenarioAktif === 'agresif'
        ? terurai.skenarioAktif
        : 'menengah';

    return {
      skenarioAktif,
      kursPlanningUsdIdr:
        typeof terurai.kursPlanningUsdIdr === 'number' &&
        terurai.kursPlanningUsdIdr > 0
          ? terurai.kursPlanningUsdIdr
          : KURS_PLANNING_USD_IDR_KANONIK,
      daftarFlight: Array.isArray(terurai.daftarFlight)
        ? terurai.daftarFlight.map((f) =>
            f.id === 'flight-tiktok-1' && f.mataUang === 'USD'
              ? {
                  ...f,
                  mataUang: 'IDR' as const,
                  anggaranHarian:
                    skenarioAktif === 'hemat'
                      ? 0
                      : skenarioAktif === 'agresif'
                        ? 400000
                        : 450000,
                  catatanBilling:
                    skenarioAktif === 'hemat'
                      ? 'Paket Efisien berjalan organik 2 video/hari tanpa top-up iklan berbayar.'
                      : skenarioAktif === 'agresif'
                        ? 'Anggaran harian ditetapkan Rp800.000/hari (2 ad groups @Rp400.000/hari) selama 7 hari (4–10 Des). Verifikasi batas minimum Ads Manager sebelum top-up; fallback organik jika tidak memenuhi syarat.'
                        : 'Anggaran harian ditetapkan Rp450.000/hari per ad group selama 7 hari (4–10 Des). Verifikasi batas minimum Ads Manager sebelum top-up; fallback organik jika tidak memenuhi syarat.',
                }
              : f,
          )
        : buatDaftarFlightDefault(skenarioAktif),
      creativeMatrix: Array.isArray(terurai.creativeMatrix)
        ? terurai.creativeMatrix
        : [...CREATIVE_MATRIX_KANONIK],
      persetujuanAktif: terurai.persetujuanAktif ?? null,
      riwayatPersetujuan: Array.isArray(terurai.riwayatPersetujuan)
        ? terurai.riwayatPersetujuan
        : [],
      daftarBelanjaAktual: Array.isArray(terurai.daftarBelanjaAktual)
        ? terurai.daftarBelanjaAktual
        : [],
    };
  } catch {
    return buatStateAwal();
  }
}

function tulisState(state: StateIklanAnggaran): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KUNCI_PENYIMPANAN_IKLAN, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_IKLAN_DIPERBARUI));
  } catch {
    // Abaikan kuota storage penuh tanpa menjatuhkan UI
  }
}

export const repositoriIklanLokal = {
  muatSemua(): StateIklanAnggaran {
    return bacaState();
  },

  ubahSkenarioAktif(skenario: IdSkenarioAnggaran): StateIklanAnggaran {
    const sekarang = bacaState();
    const stateBaru: StateIklanAnggaran = {
      ...sekarang,
      skenarioAktif: skenario,
      daftarFlight: buatDaftarFlightDefault(skenario),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  simpanFlight(flightDiperbarui: FlightKampanyeIklan): StateIklanAnggaran {
    const sekarang = bacaState();
    const ada = sekarang.daftarFlight.some((f) => f.id === flightDiperbarui.id);
    const daftarBaru = ada
      ? sekarang.daftarFlight.map((f) =>
          f.id === flightDiperbarui.id ? flightDiperbarui : f,
        )
      : [...sekarang.daftarFlight, flightDiperbarui];

    const stateBaru: StateIklanAnggaran = {
      ...sekarang,
      daftarFlight: daftarBaru,
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  perbaruiCreative(creativeBaru: BarisCreativeMatrix): StateIklanAnggaran {
    const sekarang = bacaState();
    const stateBaru: StateIklanAnggaran = {
      ...sekarang,
      creativeMatrix: sekarang.creativeMatrix.map((c) =>
        c.id === creativeBaru.id ? creativeBaru : c,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  simpanPersetujuan(persetujuan: PersetujuanAnggaran): StateIklanAnggaran {
    const sekarang = bacaState();
    const stateBaru: StateIklanAnggaran = {
      ...sekarang,
      persetujuanAktif: persetujuan,
      riwayatPersetujuan: [persetujuan, ...sekarang.riwayatPersetujuan],
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  tambahBelanjaAktual(
    daftarBaru: EntriBelanjaAktual | EntriBelanjaAktual[],
  ): StateIklanAnggaran {
    const sekarang = bacaState();
    const entriMasuk = Array.isArray(daftarBaru) ? daftarBaru : [daftarBaru];
    const stateBaru: StateIklanAnggaran = {
      ...sekarang,
      daftarBelanjaAktual: [...entriMasuk, ...sekarang.daftarBelanjaAktual],
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  hapusBelanjaAktual(idEntri: string): StateIklanAnggaran {
    const sekarang = bacaState();
    const stateBaru: StateIklanAnggaran = {
      ...sekarang,
      daftarBelanjaAktual: sekarang.daftarBelanjaAktual.filter(
        (e) => e.id !== idEntri,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  resetSemua(): StateIklanAnggaran {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(KUNCI_PENYIMPANAN_IKLAN);
        window.dispatchEvent(new CustomEvent(EVENT_IKLAN_DIPERBARUI));
      } catch {
        // Abaikan
      }
    }
    return buatStateAwal();
  },
};
