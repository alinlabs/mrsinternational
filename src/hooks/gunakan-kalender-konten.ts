import { useCallback, useEffect, useState } from 'react';
import {
  EVENT_KALENDER_DIPERBARUI,
  repositoriKalenderLokal,
} from '../services/repositori-kalender';
import type { KonsepKonten, TambahanEditKonten } from '../types/kalender';

export function gunakanKalenderKonten() {
  const [daftarKonten, setDaftarKonten] = useState<KonsepKonten[]>(() =>
    repositoriKalenderLokal.muatSemua(),
  );

  useEffect(() => {
    const sinkronkan = () => {
      setDaftarKonten(repositoriKalenderLokal.muatSemua());
    };
    window.addEventListener(EVENT_KALENDER_DIPERBARUI, sinkronkan);
    window.addEventListener('storage', sinkronkan);
    return () => {
      window.removeEventListener(EVENT_KALENDER_DIPERBARUI, sinkronkan);
      window.removeEventListener('storage', sinkronkan);
    };
  }, []);

  const simpanPerubahanKonten = useCallback(
    (id: string, perubahan: TambahanEditKonten) => {
      const hasil = repositoriKalenderLokal.simpanEdit(id, perubahan);
      setDaftarKonten(hasil);
      return hasil;
    },
    [],
  );

  const resetKeRencanaAwal = useCallback(() => {
    const hasil = repositoriKalenderLokal.resetSemua();
    setDaftarKonten(hasil);
    return hasil;
  }, []);

  return {
    daftarKonten,
    simpanPerubahanKonten,
    resetKeRencanaAwal,
  };
}
