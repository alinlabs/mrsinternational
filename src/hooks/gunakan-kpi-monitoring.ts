import { useCallback, useEffect, useState } from 'react';
import { SNAPSHOT_CONTOH_SIMULASI } from '../data/kpi-kanonik';
import {
  EVENT_KPI_DIPERBARUI,
  repositoriKpiLokal,
} from '../services/repositori-kpi';
import type {
  Baseline72Jam,
  InquiryKualifikasi,
  SnapshotKpiAktual,
  StateKpiMonitoring,
} from '../types/kpi';

export function gunakanKpiMonitoring() {
  const [stateKpi, setStateKpi] = useState<StateKpiMonitoring>(() =>
    repositoriKpiLokal.muatSemua(),
  );
  // Mode contoh murni di memori (tidak pernah disimpan ke localStorage/produksi)
  const [modeContohAktif, setModeContohAktif] = useState(false);

  const muatUlang = useCallback(() => {
    setStateKpi(repositoriKpiLokal.muatSemua());
  }, []);

  useEffect(() => {
    const tanganiUpdate = () => muatUlang();
    window.addEventListener(EVENT_KPI_DIPERBARUI, tanganiUpdate);
    window.addEventListener('storage', tanganiUpdate);
    return () => {
      window.removeEventListener(EVENT_KPI_DIPERBARUI, tanganiUpdate);
      window.removeEventListener('storage', tanganiUpdate);
    };
  }, [muatUlang]);

  const tambahSnapshot = useCallback(
    (entri: SnapshotKpiAktual | SnapshotKpiAktual[]) => {
      setModeContohAktif(false);
      setStateKpi(repositoriKpiLokal.tambahSnapshot(entri));
    },
    [],
  );

  const hapusSnapshot = useCallback((idSnapshot: string) => {
    setStateKpi(repositoriKpiLokal.hapusSnapshot(idSnapshot));
  }, []);

  const simpanBaseline72Jam = useCallback((baseline: Baseline72Jam) => {
    setStateKpi(repositoriKpiLokal.simpanBaseline72Jam(baseline));
  }, []);

  const tambahInquiry = useCallback((inquiry: InquiryKualifikasi) => {
    setStateKpi(repositoriKpiLokal.tambahInquiry(inquiry));
  }, []);

  const perbaruiInquiry = useCallback((inquiry: InquiryKualifikasi) => {
    setStateKpi(repositoriKpiLokal.perbaruiInquiry(inquiry));
  }, []);

  const hapusInquiry = useCallback((idInquiry: string) => {
    setStateKpi(repositoriKpiLokal.hapusInquiry(idInquiry));
  }, []);

  const resetSemuaKpi = useCallback(() => {
    setModeContohAktif(false);
    setStateKpi(repositoriKpiLokal.resetSemua());
  }, []);

  const daftarSnapshotTampil = modeContohAktif
    ? SNAPSHOT_CONTOH_SIMULASI
    : stateKpi.daftarSnapshot;

  return {
    stateKpi,
    daftarSnapshotTampil,
    modeContohAktif,
    setModeContohAktif,
    tambahSnapshot,
    hapusSnapshot,
    simpanBaseline72Jam,
    tambahInquiry,
    perbaruiInquiry,
    hapusInquiry,
    resetSemuaKpi,
  };
}
