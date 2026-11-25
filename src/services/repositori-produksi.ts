import {
  BANK_PERTANYAAN_KANONIK,
  CHECKLIST_SHOOTING_KANONIK,
  DAFTAR_TUGAS_AWAL,
  DELIVERABLES_EDITING_KANONIK,
  SESI_SHOOTING_KANONIK,
} from '../data/produksi-kanonik';
import type {
  AgendaSlotShooting,
  DeliverableProduksi,
  PertanyaanWawancara,
  SesiShooting,
  StatusStateProduksi,
  TugasProduksi,
} from '../types/produksi';
import { petakanStatusTugasKeKonten } from '../utils/produksi';
import { repositoriKalenderLokal } from './repositori-kalender';

const KUNCI_PENYIMPANAN_PRODUKSI = 'ragi_hotang_produksi_v1';
export const EVENT_PRODUKSI_DIPERBARUI = 'ragi-hotang:produksi-diperbarui';

function buatStateAwal(): StatusStateProduksi {
  return {
    daftarTugas: DAFTAR_TUGAS_AWAL,
    daftarSesiShooting: SESI_SHOOTING_KANONIK,
    checklistShooting: CHECKLIST_SHOOTING_KANONIK,
    bankPertanyaan: BANK_PERTANYAAN_KANONIK,
    daftarDeliverables: DELIVERABLES_EDITING_KANONIK,
  };
}

function bacaState(): StatusStateProduksi {
  if (typeof window === 'undefined') return buatStateAwal();
  try {
    const mentah = window.localStorage.getItem(KUNCI_PENYIMPANAN_PRODUKSI);
    if (!mentah) return buatStateAwal();
    const terurai = JSON.parse(mentah) as Partial<StatusStateProduksi> | null;
    if (!terurai || typeof terurai !== 'object') return buatStateAwal();

    return {
      daftarTugas: Array.isArray(terurai.daftarTugas)
        ? terurai.daftarTugas
        : DAFTAR_TUGAS_AWAL,
      daftarSesiShooting: Array.isArray(terurai.daftarSesiShooting)
        ? [
            ...terurai.daftarSesiShooting,
            ...SESI_SHOOTING_KANONIK.filter(
              (kanonik) =>
                !terurai.daftarSesiShooting?.some((s) => s.id === kanonik.id),
            ),
          ]
        : SESI_SHOOTING_KANONIK,
      checklistShooting: Array.isArray(terurai.checklistShooting)
        ? terurai.checklistShooting
        : CHECKLIST_SHOOTING_KANONIK,
      bankPertanyaan: Array.isArray(terurai.bankPertanyaan)
        ? terurai.bankPertanyaan
        : BANK_PERTANYAAN_KANONIK,
      daftarDeliverables: Array.isArray(terurai.daftarDeliverables)
        ? terurai.daftarDeliverables
        : DELIVERABLES_EDITING_KANONIK,
    };
  } catch {
    return buatStateAwal();
  }
}

function tulisState(state: StatusStateProduksi): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KUNCI_PENYIMPANAN_PRODUKSI, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_PRODUKSI_DIPERBARUI));
  } catch {
    // Abaikan kuota storage penuh tanpa menjatuhkan UI
  }
}

function sinkronkanTugasKeKalender(tugas: TugasProduksi): void {
  if (!tugas.kontenTertaut || tugas.kontenTertaut.length === 0) return;
  const statusKonten = petakanStatusTugasKeKonten(tugas.status);
  for (const idKonten of tugas.kontenTertaut) {
    repositoriKalenderLokal.simpanEdit(idKonten, {
      status: statusKonten,
      ...(statusKonten === 'approved' && tugas.approver
        ? {
            persetujuan: {
              status: 'disetujui',
              disetujuiOleh: tugas.approver,
              tanggalDisetujui: new Date().toISOString().slice(0, 10),
              catatan: `Disinkronkan dari tugas produksi: ${tugas.judul}`,
            },
          }
        : {}),
    });
  }
}

export const repositoriProduksiLokal = {
  muatSemua(): StatusStateProduksi {
    return bacaState();
  },

  simpanTugas(tugasDiperbarui: TugasProduksi): StatusStateProduksi {
    const sekarang = bacaState();
    const ada = sekarang.daftarTugas.some((t) => t.id === tugasDiperbarui.id);
    const tugasFinal: TugasProduksi = {
      ...tugasDiperbarui,
      selesaiPada:
        tugasDiperbarui.status === 'approved' ||
        tugasDiperbarui.status === 'scheduled' ||
        tugasDiperbarui.status === 'published'
          ? tugasDiperbarui.selesaiPada || new Date().toISOString()
          : '',
    };

    const daftarTugasBaru = ada
      ? sekarang.daftarTugas.map((t) =>
          t.id === tugasFinal.id ? tugasFinal : t,
        )
      : [tugasFinal, ...sekarang.daftarTugas];

    const stateBaru: StatusStateProduksi = {
      ...sekarang,
      daftarTugas: daftarTugasBaru,
    };
    tulisState(stateBaru);
    sinkronkanTugasKeKalender(tugasFinal);
    return stateBaru;
  },

  perbaruiSesiShooting(
    idSesi: SesiShooting['id'],
    perubahan: Partial<Pick<SesiShooting, 'lokasiPrivat' | 'statusKesiapan' | 'catatanTambahan'>>,
  ): StatusStateProduksi {
    const sekarang = bacaState();
    const stateBaru: StatusStateProduksi = {
      ...sekarang,
      daftarSesiShooting: sekarang.daftarSesiShooting.map((s) =>
        s.id === idSesi ? { ...s, ...perubahan } : s,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  perbaruiSlotShooting(
    idSesi: SesiShooting['id'],
    idSlot: string,
    perubahan: Partial<Pick<AgendaSlotShooting, 'status' | 'catatanLapangan'>>,
  ): StatusStateProduksi {
    const sekarang = bacaState();
    const stateBaru: StatusStateProduksi = {
      ...sekarang,
      daftarSesiShooting: sekarang.daftarSesiShooting.map((s) =>
        s.id === idSesi
          ? {
              ...s,
              daftarSlot: s.daftarSlot.map((slot) =>
                slot.id === idSlot ? { ...slot, ...perubahan } : slot,
              ),
            }
          : s,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  toggleChecklist(idChecklist: string): StatusStateProduksi {
    const sekarang = bacaState();
    const stateBaru: StatusStateProduksi = {
      ...sekarang,
      checklistShooting: sekarang.checklistShooting.map((item) =>
        item.id === idChecklist ? { ...item, selesai: !item.selesai } : item,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  simpanPertanyaanWawancara(itemBaru: PertanyaanWawancara): StatusStateProduksi {
    const sekarang = bacaState();
    const stateBaru: StatusStateProduksi = {
      ...sekarang,
      bankPertanyaan: sekarang.bankPertanyaan.map((q) =>
        q.id === itemBaru.id ? itemBaru : q,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  perbaruiDeliverable(
    idDeliverable: string,
    perubahan: Partial<Pick<DeliverableProduksi, 'status' | 'catatan'>>,
  ): StatusStateProduksi {
    const sekarang = bacaState();
    const stateBaru: StatusStateProduksi = {
      ...sekarang,
      daftarDeliverables: sekarang.daftarDeliverables.map((d) =>
        d.id === idDeliverable ? { ...d, ...perubahan } : d,
      ),
    };
    tulisState(stateBaru);
    return stateBaru;
  },

  resetSemua(): StatusStateProduksi {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(KUNCI_PENYIMPANAN_PRODUKSI);
        window.dispatchEvent(new CustomEvent(EVENT_PRODUKSI_DIPERBARUI));
      } catch {
        // Abaikan
      }
    }
    return buatStateAwal();
  },
};
