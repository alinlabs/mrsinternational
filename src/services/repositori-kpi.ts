import { STATE_AWAL_KPI_MONITORING } from '../data/kpi-kanonik';
import type {
  Baseline72Jam,
  InquiryKualifikasi,
  SnapshotKpiAktual,
  StateKpiMonitoring,
} from '../types/kpi';

const KUNCI_PENYIMPANAN_KPI = 'ragi_hotang_kpi_v1';
export const EVENT_KPI_DIPERBARUI = 'ragi-hotang:kpi-diperbarui';

function bacaState(): StateKpiMonitoring {
  if (typeof window === 'undefined') return STATE_AWAL_KPI_MONITORING;
  try {
    const mentah = window.localStorage.getItem(KUNCI_PENYIMPANAN_KPI);
    if (!mentah) return STATE_AWAL_KPI_MONITORING;
    const terurai = JSON.parse(mentah) as Partial<StateKpiMonitoring> | null;
    if (!terurai || typeof terurai !== 'object') {
      return STATE_AWAL_KPI_MONITORING;
    }

    const daftarSnapshot = Array.isArray(terurai.daftarSnapshot)
      ? terurai.daftarSnapshot.filter((s) => !s.dataContoh)
      : [];

    return {
      daftarSnapshot,
      baseline72Jam: terurai.baseline72Jam ?? null,
      daftarInquiry: Array.isArray(terurai.daftarInquiry)
        ? terurai.daftarInquiry
        : [],
    };
  } catch {
    return STATE_AWAL_KPI_MONITORING;
  }
}

function tulisState(state: StateKpiMonitoring): void {
  if (typeof window === 'undefined') return;
  try {
    const bersih: StateKpiMonitoring = {
      ...state,
      daftarSnapshot: state.daftarSnapshot.filter((s) => !s.dataContoh),
    };
    window.localStorage.setItem(KUNCI_PENYIMPANAN_KPI, JSON.stringify(bersih));
    window.dispatchEvent(new CustomEvent(EVENT_KPI_DIPERBARUI));
  } catch {
    // Abaikan kuota penuh tanpa merusak UI
  }
}

export const repositoriKpiLokal = {
  muatSemua(): StateKpiMonitoring {
    return bacaState();
  },

  tambahSnapshot(
    entri: SnapshotKpiAktual | SnapshotKpiAktual[],
  ): StateKpiMonitoring {
    const sekarang = bacaState();
    const masuk = (Array.isArray(entri) ? entri : [entri]).filter(
      (s) => !s.dataContoh,
    );
    const baru: StateKpiMonitoring = {
      ...sekarang,
      daftarSnapshot: [...masuk, ...sekarang.daftarSnapshot],
    };
    tulisState(baru);
    return baru;
  },

  hapusSnapshot(idSnapshot: string): StateKpiMonitoring {
    const sekarang = bacaState();
    const baru: StateKpiMonitoring = {
      ...sekarang,
      daftarSnapshot: sekarang.daftarSnapshot.filter((s) => s.id !== idSnapshot),
    };
    tulisState(baru);
    return baru;
  },

  simpanBaseline72Jam(baseline: Baseline72Jam): StateKpiMonitoring {
    const sekarang = bacaState();
    const baru: StateKpiMonitoring = {
      ...sekarang,
      baseline72Jam: baseline,
    };
    tulisState(baru);
    return baru;
  },

  tambahInquiry(inquiry: InquiryKualifikasi): StateKpiMonitoring {
    const sekarang = bacaState();
    const baru: StateKpiMonitoring = {
      ...sekarang,
      daftarInquiry: [inquiry, ...sekarang.daftarInquiry],
    };
    tulisState(baru);
    return baru;
  },

  perbaruiInquiry(inquiryDiperbarui: InquiryKualifikasi): StateKpiMonitoring {
    const sekarang = bacaState();
    const baru: StateKpiMonitoring = {
      ...sekarang,
      daftarInquiry: sekarang.daftarInquiry.map((i) =>
        i.id === inquiryDiperbarui.id ? inquiryDiperbarui : i,
      ),
    };
    tulisState(baru);
    return baru;
  },

  hapusInquiry(idInquiry: string): StateKpiMonitoring {
    const sekarang = bacaState();
    const baru: StateKpiMonitoring = {
      ...sekarang,
      daftarInquiry: sekarang.daftarInquiry.filter((i) => i.id !== idInquiry),
    };
    tulisState(baru);
    return baru;
  },

  resetSemua(): StateKpiMonitoring {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(KUNCI_PENYIMPANAN_KPI);
        window.dispatchEvent(new CustomEvent(EVENT_KPI_DIPERBARUI));
      } catch {
        // Abaikan
      }
    }
    return STATE_AWAL_KPI_MONITORING;
  },
};
