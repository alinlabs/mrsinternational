import { useCallback, useEffect, useState } from 'react';
import {
  EVENT_PRODUKSI_DIPERBARUI,
  repositoriProduksiLokal,
} from '../services/repositori-produksi';
import type {
  AgendaSlotShooting,
  DeliverableProduksi,
  PertanyaanWawancara,
  SesiShooting,
  StatusStateProduksi,
  TugasProduksi,
} from '../types/produksi';

export function gunakanProduksi() {
  const [stateProduksi, setStateProduksi] = useState<StatusStateProduksi>(() =>
    repositoriProduksiLokal.muatSemua(),
  );

  useEffect(() => {
    const sinkronkan = () => {
      setStateProduksi(repositoriProduksiLokal.muatSemua());
    };
    window.addEventListener(EVENT_PRODUKSI_DIPERBARUI, sinkronkan);
    window.addEventListener('storage', sinkronkan);
    return () => {
      window.removeEventListener(EVENT_PRODUKSI_DIPERBARUI, sinkronkan);
      window.removeEventListener('storage', sinkronkan);
    };
  }, []);

  const simpanTugas = useCallback((tugas: TugasProduksi) => {
    setStateProduksi(repositoriProduksiLokal.simpanTugas(tugas));
  }, []);

  const perbaruiSesiShooting = useCallback(
    (
      idSesi: SesiShooting['id'],
      perubahan: Partial<Pick<SesiShooting, 'lokasiPrivat' | 'statusKesiapan' | 'catatanTambahan'>>,
    ) => {
      setStateProduksi(
        repositoriProduksiLokal.perbaruiSesiShooting(idSesi, perubahan),
      );
    },
    [],
  );

  const perbaruiSlotShooting = useCallback(
    (
      idSesi: SesiShooting['id'],
      idSlot: string,
      perubahan: Partial<Pick<AgendaSlotShooting, 'status' | 'catatanLapangan'>>,
    ) => {
      setStateProduksi(
        repositoriProduksiLokal.perbaruiSlotShooting(idSesi, idSlot, perubahan),
      );
    },
    [],
  );

  const toggleChecklist = useCallback((idChecklist: string) => {
    setStateProduksi(repositoriProduksiLokal.toggleChecklist(idChecklist));
  }, []);

  const simpanPertanyaanWawancara = useCallback((item: PertanyaanWawancara) => {
    setStateProduksi(repositoriProduksiLokal.simpanPertanyaanWawancara(item));
  }, []);

  const perbaruiDeliverable = useCallback(
    (
      idDeliverable: string,
      perubahan: Partial<Pick<DeliverableProduksi, 'status' | 'catatan'>>,
    ) => {
      setStateProduksi(
        repositoriProduksiLokal.perbaruiDeliverable(idDeliverable, perubahan),
      );
    },
    [],
  );

  const resetProduksi = useCallback(() => {
    setStateProduksi(repositoriProduksiLokal.resetSemua());
  }, []);

  return {
    stateProduksi,
    simpanTugas,
    perbaruiSesiShooting,
    perbaruiSlotShooting,
    toggleChecklist,
    simpanPertanyaanWawancara,
    perbaruiDeliverable,
    resetProduksi,
  };
}
