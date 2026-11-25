import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { HEADER_CSV_KPI_TEMPLATE } from '../../data/kpi-kanonik';
import type {
  PemetaanKolomCsvKpi,
  SnapshotKpiAktual,
} from '../../types/kpi';
import {
  dapatkanLabelPlatformKpi,
  ekstrakHeaderCsv,
  formatNilaiMetrik,
  dapatkanDefinisiMetrik,
  validasiDanPratinjauCsvKpi,
} from '../../utils/kpi';
import {
  AreaTeks,
  ModalDialog,
  SelectPilihan,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export interface ModalWizardCsvKpiProps {
  terbuka: boolean;
  snapshotExisting: SnapshotKpiAktual[];
  onTutup: () => void;
  onImporSelesai: (daftarBaru: SnapshotKpiAktual[]) => void;
}

function unduhTemplateCsv(namaFile: string, isi: string): void {
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  a.click();
  URL.revokeObjectURL(url);
}

const PEMETAAN_KOSONG: PemetaanKolomCsvKpi = {
  metrik: '',
  platform: '',
  periode: '',
  nilai: '',
  source: '',
  reportedAt: '',
  kampanyeAtauKonten: '',
  pilar: '',
  pic: '',
  notes: '',
};

export function ModalWizardCsvKpi({
  terbuka,
  snapshotExisting,
  onTutup,
  onImporSelesai,
}: ModalWizardCsvKpiProps) {
  const { tampilkanToast } = gunakanToast();
  const [langkah, setLangkah] = useState<1 | 2 | 3>(1);
  const [teksCsv, setTeksCsv] = useState('');
  const [pemetaan, setPemetaan] = useState<PemetaanKolomCsvKpi>(PEMETAAN_KOSONG);
  const [lewatiDuplikat, setLewatiDuplikat] = useState(true);
  const [galatLangkah, setGalatLangkah] = useState('');

  const hasilEkstrak = useMemo(() => ekstrakHeaderCsv(teksCsv), [teksCsv]);

  const hasilPratinjau = useMemo(() => {
    if (langkah !== 3) return null;
    return validasiDanPratinjauCsvKpi({
      teksCsv,
      pemetaan,
      snapshotExisting,
      defaultPic: 'Digital Manager',
    });
  }, [langkah, teksCsv, pemetaan, snapshotExisting]);

  const resetDanTutup = () => {
    setLangkah(1);
    setTeksCsv('');
    setPemetaan(PEMETAAN_KOSONG);
    setGalatLangkah('');
    onTutup();
  };

  const tanganiUploadBerkas = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isi = await file.text();
    setTeksCsv(isi);
    setGalatLangkah('');
  };

  const lanjutKePemetaan = () => {
    if (hasilEkstrak.header.length === 0 || hasilEkstrak.barisData.length === 0) {
      setGalatLangkah(
        'Tempel atau unggah berkas CSV yang memiliki baris header dan minimal 1 baris data.',
      );
      return;
    }
    setGalatLangkah('');
    setPemetaan(hasilEkstrak.pemetaanOtomatis);
    setLangkah(2);
  };

  const lanjutKePratinjau = () => {
    if (
      !pemetaan.metrik ||
      !pemetaan.platform ||
      !pemetaan.periode ||
      !pemetaan.nilai ||
      !pemetaan.source
    ) {
      setGalatLangkah(
        'Petakan seluruh kolom wajib terlebih dahulu: Metrik, Platform, Periode, Nilai, dan Sumber.',
      );
      return;
    }
    setGalatLangkah('');
    setLangkah(3);
  };

  const barisSiapSimpan = useMemo(() => {
    if (!hasilPratinjau) return [];
    return lewatiDuplikat
      ? hasilPratinjau.barisValid.filter((b) => b.duplikatDengan === null)
      : hasilPratinjau.barisValid;
  }, [hasilPratinjau, lewatiDuplikat]);

  const konfirmasiSimpan = () => {
    if (barisSiapSimpan.length === 0) return;
    const sekarangIso = new Date().toISOString();
    const daftarBaru: SnapshotKpiAktual[] = barisSiapSimpan.map((b, idx) => ({
      id: `kpi-csv-${Date.now()}-${idx}`,
      grup: b.grup,
      kodeMetrik: b.kodeMetrik,
      platform: b.platform,
      periode: b.periode,
      kampanyeAtauKonten: b.kampanyeAtauKonten || 'Impor CSV',
      pilar: b.pilar,
      nilai: b.nilai,
      source: b.source,
      reportedAt: b.reportedAt,
      importedAt: sekarangIso,
      pic: b.pic,
      notes: b.notes,
    }));

    onImporSelesai(daftarBaru);
    tampilkanToast({
      jenis: 'sukses',
      judul: `${daftarBaru.length} snapshot KPI diimpor`,
      pesan: 'Data aktual berhasil divalidasi dan ditambahkan ke monitoring.',
    });
    resetDanTutup();
  };

  const opsiHeaderCsv = [
    { nilai: '', label: '— Tidak dipetakan —' },
    ...hasilEkstrak.header.map((h) => ({ nilai: h, label: h })),
  ];

  return (
    <ModalDialog
      terbuka={terbuka}
      onTutup={resetDanTutup}
      judul="Wizard Impor CSV KPI Aktual"
      deskripsi={`Langkah ${langkah} dari 3: ${
        langkah === 1
          ? 'Unggah atau tempel CSV'
          : langkah === 2
            ? 'Pemetaan kolom CSV ke metrik kanonik'
            : 'Validasi, deteksi duplikat, dan konfirmasi'
      }`}
      ukuran="lg"
    >
      <div className="space-y-4">
        {/* Indikator 3 langkah */}
        <ol className="grid grid-cols-3 gap-2 text-xs">
          {[
            { no: 1, label: '1. Unggah / Tempel' },
            { no: 2, label: '2. Pemetaan Kolom' },
            { no: 3, label: '3. Pratinjau & Simpan' },
          ].map((item) => (
            <li
              key={item.no}
              className={`rounded-[var(--radius-sm)] border px-2.5 py-1.5 font-medium ${
                langkah === item.no
                  ? 'border-[var(--aksen-maroon-garis)]/60 bg-[var(--aksen-maroon-lembut)] text-[var(--aksen-maroon-teks)]'
                  : langkah > item.no
                    ? 'border-[var(--status-sukses)]/40 bg-[var(--status-sukses)]/[0.05] text-[var(--status-sukses)]'
                    : 'border-[var(--garis-halus)] text-[var(--teks-redup)]'
              }`}
            >
              {item.label}
            </li>
          ))}
        </ol>

        {galatLangkah && (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
          >
            {galatLangkah}
          </p>
        )}

        {langkah === 1 && (
          <div className="space-y-3">
            <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-[var(--teks-utama)]">
                  Format Kolom Standar (atau gunakan kolom ekspor platform Anda)
                </span>
                <Tombol
                  varian="sekunder"
                  ukuran="sm"
                  ikonKiri={<Download className="h-3.5 w-3.5" aria-hidden="true" />}
                  onClick={() =>
                    unduhTemplateCsv(
                      'template-kpi-ragi-hotang.csv',
                      HEADER_CSV_KPI_TEMPLATE,
                    )
                  }
                >
                  Unduh Template Kosong
                </Tombol>
              </div>
              <p className="font-mono text-[11px] text-[var(--teks-sekunder)] break-all">
                {HEADER_CSV_KPI_TEMPLATE.trim()}
              </p>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-permukaan)] text-xs font-medium text-[var(--teks-utama)] hover:bg-[var(--bg-sekunder)] cursor-pointer">
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Pilih Berkas .csv</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => void tanganiUploadBerkas(e)}
                />
              </label>
            </div>

            <AreaTeks
              label="Isi CSV"
              rows={6}
              value={teksCsv}
              placeholder={`${HEADER_CSV_KPI_TEMPLATE.trim()}\n2026-12-01,meta-ads,unique_reach,12500,Meta Flight 1,heritage,Meta Ads Manager,2026-12-02,DM,Evaluasi 72 jam`}
              onChange={(e) => {
                setTeksCsv(e.target.value);
                if (galatLangkah) setGalatLangkah('');
              }}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
              <Tombol varian="sekunder" ukuran="sm" onClick={resetDanTutup}>
                Batal
              </Tombol>
              <Tombol
                varian="primer"
                ukuran="sm"
                ikonKanan={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={lanjutKePemetaan}
              >
                Lanjut ke Pemetaan Kolom
              </Tombol>
            </div>
          </div>
        )}

        {langkah === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--teks-sekunder)]">
              Ditemukan <strong>{hasilEkstrak.header.length} kolom</strong> dan{' '}
              <strong>{hasilEkstrak.barisData.length} baris</strong>. Cocokkan nama kolom CSV dengan bidang KPI:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectPilihan
                label="Kolom Metrik KPI *"
                value={pemetaan.metrik}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, metrik: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Platform *"
                value={pemetaan.platform}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, platform: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Periode (YYYY-MM-DD) *"
                value={pemetaan.periode}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, periode: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Nilai / Angka *"
                value={pemetaan.nilai}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, nilai: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Sumber Laporan *"
                value={pemetaan.source}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, source: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Tanggal Laporan (Opsional)"
                value={pemetaan.reportedAt}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, reportedAt: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Konten / Campaign (Opsional)"
                value={pemetaan.kampanyeAtauKonten}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({
                    ...p,
                    kampanyeAtauKonten: e.target.value,
                  }))
                }
              />
              <SelectPilihan
                label="Kolom Pilar Konten (Opsional)"
                value={pemetaan.pilar}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, pilar: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom PIC (Opsional)"
                value={pemetaan.pic}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, pic: e.target.value }))
                }
              />
              <SelectPilihan
                label="Kolom Catatan (Opsional)"
                value={pemetaan.notes}
                opsi={opsiHeaderCsv}
                onChange={(e) =>
                  setPemetaan((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t border-[var(--garis-halus)]">
              <Tombol varian="sekunder" ukuran="sm" onClick={() => setLangkah(1)}>
                Kembali
              </Tombol>
              <Tombol
                varian="primer"
                ukuran="sm"
                ikonKanan={<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
                onClick={lanjutKePratinjau}
              >
                Validasi &amp; Pratinjau Data
              </Tombol>
            </div>
          </div>
        )}

        {langkah === 3 && hasilPratinjau && (
          <div className="space-y-3">
            {hasilPratinjau.galatBaris.length > 0 && (
              <div
                role="alert"
                className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] p-3 text-xs text-[var(--status-bahaya)] space-y-1"
              >
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {hasilPratinjau.galatBaris.length} baris gagal validasi (tidak diimpor):
                </p>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {hasilPratinjau.galatBaris.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              </div>
            )}

            {hasilPratinjau.jumlahDuplikat > 0 && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/45 bg-[var(--status-peringatan)]/[0.07] p-3 text-xs text-[var(--status-peringatan)] space-y-2">
                <p className="font-semibold">
                  Deteksi Duplikat: {hasilPratinjau.jumlahDuplikat} baris cocok dengan catatan yang sudah ada atau baris lain di CSV.
                </p>
                <label className="flex items-center gap-2 text-[var(--teks-utama)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lewatiDuplikat}
                    onChange={(e) => setLewatiDuplikat(e.target.checked)}
                    className="h-4 w-4 accent-[var(--aksen-maroon)]"
                  />
                  <span>Lewati baris duplikat secara otomatis (disarankan)</span>
                </label>
              </div>
            )}

            {hasilPratinjau.barisValid.length > 0 && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--status-sukses)]/35 bg-[var(--status-sukses)]/[0.04] p-3 space-y-2">
                <p className="text-xs font-semibold text-[var(--status-sukses)] flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Pratinjau Valid: {hasilPratinjau.barisValid.length} baris lolos format ({barisSiapSimpan.length} akan disimpan)
                </p>
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--garis-halus)] text-[var(--teks-redup)]">
                        <th className="py-1.5 pr-3">Periode</th>
                        <th className="py-1.5 pr-3">Platform</th>
                        <th className="py-1.5 pr-3">Metrik</th>
                        <th className="py-1.5 pr-3 text-right">Nilai</th>
                        <th className="py-1.5 pr-3">Sumber</th>
                        <th className="py-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--garis-halus)]">
                      {hasilPratinjau.barisValid.map((baris) => {
                        const def = dapatkanDefinisiMetrik(baris.kodeMetrik);
                        return (
                          <tr key={baris.nomorBaris}>
                            <td className="py-1.5 pr-3 angka-tabular">
                              {baris.periode}
                            </td>
                            <td className="py-1.5 pr-3">
                              {dapatkanLabelPlatformKpi(baris.platform)}
                            </td>
                            <td className="py-1.5 pr-3">{baris.namaMetrik}</td>
                            <td className="py-1.5 pr-3 text-right angka-tabular font-medium">
                              {def
                                ? formatNilaiMetrik(baris.nilai, def.satuan)
                                : baris.nilai}
                            </td>
                            <td className="py-1.5 pr-3">{baris.source}</td>
                            <td className="py-1.5">
                              {baris.duplikatDengan ? (
                                <span className="text-[11px] font-medium text-[var(--status-peringatan)]">
                                  Duplikat ({baris.duplikatDengan === 'existing' ? 'sudah ada' : 'di CSV'})
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-[var(--status-sukses)]">
                                  Siap simpan
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2 border-t border-[var(--garis-halus)]">
              <Tombol varian="sekunder" ukuran="sm" onClick={() => setLangkah(2)}>
                Ubah Pemetaan
              </Tombol>
              <Tombol
                varian="primer"
                ukuran="sm"
                disabled={barisSiapSimpan.length === 0}
                onClick={konfirmasiSimpan}
              >
                Konfirmasi &amp; Simpan {barisSiapSimpan.length} Baris Aktual
              </Tombol>
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
