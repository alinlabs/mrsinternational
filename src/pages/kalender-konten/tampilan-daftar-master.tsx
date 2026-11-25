import type { KonsepKonten } from '../../types/kalender';
import {
  dapatkanInfoStatusKonten,
  dapatkanLabelPilar,
  dapatkanLabelSlot,
} from '../../utils/kalender';
import { StatusTeks, TabelData, Tombol } from '../../components/ui';
import type { KolomTabel } from '../../components/ui';

export interface TampilanDaftarMasterProps {
  daftarKonten: KonsepKonten[];
  filterAktif: boolean;
  onPilihKonten: (konten: KonsepKonten) => void;
}

export function TampilanDaftarMaster({
  daftarKonten,
  filterAktif,
  onPilihKonten,
}: TampilanDaftarMasterProps) {
  const kolom: KolomTabel<KonsepKonten>[] = [
    {
      kunci: 'tanggal',
      judul: 'Tanggal & Slot',
      lebar: '14%',
      render: (baris) => (
        <div>
          <p className="font-semibold text-[var(--teks-utama)] angka-tabular">
            {baris.labelTanggal} 2026
          </p>
          <p className="mt-0.5 text-xs font-medium text-[var(--aksen-maroon-teks)]">
            {dapatkanLabelSlot(baris.slot)}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--teks-redup)]">{baris.fase}</p>
        </div>
      ),
    },
    {
      kunci: 'konsep',
      judul: 'Judul Konten & Pembuka',
      lebar: '28%',
      render: (baris) => (
        <div>
          <button
            type="button"
            onClick={() => onPilihKonten(baris)}
            className="text-left font-medium text-[var(--teks-utama)] hover:text-[var(--aksen-maroon-teks)] underline-offset-2 hover:underline cursor-pointer"
          >
            {baris.judul}
          </button>
          <p className="mt-1 text-xs text-[var(--teks-sekunder)]">
            <span className="font-medium">Pembuka:</span> {baris.hook}
          </p>
          {baris.catatan && (
            <p className="mt-1 text-[11px] text-[var(--teks-redup)]">
              Catatan: {baris.catatan}
            </p>
          )}
        </div>
      ),
    },
    {
      kunci: 'pilar',
      judul: 'Pilar & Tujuan',
      lebar: '14%',
      render: (baris) => (
        <div>
          <p className="text-xs font-semibold text-[var(--teks-utama)]">
            {dapatkanLabelPilar(baris.pilar)}
          </p>
          <p className="mt-1 text-xs text-[var(--teks-redup)]">
            Tujuan: {baris.tujuan}
          </p>
        </div>
      ),
    },
    {
      kunci: 'distribusi',
      judul: 'Distribusi Kanal & Waktu',
      lebar: '20%',
      render: (baris) => (
        <ul className="space-y-1 text-xs text-[var(--teks-sekunder)]">
          {baris.distribusiKanal.map((dist) => (
            <li key={dist.kanal} className="flex items-center justify-between gap-2">
              <span className="font-medium text-[var(--teks-utama)]">{dist.format}</span>
              <span className="text-[11px] text-[var(--teks-redup)] angka-tabular">
                {dist.waktuUsulan}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      kunci: 'status',
      judul: 'Status & Penanggung Jawab',
      lebar: '14%',
      render: (baris) => {
        const info = dapatkanInfoStatusKonten(baris.status);
        return (
          <div className="space-y-1">
            <StatusTeks labelKustom={info.label} nadaKustom={info.nada} />
            <p className="text-xs text-[var(--teks-sekunder)]">{baris.pic}</p>
            {baris.urlTerbit && (
              <p className="text-[11px] text-[var(--status-sukses)] truncate max-w-[160px]">
                URL terisi
              </p>
            )}
          </div>
        );
      },
    },
    {
      kunci: 'aksi',
      judul: 'Ajakan & Kelola',
      lebar: '10%',
      perataan: 'kanan',
      render: (baris) => (
        <div className="flex flex-col items-end gap-2">
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={() => onPilihKonten(baris)}
            aria-label={`Edit ${baris.labelTanggal} ${baris.slot}`}
          >
            Kelola
          </Tombol>
          <p className="text-[11px] text-[var(--teks-redup)] text-right max-w-[150px]">
            {baris.cta}
          </p>
        </div>
      ),
    },
  ];

  return (
    <TabelData
      keteranganTabel="Daftar master konten 22 hari tanpa duplikasi mirror IG dan FB"
      kolom={kolom}
      data={daftarKonten}
      kunciBaris={(baris) => baris.id}
      headerLengket
      filterAktif={filterAktif}
      judulTanpaHasilFilter="Tidak ada master konten yang cocok"
      pesanTanpaHasilFilter="Ubah kata kunci pencarian atau reset filter untuk melihat kembali seluruh 66 master konten."
    />
  );
}
