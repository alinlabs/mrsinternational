import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { gunakanSesiAplikasi } from '../../hooks/gunakan-sesi-aplikasi';
import { ambilPengaturanApi } from '../../services/layanan-pengaturan';
import type { DataPengaturanTerotorisasi } from '../../types/pengaturan';
import { dapatkanLabelPeran } from '../../utils/format';
import { WadahHalaman } from '../../components/layout/wadah-halaman';
import {
  BilahTabAtas,
  HeaderHalaman,
  Kartu,
  KondisiGagal,
  KondisiMemuat,
  StatusTeks,
  Tombol,
} from '../../components/ui';
import type { ItemTab } from '../../components/ui';
import { SectionAuditLog } from './section-audit-log';
import { SectionEventAnggaran } from './section-event-anggaran';
import { SectionIntegrasiBackup } from './section-integrasi-backup';
import { SectionSesiAuth } from './section-sesi-auth';
import { SectionTimRbac } from './section-tim-rbac';

export default function HalamanPengaturan() {
  const { sesi, tokenBearer } = gunakanSesiAplikasi();
  const [tabAktif, setTabAktif] = useState('sesi');
  const [dataPengaturan, setDataPengaturan] =
    useState<DataPengaturanTerotorisasi | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [galatMuat, setGalatMuat] = useState('');

  const muatPengaturan = useCallback(async () => {
    if (!sesi.terautentikasi || !tokenBearer) {
      setDataPengaturan(null);
      setGalatMuat('');
      return;
    }

    setSedangMemuat(true);
    setGalatMuat('');
    const resp = await ambilPengaturanApi(tokenBearer);
    setSedangMemuat(false);

    if (!resp.ok || !resp.data) {
      setGalatMuat(resp.error?.message ?? 'Gagal memuat pengaturan sistem.');
      return;
    }
    setDataPengaturan(resp.data);
  }, [sesi.terautentikasi, tokenBearer]);

  useEffect(() => {
    void muatPengaturan();
  }, [muatPengaturan]);

  const panelButuhLogin = (judulPanel: string) => (
    <Kartu judul={judulPanel}>
      <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5 text-[var(--teks-sekunder)]">
          <Lock className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[var(--teks-utama)]">
              Silakan Masuk Terlebih Dahulu
            </p>
            <p className="mt-0.5">
              Masuk melalui akun Google atau Kode Masuk Tim agar hak akses Anda dapat dikenali.
            </p>
          </div>
        </div>
        <Tombol
          varian="primer"
          ukuran="sm"
          ikonKiri={<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={() => setTabAktif('sesi')}
        >
          Ke Tab Masuk &amp; Sesi
        </Tombol>
      </div>
    </Kartu>
  );

  const renderKontenTerotorisasi = (
    judulPanel: string,
    renderer: (data: DataPengaturanTerotorisasi) => ReactNode,
  ) => {
    if (!sesi.terautentikasi || !tokenBearer) {
      return panelButuhLogin(judulPanel);
    }
    if (sedangMemuat && !dataPengaturan) {
      return <KondisiMemuat pesan="Memuat pengaturan..." />;
    }
    if (galatMuat && !dataPengaturan) {
      return (
        <KondisiGagal
          judul="Gagal memuat pengaturan"
          pesan={galatMuat}
          onCobaLagi={() => void muatPengaturan()}
        />
      );
    }
    if (!dataPengaturan) {
      return panelButuhLogin(judulPanel);
    }
    return renderer(dataPengaturan);
  };

  const daftarTab: ItemTab[] = [
    {
      id: 'sesi',
      label: 'Masuk & Sesi',
      konten: <SectionSesiAuth onSesiBerubah={() => void muatPengaturan()} />,
    },
    {
      id: 'event-anggaran',
      label: 'Acara & Batas Biaya',
      konten: renderKontenTerotorisasi(
        'Pengaturan Acara & Batas Biaya',
        (data) => (
          <SectionEventAnggaran
            sesi={sesi}
            tokenBearer={tokenBearer}
            dataPengaturan={data}
            onDataDiperbarui={(dataBaru) => setDataPengaturan(dataBaru)}
          />
        ),
      ),
    },
    {
      id: 'tim-rbac',
      label: 'Tim & Hak Akses',
      konten: renderKontenTerotorisasi(
        'Daftar Tim & Pembagian Hak Akses',
        (data) => (
          <SectionTimRbac
            sesi={sesi}
            tokenBearer={tokenBearer}
            dataPengaturan={data}
            onMuatUlang={muatPengaturan}
          />
        ),
      ),
    },
    {
      id: 'integrasi-backup',
      label: 'Drive & Cadangan Data',
      konten: renderKontenTerotorisasi(
        'Koneksi Google Drive & Cadangan Data',
        (data) => (
          <SectionIntegrasiBackup
            sesi={sesi}
            tokenBearer={tokenBearer}
            dataPengaturan={data}
            onDataDiperbarui={(dataBaru) => setDataPengaturan(dataBaru)}
          />
        ),
      ),
    },
    {
      id: 'audit',
      label: 'Riwayat Aktivitas',
      konten: !sesi.terautentikasi
        ? panelButuhLogin('Riwayat Aktivitas')
        : <SectionAuditLog sesi={sesi} tokenBearer={tokenBearer} />,
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
        labelNavigasi="Tab modul pengaturan dan kontrol akses"
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain print:overflow-visible">
        <WadahHalaman>
          <HeaderHalaman
            judul="Pengaturan"
            labelTahap="Akses, Tim & Acara"
            tujuan="Atur akun masuk, peran tim, identitas acara, batas biaya, dan koneksi Google Drive."
            aksiUtama={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <StatusTeks
                  status={sesi.terautentikasi ? 'approved' : 'not-configured'}
                  labelKustom={
                    sesi.terautentikasi
                      ? `${dapatkanLabelPeran(sesi.peran)}`
                      : 'Belum Masuk'
                  }
                />
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--teks-sekunder)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--aksen-maroon-teks)]" aria-hidden="true" />
                  Kuota Terbatas
                </span>
              </div>
            }
          />

          <div role="tabpanel" className="pb-8">
            {tabAktifObj?.konten}
          </div>
        </WadahHalaman>
      </div>
    </div>
  );
}
