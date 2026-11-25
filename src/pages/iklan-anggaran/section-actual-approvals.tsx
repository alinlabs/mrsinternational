import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { DETAIL_SKENARIO_ANGGARAN_KANONIK } from '../../data/iklan-kanonik';
import type {
  EntriBelanjaAktual,
  IdSkenarioAnggaran,
  PersetujuanAnggaran,
  RingkasanPengendalianAnggaran,
  StateIklanAnggaran,
} from '../../types/iklan';
import { formatEstimasiRupiah } from '../../utils/beranda';
import { formatRupiah, formatTanggalWib } from '../../utils/format';
import {
  dapatkanDetailSkenario,
  uraiCsvBelanjaAktual,
  validasiBelanjaAktual,
  validasiPersetujuanAnggaran,
} from '../../utils/iklan';
import {
  AreaTeks,
  InputTeks,
  Kartu,
  ModalDialog,
  SelectPilihan,
  StatusTeks,
  Tombol,
} from '../../components/ui';

export interface SectionActualApprovalsProps {
  stateIklan: StateIklanAnggaran;
  ringkasan: RingkasanPengendalianAnggaran;
  onSimpanPersetujuan: (persetujuan: PersetujuanAnggaran) => void;
  onTambahAktual: (entri: EntriBelanjaAktual | EntriBelanjaAktual[]) => void;
  onHapusAktual: (idEntri: string) => void;
}

const LABEL_POS_AKTUAL: Record<EntriBelanjaAktual['kategoriPos'], string> = {
  'meta-ads': 'Meta Ads',
  'tiktok-ads': 'TikTok Ads',
  produksi: 'Produksi Konten',
};

export function SectionActualApprovals({
  stateIklan,
  ringkasan,
  onSimpanPersetujuan,
  onTambahAktual,
  onHapusAktual,
}: SectionActualApprovalsProps) {
  // Form Persetujuan Plafon Owner
  const detailAktif = dapatkanDetailSkenario(stateIklan.skenarioAktif);
  const [skenarioApproval, setSkenarioApproval] = useState<IdSkenarioAnggaran>(
    stateIklan.skenarioAktif,
  );
  const [disetujuiOleh, setDisetujuiOleh] = useState('Melfarina Sianipar');
  const [peranApprover, setPeranApprover] = useState('Owner');
  const [plafonInput, setPlafonInput] = useState(
    String(detailAktif.grandTotalIdr),
  );
  const [catatanApproval, setCatatanApproval] = useState('');
  const [galatApproval, setGalatApproval] = useState('');

  // Form Input Actual Spend Manual
  const [tanggalLaporan, setTanggalLaporan] = useState('');
  const [kategoriPos, setKategoriPos] =
    useState<EntriBelanjaAktual['kategoriPos']>('meta-ads');
  const [sumberLaporan, setSumberLaporan] = useState('');
  const [nominalAktualInput, setNominalAktualInput] = useState('');
  const [catatanAktual, setCatatanAktual] = useState('');
  const [galatAktual, setGalatAktual] = useState('');

  // Modal Import CSV
  const [modalCsvTerbuka, setModalCsvTerbuka] = useState(false);
  const [teksCsv, setTeksCsv] = useState('');
  const [galatCsv, setGalatCsv] = useState('');

  const tanganiSubmitApproval = (e: FormEvent) => {
    e.preventDefault();
    const plafonAngka = Number(plafonInput);
    const cek = validasiPersetujuanAnggaran({
      disetujuiOleh,
      plafonDisetujuiIdr: plafonAngka,
    });
    if (!cek.valid) {
      setGalatApproval(cek.pesanGalat);
      return;
    }
    setGalatApproval('');
    onSimpanPersetujuan({
      id: `apr-${Date.now()}`,
      skenarioDisetujui: skenarioApproval,
      disetujuiOleh: disetujuiOleh.trim(),
      peranApprover: peranApprover.trim() || 'Owner',
      plafonDisetujuiIdr: Math.round(plafonAngka),
      disetujuiPada: new Date().toISOString(),
      catatan: catatanApproval.trim(),
    });
    setCatatanApproval('');
  };

  const tanganiSubmitAktual = (e: FormEvent) => {
    e.preventDefault();
    const nominalAngka = Number(nominalAktualInput);
    const cek = validasiBelanjaAktual({
      tanggalLaporan,
      sumberLaporan,
      nominalAktualIdr: nominalAngka,
    });
    if (!cek.valid) {
      setGalatAktual(cek.pesanGalat);
      return;
    }
    setGalatAktual('');
    onTambahAktual({
      id: `act-${Date.now()}`,
      tanggalLaporan,
      kategoriPos,
      sumberLaporan: sumberLaporan.trim(),
      nominalAktualIdr: Math.round(nominalAngka),
      catatan: catatanAktual.trim(),
      dicatatOleh: 'Digital Manager',
      dicatatPada: new Date().toISOString(),
    });
    setNominalAktualInput('');
    setCatatanAktual('');
  };

  const tanganiImportCsv = (e: FormEvent) => {
    e.preventDefault();
    const hasil = uraiCsvBelanjaAktual(teksCsv, 'Digital Manager');
    if (hasil.galat) {
      setGalatCsv(hasil.galat);
      return;
    }
    setGalatCsv('');
    onTambahAktual(hasil.entri);
    setTeksCsv('');
    setModalCsvTerbuka(false);
  };

  return (
    <div className="space-y-5">
      {/* Guardrail Plafon vs Proyeksi vs Aktual */}
      <Kartu
        judul="Batas Biaya & Perbandingan Rencana vs Aktual"
        subjudul="Memisahkan estimasi rencana, plafon disetujui Owner, dan belanja aktual."
        aksiHeader={
          <StatusTeks
            status={ringkasan.melebihiPlafon ? 'sample' : ringkasan.plafonDisetujuiIdr ? 'approved' : 'not-configured'}
            labelKustom={
              ringkasan.melebihiPlafon
                ? 'Melebihi Batas'
                : ringkasan.plafonDisetujuiIdr
                  ? 'Sesuai Batas'
                  : 'Belum Ada Batas'
            }
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5">
            <p className="text-[var(--teks-redup)]">1. Estimasi Rencana Aktif</p>
            <p className="mt-1 text-lg font-semibold text-[var(--teks-utama)] angka-tabular">
              {formatEstimasiRupiah(
                ringkasan.estimasiGrandTotalIdr,
                ringkasan.estimasiPerkiraan,
              )}
            </p>
            <p className="mt-1 text-[11px] text-[var(--teks-sekunder)]">
              Produksi {formatRupiah(ringkasan.estimasiProduksiIdr)} + Media{' '}
              {formatEstimasiRupiah(ringkasan.estimasiMediaIdr, ringkasan.estimasiPerkiraan)}
            </p>
          </div>

          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5">
            <p className="text-[var(--teks-redup)]">2. Plafon Disetujui Owner</p>
            <p className="mt-1 text-lg font-semibold text-[var(--teks-utama)] angka-tabular">
              {ringkasan.plafonDisetujuiIdr !== null
                ? formatRupiah(ringkasan.plafonDisetujuiIdr)
                : 'Belum disetujui'}
            </p>
            <p className="mt-1 text-[11px] text-[var(--teks-sekunder)]">
              {stateIklan.persetujuanAktif
                ? `${stateIklan.persetujuanAktif.disetujuiOleh} • ${formatTanggalWib(stateIklan.persetujuanAktif.disetujuiPada)}`
                : 'Catat persetujuan Owner lewat form di bawah.'}
            </p>
          </div>

          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5">
            <p className="text-[var(--teks-redup)]">3. Belanja Aktual &amp; Selisih</p>
            <p className="mt-1 text-lg font-semibold text-[var(--teks-utama)] angka-tabular">
              {ringkasan.totalAktualIdr !== null
                ? formatRupiah(ringkasan.totalAktualIdr)
                : 'Belum ada data aktual'}
            </p>
            <p className="mt-1 text-[11px] text-[var(--teks-sekunder)]">
              {ringkasan.variansTerhadapEstimasiIdr !== null
                ? `Selisih dr rencana: ${ringkasan.variansTerhadapEstimasiIdr > 0 ? '+' : ''}${formatRupiah(ringkasan.variansTerhadapEstimasiIdr)} (${ringkasan.persentaseVarians}%)`
                : 'Selisih dihitung setelah catatan belanja masuk.'}
            </p>
          </div>
        </div>

        {ringkasan.melebihiPlafon && ringkasan.plafonDisetujuiIdr !== null && (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/45 bg-[var(--status-bahaya)]/[0.06] px-3.5 py-2.5 text-xs text-[var(--status-bahaya)] flex items-start gap-2"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Peringatan Batas Biaya:</strong> Estimasi ({formatEstimasiRupiah(ringkasan.estimasiGrandTotalIdr, ringkasan.estimasiPerkiraan)}) atau realisasi melebihi plafon disetujui ({formatRupiah(ringkasan.plafonDisetujuiIdr)}).
            </span>
          </div>
        )}
      </Kartu>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Form Persetujuan Anggaran Owner */}
        <div className="xl:col-span-5">
          <Kartu
            judul="Persetujuan Plafon Owner"
            subjudul="Catat batas biaya resmi dan siapa yang menyetujui."
          >
            <form onSubmit={tanganiSubmitApproval} noValidate className="space-y-3">
              {galatApproval && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
                >
                  {galatApproval}
                </p>
              )}

              <SelectPilihan
                label="Skenario yang Disetujui"
                value={skenarioApproval}
                opsi={DETAIL_SKENARIO_ANGGARAN_KANONIK.map((s) => ({
                  nilai: s.id,
                  label: `${s.nama} (${formatEstimasiRupiah(s.grandTotalIdr, s.grandTotalPerkiraan)})`,
                }))}
                onChange={(e) => {
                  const id = e.target.value as IdSkenarioAnggaran;
                  setSkenarioApproval(id);
                  const d = dapatkanDetailSkenario(id);
                  setPlafonInput(String(d.grandTotalIdr));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputTeks
                  label="Nama Penyetuju"
                  wajib
                  value={disetujuiOleh}
                  onChange={(e) => {
                    setDisetujuiOleh(e.target.value);
                    if (galatApproval) setGalatApproval('');
                  }}
                />
                <InputTeks
                  label="Jabatan / Peran"
                  value={peranApprover}
                  onChange={(e) => setPeranApprover(e.target.value)}
                />
              </div>

              <InputTeks
                label="Plafon Maksimum Disetujui (IDR)"
                type="number"
                min="0"
                step="50000"
                wajib
                value={plafonInput}
                onChange={(e) => {
                  setPlafonInput(e.target.value);
                  if (galatApproval) setGalatApproval('');
                }}
              />

              <AreaTeks
                label="Catatan Persetujuan / Syarat Pencairan"
                rows={2}
                value={catatanApproval}
                placeholder="Mis. Setujui Hemat dulu; evaluasi 72 jam sebelum lepas Flight 2."
                onChange={(e) => setCatatanApproval(e.target.value)}
              />

              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                className="w-full"
                ikonKiri={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Catat Persetujuan Plafon
              </Tombol>
            </form>

            {stateIklan.riwayatPersetujuan.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--garis-halus)]">
                <p className="text-xs font-semibold text-[var(--teks-utama)] mb-2">
                  Riwayat Persetujuan ({stateIklan.riwayatPersetujuan.length})
                </p>
                <ul className="space-y-2 text-xs">
                  {stateIklan.riwayatPersetujuan.slice(0, 4).map((item) => (
                    <li
                      key={item.id}
                      className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-[var(--teks-utama)] angka-tabular">
                          {formatRupiah(item.plafonDisetujuiIdr)}
                        </strong>
                        <span className="text-[11px] text-[var(--teks-redup)]">
                          {formatTanggalWib(item.disetujuiPada)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--teks-sekunder)] mt-0.5">
                        {item.disetujuiOleh} ({item.peranApprover}) • Skenario{' '}
                        {item.skenarioDisetujui}
                      </p>
                      {item.catatan && (
                        <p className="text-[11px] text-[var(--teks-redup)] mt-0.5">
                          “{item.catatan}”
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Kartu>
        </div>

        {/* Form & Tabel Snapshot Belanja Aktual */}
        <div className="xl:col-span-7 space-y-5">
          <Kartu
            judul="Catat Belanja Aktual"
            subjudul="Isi sesuai nota atau tagihan iklan beserta sumber bukti."
            aksiHeader={
              <Tombol
                varian="sekunder"
                ukuran="sm"
                ikonKiri={
                  <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                }
                onClick={() => setModalCsvTerbuka(true)}
              >
                Impor CSV
              </Tombol>
            }
          >
            <form onSubmit={tanganiSubmitAktual} noValidate className="space-y-3">
              {galatAktual && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
                >
                  {galatAktual}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputTeks
                  label="Tanggal Laporan"
                  type="date"
                  wajib
                  value={tanggalLaporan}
                  onChange={(e) => {
                    setTanggalLaporan(e.target.value);
                    if (galatAktual) setGalatAktual('');
                  }}
                />

                <SelectPilihan
                  label="Pos Belanja"
                  value={kategoriPos}
                  opsi={[
                    { nilai: 'meta-ads', label: 'Meta Ads' },
                    { nilai: 'tiktok-ads', label: 'TikTok Ads' },
                    { nilai: 'produksi', label: 'Produksi Konten' },
                  ]}
                  onChange={(e) =>
                    setKategoriPos(
                      e.target.value as EntriBelanjaAktual['kategoriPos'],
                    )
                  }
                />

                <InputTeks
                  label="Nominal Aktual (IDR)"
                  type="number"
                  min="0"
                  step="10000"
                  wajib
                  value={nominalAktualInput}
                  placeholder="Mis. 900000"
                  onChange={(e) => {
                    setNominalAktualInput(e.target.value);
                    if (galatAktual) setGalatAktual('');
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputTeks
                  label="Sumber Laporan / Bukti"
                  wajib
                  value={sumberLaporan}
                  placeholder="Mis. Meta Ads Manager Billing / Kuitansi #04"
                  onChange={(e) => {
                    setSumberLaporan(e.target.value);
                    if (galatAktual) setGalatAktual('');
                  }}
                />

                <InputTeks
                  label="Catatan Ringkas (Opsional)"
                  value={catatanAktual}
                  placeholder="Mis. Realisasi hari ke-1 s.d. ke-3"
                  onChange={(e) => setCatatanAktual(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Tombol
                  type="submit"
                  varian="primer"
                  ukuran="sm"
                  ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Simpan Belanja Aktual
                </Tombol>
              </div>
            </form>
          </Kartu>

          <Kartu
            judul="Daftar Belanja Aktual"
            subjudul="Riwayat pengeluaran iklan dan produksi yang sudah tercatat."
          >
            {stateIklan.daftarBelanjaAktual.length === 0 ? (
              <p className="text-xs text-[var(--teks-redup)] py-4 text-center">
                Belum ada catatan belanja aktual.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-2.5">
                    <p className="text-[var(--teks-redup)]">Meta Ads Aktual</p>
                    <p className="mt-0.5 font-semibold text-[var(--teks-utama)] angka-tabular">
                      {formatRupiah(ringkasan.aktualMetaIdr)}
                    </p>
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      Rencana: {formatRupiah(ringkasan.estimasiMetaIdr)}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-2.5">
                    <p className="text-[var(--teks-redup)]">TikTok Ads Aktual</p>
                    <p className="mt-0.5 font-semibold text-[var(--teks-utama)] angka-tabular">
                      {formatRupiah(ringkasan.aktualTiktokIdr)}
                    </p>
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      Rencana: {formatEstimasiRupiah(ringkasan.estimasiTiktokIdr, ringkasan.estimasiPerkiraan)}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] p-2.5">
                    <p className="text-[var(--teks-redup)]">Produksi Aktual</p>
                    <p className="mt-0.5 font-semibold text-[var(--teks-utama)] angka-tabular">
                      {formatRupiah(ringkasan.aktualProduksiIdr)}
                    </p>
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      Rencana: {formatRupiah(ringkasan.estimasiProduksiIdr)}
                    </p>
                  </div>
                </div>

                <ul className="divide-y divide-[var(--garis-halus)]">
                  {stateIklan.daftarBelanjaAktual.map((entri) => (
                    <li
                      key={entri.id}
                      className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--teks-utama)]">
                          {LABEL_POS_AKTUAL[entri.kategoriPos]} •{' '}
                          <span className="angka-tabular">
                            {formatTanggalWib(entri.tanggalLaporan)}
                          </span>
                        </p>
                        <p className="text-[11px] text-[var(--teks-sekunder)]">
                          Sumber: {entri.sumberLaporan}
                          {entri.catatan ? ` — ${entri.catatan}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                          {formatRupiah(entri.nominalAktualIdr)}
                        </span>
                        <Tombol
                          varian="halus"
                          ukuran="sm"
                          aria-label={`Hapus entri ${entri.sumberLaporan}`}
                          onClick={() => onHapusAktual(entri.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Tombol>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Kartu>
        </div>
      </div>

      <ModalDialog
        terbuka={modalCsvTerbuka}
        onTutup={() => setModalCsvTerbuka(false)}
        judul="Impor Belanja Aktual (CSV)"
        deskripsi="Tempel data CSV dari laporan Meta Ads, TikTok Ads, atau kas produksi."
      >
        <form onSubmit={tanganiImportCsv} noValidate className="space-y-3">
          {galatCsv && (
            <p
              role="alert"
              className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
            >
              {galatCsv}
            </p>
          )}
          <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-2.5 text-[11px] font-mono text-[var(--teks-sekunder)]">
            tanggal,kategori,nominal_idr,sumber,catatan
            <br />
            2026-12-01,meta-ads,900000,Meta Ads Manager CSV,Flight 1 Hari 1-3
          </div>
          <AreaTeks
            label="Data CSV"
            rows={5}
            value={teksCsv}
            placeholder="Tempel baris CSV di sini..."
            onChange={(e) => {
              setTeksCsv(e.target.value);
              if (galatCsv) setGalatCsv('');
            }}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--garis-halus)]">
            <Tombol
              varian="sekunder"
              ukuran="sm"
              onClick={() => setModalCsvTerbuka(false)}
            >
              Batal
            </Tombol>
            <Tombol type="submit" varian="primer" ukuran="sm">
              Validasi &amp; Impor CSV
            </Tombol>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
