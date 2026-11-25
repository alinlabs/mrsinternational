import { useCallback, useEffect, useState } from 'react';
import {
  EVENT_IKLAN_DIPERBARUI,
  repositoriIklanLokal,
} from '../services/repositori-iklan';
import type {
  BarisCreativeMatrix,
  EntriBelanjaAktual,
  FlightKampanyeIklan,
  IdSkenarioAnggaran,
  PersetujuanAnggaran,
  StateIklanAnggaran,
} from '../types/iklan';

export function gunakanIklanAnggaran() {
  const [stateIklan, setStateIklan] = useState<StateIklanAnggaran>(() =>
    repositoriIklanLokal.muatSemua(),
  );

  useEffect(() => {
    const sinkronkan = () => {
      setStateIklan(repositoriIklanLokal.muatSemua());
    };
    window.addEventListener(EVENT_IKLAN_DIPERBARUI, sinkronkan);
    window.addEventListener('storage', sinkronkan);
    return () => {
      window.removeEventListener(EVENT_IKLAN_DIPERBARUI, sinkronkan);
      window.removeEventListener('storage', sinkronkan);
    };
  }, []);

  const ubahSkenarioAktif = useCallback((skenario: IdSkenarioAnggaran) => {
    setStateIklan(repositoriIklanLokal.ubahSkenarioAktif(skenario));
  }, []);

  const simpanFlight = useCallback((flight: FlightKampanyeIklan) => {
    setStateIklan(repositoriIklanLokal.simpanFlight(flight));
  }, []);

  const perbaruiCreative = useCallback((creative: BarisCreativeMatrix) => {
    setStateIklan(repositoriIklanLokal.perbaruiCreative(creative));
  }, []);

  const simpanPersetujuan = useCallback((persetujuan: PersetujuanAnggaran) => {
    setStateIklan(repositoriIklanLokal.simpanPersetujuan(persetujuan));
  }, []);

  const tambahBelanjaAktual = useCallback(
    (entri: EntriBelanjaAktual | EntriBelanjaAktual[]) => {
      setStateIklan(repositoriIklanLokal.tambahBelanjaAktual(entri));
    },
    [],
  );

  const hapusBelanjaAktual = useCallback((idEntri: string) => {
    setStateIklan(repositoriIklanLokal.hapusBelanjaAktual(idEntri));
  }, []);

  const resetKeRencanaAwal = useCallback(() => {
    setStateIklan(repositoriIklanLokal.resetSemua());
  }, []);

  return {
    stateIklan,
    ubahSkenarioAktif,
    simpanFlight,
    perbaruiCreative,
    simpanPersetujuan,
    tambahBelanjaAktual,
    hapusBelanjaAktual,
    resetKeRencanaAwal,
  };
}
