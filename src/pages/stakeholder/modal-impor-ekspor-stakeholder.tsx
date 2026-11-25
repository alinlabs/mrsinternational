import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import {
  HEADER_CSV_STAKEHOLDER,
  PANDUAN_CSV_STAKEHOLDER,
} from '../../data/stakeholder-kanonik';
import {
  eksporStakeholderApi,
  imporCsvStakeholderApi,
} from '../../services/layanan-stakeholder';
import { uraiCsvStakeholder } from '../../utils/stakeholder';
import {
  AreaTeks,
  ModalDialog,
  ModalKonfirmasi,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export interface ModalImporCsvStakeholderProps {
  terbuka: boolean;
  tokenBearer: string | null;
  onTutup: () => void;
  onSelesaiImpor: (jumlah: number) => void;
}

function unduhTeksFile(namaBerkas: string, isi: string): void {
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaBerkas;
  a.click();
  URL.revokeObjectURL(url);
}

export function ModalImporCsvStakeholder({
  terbuka,
  tokenBearer,
  onTutup,
  onSelesaiImpor,
}: ModalImporCsvStakeholderProps) {
  const { tampilkanToast } = gunakanToast();
  const [teksCsv, setTeksCsv] = useState('');
  const [sudahPratinjau, setSudahPratinjau] = useState(false);
  const [sedangImpor, setSedangImpor] = useState(false);
  const [galatServer, setGalatServer] = useState('');

  const hasilPratinjau = useMemo(
    () => (sudahPratinjau ? uraiCsvStakeholder(teksCsv) : null),
    [sudahPratinjau, teksCsv],
  );

  const tanganiPilihBerkas = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isi = await file.text();
    setTeksCsv(isi);
    setSudahPratinjau(true);
    setGalatServer('');
  };

  const jalankanImpor = async () => {
    if (!hasilPratinjau || hasilPratinjau.barisValid.length === 0) return;
    setSedangImpor(true);
    setGalatServer('');

    const daftarPayload = hasilPratinjau.barisValid.map((b) => ({
      namaLengkap: b.namaLengkap,
      jabatanOrganisasi: b.jabatanOrganisasi,
      kategori: b.kategori,
      prioritas: b.prioritas,
      relevansi: b.relevansi,
      relationshipOwner: b.relationshipOwner,
      sumberKontak: b.sumberKontak,
      channelUtama: b.channelUtama,
      contactValue: b.contactValue,
      konteksRelasi: b.konteksRelasi,
      consentToPublish: b.consentToPublish,
      statusPipeline: b.statusPipeline,
      nextAction: b.nextAction,
      dueDate: b.dueDate,
    }));

    const resp = await imporCsvStakeholderApi(tokenBearer, daftarPayload);
    setSedangImpor(false);

    if (!resp.ok || !resp.data) {
      setGalatServer(
        resp.error?.message ?? 'Gagal menyimpan data impor stakeholder.',
      );
      return;
    }

    const jumlah = resp.data.jumlahDiimpor;
    setTeksCsv('');
    setSudahPratinjau(false);
    onSelesaiImpor(jumlah);
    onTutup();
  };

  return (
    <ModalDialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul="Impor Stakeholder via CSV (Validasi & Pratinjau)"
      deskripsi="Setiap baris divalidasi dan dipratinjau terlebih dahulu sebelum disimpan ke server CRM."
      ukuran="lg"
    >
      <div className="space-y-4">
        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-[var(--teks-utama)]">
              Template Kolom CSV Standar (Tanpa Data Fiktif)
            </span>
            <Tombol
              varian="sekunder"
              ukuran="sm"
              ikonKiri={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
              onClick={() => {
                unduhTeksFile(
                  'template-impor-stakeholder-ragi-hotang.csv',
                  PANDUAN_CSV_STAKEHOLDER,
                );
                tampilkanToast({
                  jenis: 'info',
                  judul: 'Template CSV kosong diunduh',
                });
              }}
            >
              Unduh Template CSV
            </Tombol>
          </div>
          <p className="font-mono text-[11px] text-[var(--teks-sekunder)] break-all">
            {HEADER_CSV_STAKEHOLDER}
          </p>
          <p className="text-[11px] text-[var(--teks-redup)]">
            Nilai kategori: <code>commercial</code> | <code>influence</code> |{' '}
            <code>institution</code> | <code>cultural-ecosystem</code> |{' '}
            <code>public-awareness</code>. Prioritas: <code>A</code> | <code>B</code> |{' '}
            <code>C</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] text-xs font-medium text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer">
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Pilih Berkas .csv</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => void tanganiPilihBerkas(e)}
            />
          </label>
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={() => setSudahPratinjau(true)}
            disabled={!teksCsv.trim()}
          >
            Validasi &amp; Pratinjau CSV
          </Tombol>
        </div>

        <AreaTeks
          label="Atau Tempel Isi CSV di Sini"
          rows={5}
          value={teksCsv}
          placeholder={`${HEADER_CSV_STAKEHOLDER}\n...`}
          onChange={(e) => {
            setTeksCsv(e.target.value);
            setSudahPratinjau(false);
            setGalatServer('');
          }}
        />

        {galatServer && (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
          >
            {galatServer}
          </p>
        )}

        {hasilPratinjau && (
          <div className="space-y-3">
            {hasilPratinjau.galatBaris.length > 0 && (
              <div
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] p-3 text-xs text-[var(--status-bahaya)] space-y-1"
              >
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Ditemukan {hasilPratinjau.galatBaris.length} baris tidak valid:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {hasilPratinjau.galatBaris.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasilPratinjau.barisValid.length > 0 && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-sukses)]/35 bg-[var(--status-sukses)]/[0.05] p-3 space-y-2">
                <p className="text-xs font-semibold text-[var(--status-sukses)] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Pratinjau Siap Impor: {hasilPratinjau.barisValid.length} baris valid
                </p>
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--garis-halus)] text-[var(--teks-redup)]">
                        <th className="py-1.5 pr-3">Nama</th>
                        <th className="py-1.5 pr-3">Organisasi</th>
                        <th className="py-1.5 pr-3">Kategori</th>
                        <th className="py-1.5 pr-3">Prioritas</th>
                        <th className="py-1.5 pr-3">Pipeline</th>
                        <th className="py-1.5">PIC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--garis-halus)]">
                      {hasilPratinjau.barisValid.map((baris) => (
                        <tr key={baris.nomorBaris}>
                          <td className="py-1.5 pr-3 font-medium">
                            {baris.namaLengkap}
                          </td>
                          <td className="py-1.5 pr-3">
                            {baris.jabatanOrganisasi}
                          </td>
                          <td className="py-1.5 pr-3">{baris.kategori}</td>
                          <td className="py-1.5 pr-3">{baris.prioritas}</td>
                          <td className="py-1.5 pr-3">{baris.statusPipeline}</td>
                          <td className="py-1.5">{baris.relationshipOwner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
          <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
            Tutup
          </Tombol>
          <Tombol
            varian="primer"
            ukuran="sm"
            memuat={sedangImpor}
            disabled={
              !hasilPratinjau || hasilPratinjau.barisValid.length === 0
            }
            onClick={() => void jalankanImpor()}
          >
            Simpan {hasilPratinjau?.barisValid.length ?? 0} Baris Tervalidasi
          </Tombol>
        </div>
      </div>
    </ModalDialog>
  );
}

export interface KontrolEksporStakeholderProps {
  tokenBearer: string | null;
  aksesKontakPrivat: boolean;
  jumlahData: number;
}

export function KontrolEksporStakeholder({
  tokenBearer,
  aksesKontakPrivat,
  jumlahData,
}: KontrolEksporStakeholderProps) {
  const { tampilkanToast } = gunakanToast();
  const [konfirmasiInternal, setKonfirmasiInternal] = useState(false);

  const jalankanEkspor = async (mode: 'public' | 'internal') => {
    const resp = await eksporStakeholderApi(tokenBearer, mode);
    if (!resp.ok || !resp.data) {
      tampilkanToast({
        jenis: 'galat',
        judul: 'Ekspor gagal',
        pesan: resp.error?.message ?? 'Tidak diizinkan mengekspor.',
      });
      return;
    }

    unduhTeksFile(resp.data.namaBerkas, resp.data.csv);
    tampilkanToast({
      jenis: 'sukses',
      judul:
        mode === 'internal'
          ? 'Ekspor CSV internal diunduh'
          : 'Ekspor CSV publik (tanpa PII) diunduh',
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Tombol
          varian="sekunder"
          ukuran="sm"
          disabled={jumlahData === 0}
          ikonKiri={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
          onClick={() => void jalankanEkspor('public')}
        >
          Ekspor Publik (Tanpa PII)
        </Tombol>

        {aksesKontakPrivat && (
          <Tombol
            varian="sekunder"
            ukuran="sm"
            disabled={jumlahData === 0}
            ikonKiri={<Lock className="h-3.5 w-3.5" aria-hidden="true" />}
            onClick={() => setKonfirmasiInternal(true)}
          >
            Ekspor Internal (Dengan Kontak)
          </Tombol>
        )}
      </div>

      <ModalKonfirmasi
        terbuka={konfirmasiInternal}
        onTutup={() => setKonfirmasiInternal(false)}
        onKonfirmasi={() => {
          setKonfirmasiInternal(false);
          void jalankanEkspor('internal');
        }}
        judul="Konfirmasi Ekspor Kontak Privat (PII)?"
        pesan="Berkas CSV internal memuat nilai kontak pribadi stakeholder (email/WhatsApp) dan catatan tindak lanjut. Pastikan berkas hanya dibagikan kepada tim internal berwenang."
        labelKonfirmasi="Ya, unduh CSV internal"
      />
    </>
  );
}
