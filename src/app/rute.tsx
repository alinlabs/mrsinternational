import { Navigate, Route, Routes } from 'react-router-dom';
import { TataLetakAplikasi } from '../components/layout/tata-letak-aplikasi';
import HalamanIde from '../pages/ide/halaman-ide';
import HalamanKalenderKonten from '../pages/kalender-konten/halaman-kalender-konten';
import HalamanProduksiTugas from '../pages/produksi-tugas/halaman-produksi-tugas';
import HalamanPerpustakaanAset from '../pages/perpustakaan-aset/halaman-perpustakaan-aset';
import HalamanIklanAnggaran from '../pages/iklan-anggaran/halaman-iklan-anggaran';
import HalamanStakeholder from '../pages/stakeholder/halaman-stakeholder';
import HalamanKpiMonitoring from '../pages/kpi-monitoring/halaman-kpi-monitoring';
import HalamanLaporan from '../pages/laporan/halaman-laporan';
import HalamanPengaturan from '../pages/pengaturan/halaman-pengaturan';
import HalamanTidakDiizinkan from '../pages/status-sistem/halaman-tidak-diizinkan';
import HalamanTidakDitemukan from '../pages/status-sistem/halaman-tidak-ditemukan';

export function RuteAplikasi() {
  return (
    <Routes>
      <Route element={<TataLetakAplikasi />}>
        <Route index element={<HalamanIde />} />
        <Route path="rencana" element={<Navigate to="/" replace />} />
        <Route path="kalender" element={<HalamanKalenderKonten />} />
        <Route path="produksi" element={<HalamanProduksiTugas />} />
        <Route path="aset" element={<HalamanPerpustakaanAset />} />
        <Route path="iklan" element={<HalamanIklanAnggaran />} />
        <Route path="stakeholder" element={<HalamanStakeholder />} />
        <Route path="monitoring" element={<HalamanKpiMonitoring />} />
        <Route path="laporan" element={<HalamanLaporan />} />
        <Route path="pengaturan" element={<HalamanPengaturan />} />
        <Route path="tidak-diizinkan" element={<HalamanTidakDiizinkan />} />
        <Route path="*" element={<HalamanTidakDitemukan />} />
      </Route>
    </Routes>
  );
}
