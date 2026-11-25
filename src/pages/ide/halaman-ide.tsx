import { useRef, useState } from 'react';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import { BilahTabAtas } from '../../components/ui';
import { SectionGagasan } from './section-gagasan';
import { SectionTahapanIklan } from './section-tahapan-iklan';
import { SectionPesanPilar } from './section-pesan-pilar';
import { SectionWilayahTamu } from './section-wilayah-tamu';
import { SectionKpiDanDijaga } from './section-kpi-dan-dijaga';
import { SectionPaketBiaya } from './section-paket-biaya';

type BabIdeId =
  | 'semua'
  | 'gagasan'
  | 'tahapan'
  | 'pesan'
  | 'wilayah'
  | 'penjagaan'
  | 'biaya';

const DAFTAR_BAB: { id: BabIdeId; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'gagasan', label: 'Gagasan' },
  { id: 'tahapan', label: 'Tahapan & Jadwal' },
  { id: 'pesan', label: 'Pesan & Pilar' },
  { id: 'wilayah', label: 'Wilayah & Tamu' },
  { id: 'penjagaan', label: 'KPI & Dijaga' },
  { id: 'biaya', label: 'Paket Biaya' },
];

export default function HalamanIde() {
  const [babAktif, setBabAktif] = useState<BabIdeId>('semua');
  const areaKontenScrollRef = useRef<HTMLDivElement>(null);

  const pilihBab = (id: BabIdeId) => {
    setBabAktif(id);
    if (areaKontenScrollRef.current) {
      areaKontenScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col print:block print:h-auto">
      <h1 className="sr-only">MRs Plan — Rencana Utama</h1>

      <BilahTabAtas
        daftarTab={DAFTAR_BAB}
        tabAktif={babAktif}
        onUbahTab={(id) => pilihBab(id as BabIdeId)}
        labelNavigasi="Bagian panduan Rencana Utama"
      />

      <div
        ref={areaKontenScrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible"
      >
        <div className="relative min-h-full">
          <div
            aria-hidden="true"
            style={{
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 5%, rgba(0,0,0,0.48) 13%, rgba(0,0,0,0.16) 24%, rgba(0,0,0,0.03) 40%, rgba(0,0,0,0) 56%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 5%, rgba(0,0,0,0.48) 13%, rgba(0,0,0,0.16) 24%, rgba(0,0,0,0.03) 40%, rgba(0,0,0,0) 56%)',
            }}
            className="pointer-events-none select-none print:hidden absolute inset-x-0 top-0 z-0 h-[440px] sm:h-[520px] lg:h-[600px] overflow-hidden"
          >
            <img
              src="/main-background.webp"
              alt=""
              className="w-full h-full object-cover object-[50%_5%] opacity-100"
            />
          </div>

          <WadahHalaman className="relative z-10">
            <div className="mt-16 sm:mt-20 lg:mt-24 space-y-11 pb-10">
              {(babAktif === 'semua' || babAktif === 'gagasan') && <SectionGagasan />}
              {(babAktif === 'semua' || babAktif === 'tahapan') && <SectionTahapanIklan />}
              {(babAktif === 'semua' || babAktif === 'pesan') && <SectionPesanPilar />}
              {(babAktif === 'semua' || babAktif === 'wilayah') && <SectionWilayahTamu />}
              {(babAktif === 'semua' || babAktif === 'penjagaan') && <SectionKpiDanDijaga />}
              {(babAktif === 'semua' || babAktif === 'biaya') && <SectionPaketBiaya />}
            </div>
          </WadahHalaman>
        </div>
      </div>
    </div>
  );
}
