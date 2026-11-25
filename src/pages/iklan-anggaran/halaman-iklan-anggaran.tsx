import { useMemo, useState } from 'react';
import { FileText, RotateCcw } from 'lucide-react';
import { ModalEksporPdf } from '../../components/domain/modal-ekspor-pdf';
import { gunakanIklanAnggaran } from '../../hooks/gunakan-iklan-anggaran';
import type { FlightKampanyeIklan } from '../../types/iklan';
import { hitungRingkasanPengendalianAnggaran } from '../../utils/iklan';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
  BilahTabAtas,
  HeaderHalaman,
  ModalKonfirmasi,
  Tombol,
  gunakanToast,
} from '../../components/ui';
import type { ItemTab } from '../../components/ui';
import { PanelEditFlight } from './panel-edit-flight';
import { SectionActualApprovals } from './section-actual-approvals';
import { SectionBudgetScenarios } from './section-budget-scenarios';
import { SectionCreativeMatrix } from './section-creative-matrix';
import { SectionFlightSchedule } from './section-flight-schedule';
import { SectionOverviewIklan } from './section-overview-iklan';

export default function HalamanIklanAnggaran() {
  const {
    stateIklan,
    ubahSkenarioAktif,
    simpanFlight,
    perbaruiCreative,
    simpanPersetujuan,
    tambahBelanjaAktual,
    hapusBelanjaAktual,
    resetKeRencanaAwal,
  } = gunakanIklanAnggaran();
  const { tampilkanToast } = gunakanToast();

  const [tabAktif, setTabAktif] = useState('overview');
  const [flightDipilih, setFlightDipilih] =
    useState<FlightKampanyeIklan | null>(null);
  const [konfirmasiReset, setKonfirmasiReset] = useState(false);
  const [modalPdfTerbuka, setModalPdfTerbuka] = useState(false);

  const ringkasan = useMemo(
    () => hitungRingkasanPengendalianAnggaran(stateIklan),
    [stateIklan],
  );

  const daftarTab: ItemTab[] = [
    {
      id: 'overview',
      label: 'Ringkasan',
      konten: (
        <SectionOverviewIklan
          stateIklan={stateIklan}
          ringkasan={ringkasan}
          onUbahSkenario={(s) => {
            ubahSkenarioAktif(s);
            tampilkanToast({
              jenis: 'info',
              judul: `Paket biaya beralih ke ${s.toUpperCase()}`,
            });
          }}
          onBukaTab={(tab) => setTabAktif(tab)}
        />
      ),
    },
    {
      id: 'flight-schedule',
      label: 'Jadwal Iklan',
      konten: (
        <SectionFlightSchedule
          daftarFlight={stateIklan.daftarFlight}
          kursUsdIdr={stateIklan.kursPlanningUsdIdr}
          onEditFlight={(flight) => setFlightDipilih(flight)}
        />
      ),
    },
    {
      id: 'budget-scenarios',
      label: 'Paket Biaya',
      konten: (
        <SectionBudgetScenarios
          skenarioAktif={stateIklan.skenarioAktif}
          onPilihSkenario={(s) => {
            ubahSkenarioAktif(s);
            tampilkanToast({
              jenis: 'sukses',
              judul: `Paket biaya diperbarui ke ${s.toUpperCase()}`,
            });
          }}
        />
      ),
    },
    {
      id: 'creative-matrix',
      label: 'Daftar Materi Iklan',
      konten: (
        <SectionCreativeMatrix
          daftarCreative={stateIklan.creativeMatrix}
          onSimpanCreative={(creative) => {
            perbaruiCreative(creative);
            tampilkanToast({
              jenis: 'sukses',
              judul: 'Catatan materi iklan diperbarui',
            });
          }}
        />
      ),
    },
    {
      id: 'actual-approvals',
      label: 'Belanja & Persetujuan',
      konten: (
        <SectionActualApprovals
          stateIklan={stateIklan}
          ringkasan={ringkasan}
          onSimpanPersetujuan={(persetujuan) => {
            simpanPersetujuan(persetujuan);
            tampilkanToast({
              jenis: 'sukses',
              judul: 'Persetujuan batas biaya dicatat',
            });
          }}
          onTambahAktual={(entri) => {
            tambahBelanjaAktual(entri);
            tampilkanToast({
              jenis: 'sukses',
              judul: 'Catatan belanja aktual disimpan',
            });
          }}
          onHapusAktual={(idEntri) => {
            hapusBelanjaAktual(idEntri);
            tampilkanToast({
              jenis: 'info',
              judul: 'Catatan belanja dihapus',
            });
          }}
        />
      ),
    },
  ];

  const tabAktifObj =
    daftarTab.find((tab) => tab.id === tabAktif) ?? daftarTab[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col print:block print:h-auto">
      <BilahTabAtas
        daftarTab={daftarTab.map(({ id, label }) => ({ id, label }))}
        tabAktif={tabAktif}
        onUbahTab={setTabAktif}
        labelNavigasi="Navigasi tab iklan dan anggaran"
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
        <WadahHalaman>
          <HeaderHalaman
            labelTahap="Meta Ads & TikTok Ads"
            judul="Iklan & Anggaran"
            tujuan="Pilih paket biaya, atur jadwal iklan, catat persetujuan Owner, dan pantau belanja aktual."
            aksiUtama={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setModalPdfTerbuka(true)}
                >
                  Ekspor PDF
                </Tombol>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() => setKonfirmasiReset(true)}
                >
                  Reset ke Rencana Awal
                </Tombol>
              </div>
            }
          />

          <div role="tabpanel" aria-label={tabAktifObj?.label} className="pb-8">
            {tabAktifObj?.konten}
          </div>
        </WadahHalaman>
      </div>

      <PanelEditFlight
        flight={flightDipilih}
        kursUsdIdr={stateIklan.kursPlanningUsdIdr}
        onTutup={() => setFlightDipilih(null)}
        onSimpan={(flightBaru) => {
          simpanFlight(flightBaru);
          setFlightDipilih(null);
          tampilkanToast({
            jenis: 'sukses',
            judul: `Flight ${flightBaru.kodeFlight} diperbarui`,
          });
        }}
      />

      <ModalKonfirmasi
        terbuka={konfirmasiReset}
        onTutup={() => setKonfirmasiReset(false)}
        onKonfirmasi={() => {
          resetKeRencanaAwal();
          setKonfirmasiReset(false);
          tampilkanToast({
            jenis: 'info',
            judul: 'Data iklan & anggaran dikembalikan ke rencana awal',
          });
        }}
        judul="Kembalikan Iklan & Anggaran ke rencana awal?"
        pesan="Persetujuan batas biaya, perubahan jadwal iklan, dan catatan belanja lokal akan dikembalikan ke paket awal."
        labelKonfirmasi="Ya, reset sekarang"
        berbahaya
      />

      <ModalEksporPdf
        terbuka={modalPdfTerbuka}
        onTutup={() => setModalPdfTerbuka(false)}
        jenisDefault="ad-flight-budget"
      />
    </div>
  );
}
