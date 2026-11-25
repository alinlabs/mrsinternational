import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Calculator, Save } from 'lucide-react';
import { RITME_MONITORING_KANONIK } from '../../data/kpi-kanonik';
import type { Baseline72Jam, InquiryKualifikasi } from '../../types/kpi';
import { formatAngka, formatRupiah, formatTanggalWib } from '../../utils/format';
import {
  hitungProyeksiDenganRumus,
  validasiBaseline72Jam,
} from '../../utils/kpi';
import {
  AreaTeks,
  InputTeks,
  Kartu,
  SelectPilihan,
  StatusTeks,
  Tombol,
} from '../../components/ui';

export interface SectionBaselineKalkulatorProps {
  baseline: Baseline72Jam | null;
  daftarInquiry: InquiryKualifikasi[];
  onSimpanBaseline: (baseline: Baseline72Jam) => void;
}

export function SectionBaselineKalkulator({
  baseline,
  daftarInquiry,
  onSimpanBaseline,
}: SectionBaselineKalkulatorProps) {
  // Form Baseline 72 jam
  const [medianReach, setMedianReach] = useState('');
  const [avgWatchTime, setAvgWatchTime] = useState('');
  const [visitsPer1000, setVisitsPer1000] = useState('');
  const [saveShareRate, setSaveShareRate] = useState('');
  const [cpmAktual, setCpmAktual] = useState('');
  const [costPerThruPlay, setCostPerThruPlay] = useState('');
  const [sourceBaseline, setSourceBaseline] = useState('');
  const [reportedAtBaseline, setReportedAtBaseline] = useState('');
  const [dicatatOleh, setDicatatOleh] = useState('Digital Manager');
  const [catatanBaseline, setCatatanBaseline] = useState('');
  const [galatBaseline, setGalatBaseline] = useState('');

  useEffect(() => {
    if (!baseline) {
      setMedianReach('');
      setAvgWatchTime('');
      setVisitsPer1000('');
      setSaveShareRate('');
      setCpmAktual('');
      setCostPerThruPlay('');
      setSourceBaseline('');
      setReportedAtBaseline('');
      setCatatanBaseline('');
      return;
    }
    setMedianReach(
      baseline.medianReachOrganikPerPost !== null
        ? String(baseline.medianReachOrganikPerPost)
        : '',
    );
    setAvgWatchTime(
      baseline.averageWatchTimeDetik !== null
        ? String(baseline.averageWatchTimeDetik)
        : '',
    );
    setVisitsPer1000(
      baseline.profileVisitsPer1000Reach !== null
        ? String(baseline.profileVisitsPer1000Reach)
        : '',
    );
    setSaveShareRate(
      baseline.saveShareRatePersen !== null
        ? String(baseline.saveShareRatePersen)
        : '',
    );
    setCpmAktual(
      baseline.cpmAktualIdr !== null ? String(baseline.cpmAktualIdr) : '',
    );
    setCostPerThruPlay(
      baseline.costPerThruPlayIdr !== null
        ? String(baseline.costPerThruPlayIdr)
        : '',
    );
    setSourceBaseline(baseline.source);
    setReportedAtBaseline(baseline.reportedAt);
    setDicatatOleh(baseline.dicatatOleh);
    setCatatanBaseline(baseline.catatan);
  }, [baseline]);

  // Kalkulator Formula
  const [anggaranKalkulator, setAnggaranKalkulator] = useState('1400000');
  const [pakaiSimulasiAsumsi, setPakaiSimulasiAsumsi] = useState(false);
  const [cpmSimulasi, setCpmSimulasi] = useState('');
  const [rasioSimulasi, setRasioSimulasi] = useState('');

  const cpmUntukRumus = pakaiSimulasiAsumsi
    ? cpmSimulasi.trim()
      ? Number(cpmSimulasi)
      : null
    : (baseline?.cpmAktualIdr ?? null);

  const rasioUntukRumus = pakaiSimulasiAsumsi
    ? rasioSimulasi.trim()
      ? Number(rasioSimulasi)
      : null
    : (baseline?.profileVisitsPer1000Reach ?? null);

  const jumlahQualifiedAktual = daftarInquiry.filter(
    (i) => i.terkualifikasi,
  ).length;

  const hasilKalkulator = hitungProyeksiDenganRumus({
    anggaranIdr: Number(anggaranKalkulator),
    cpmAktualIdr: cpmUntukRumus,
    rasioProfileVisitPer1000: rasioUntukRumus,
    qualifiedInquiryAktual: jumlahQualifiedAktual,
  });

  const parseOpsional = (val: string): number | null => {
    const t = val.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const tanganiSimpanBaseline = (e: FormEvent) => {
    e.preventDefault();
    const kandidat: Baseline72Jam = {
      medianReachOrganikPerPost: parseOpsional(medianReach),
      averageWatchTimeDetik: parseOpsional(avgWatchTime),
      profileVisitsPer1000Reach: parseOpsional(visitsPer1000),
      saveShareRatePersen: parseOpsional(saveShareRate),
      cpmAktualIdr: parseOpsional(cpmAktual),
      costPerThruPlayIdr: parseOpsional(costPerThruPlay),
      source: sourceBaseline.trim(),
      reportedAt: reportedAtBaseline.trim(),
      dicatatOleh: dicatatOleh.trim(),
      diperbaruiPada: new Date().toISOString(),
      catatan: catatanBaseline.trim(),
    };

    const cek = validasiBaseline72Jam(kandidat);
    if (!cek.valid) {
      setGalatBaseline(cek.pesanGalat);
      return;
    }

    setGalatBaseline('');
    onSimpanBaseline(kandidat);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Pengumpulan Baseline 72 Jam Pertama */}
        <div className="xl:col-span-7">
          <Kartu
            judul="Catatan 72 Jam Pertama (Organik & Iklan Awal)"
            subjudul="Catat hasil nyata 72 jam pertama sebagai dasar hitungan perkiraan."
            aksiHeader={
              <StatusTeks
                status={baseline ? 'actual' : 'not-configured'}
                labelKustom={
                  baseline
                    ? `Tercatat (${formatTanggalWib(baseline.reportedAt)})`
                    : 'Belum diisi'
                }
              />
            }
          >
            <form
              onSubmit={tanganiSimpanBaseline}
              noValidate
              className="space-y-3"
            >
              {galatBaseline && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
                >
                  {galatBaseline}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InputTeks
                  label="Median Reach Organik / Post"
                  type="number"
                  min="0"
                  value={medianReach}
                  placeholder="Belum diukur"
                  onChange={(e) => setMedianReach(e.target.value)}
                />
                <InputTeks
                  label="Avg Watch Time (detik)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={avgWatchTime}
                  placeholder="Belum diukur"
                  onChange={(e) => setAvgWatchTime(e.target.value)}
                />
                <InputTeks
                  label="Profile Visits / 1.000 Reach"
                  type="number"
                  min="0"
                  step="0.1"
                  value={visitsPer1000}
                  placeholder="Belum diukur"
                  onChange={(e) => setVisitsPer1000(e.target.value)}
                />
                <InputTeks
                  label="Save / Share Rate (%)"
                  type="number"
                  min="0"
                  step="0.1"
                  value={saveShareRate}
                  placeholder="Belum diukur"
                  onChange={(e) => setSaveShareRate(e.target.value)}
                />
                <InputTeks
                  label="CPM Aktual 72 Jam (IDR)"
                  type="number"
                  min="0"
                  step="100"
                  value={cpmAktual}
                  placeholder="Belum diukur"
                  onChange={(e) => setCpmAktual(e.target.value)}
                />
                <InputTeks
                  label="Cost per ThruPlay (IDR)"
                  type="number"
                  min="0"
                  step="10"
                  value={costPerThruPlay}
                  placeholder="Belum diukur"
                  onChange={(e) => setCostPerThruPlay(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputTeks
                  label="Sumber Baseline"
                  wajib
                  value={sourceBaseline}
                  placeholder="Mis. IG Insights + Meta Ads"
                  onChange={(e) => {
                    setSourceBaseline(e.target.value);
                    if (galatBaseline) setGalatBaseline('');
                  }}
                />
                <InputTeks
                  label="Tanggal Laporan"
                  type="date"
                  wajib
                  value={reportedAtBaseline}
                  onChange={(e) => {
                    setReportedAtBaseline(e.target.value);
                    if (galatBaseline) setGalatBaseline('');
                  }}
                />
                <InputTeks
                  label="PIC Pencatat"
                  wajib
                  value={dicatatOleh}
                  onChange={(e) => setDicatatOleh(e.target.value)}
                />
              </div>

              <AreaTeks
                label="Catatan Observasi 72 Jam"
                rows={2}
                value={catatanBaseline}
                placeholder="Mis. Diambil dari 6 post organik awal 26–28 Nov dan hari 1–3 Meta Flight 1."
                onChange={(e) => setCatatanBaseline(e.target.value)}
              />

              <div className="flex justify-end">
                <Tombol
                  type="submit"
                  varian="primer"
                  ukuran="sm"
                  ikonKiri={<Save className="h-3.5 w-3.5" aria-hidden="true" />}
                >
                  Simpan Catatan 72 Jam
                </Tombol>
              </div>
            </form>
          </Kartu>
        </div>

        {/* Kalkulator Perkiraan Hasil */}
        <div className="xl:col-span-5">
          <Kartu
            judul="Kalkulator Perkiraan Hasil"
            subjudul="Menghitung perkiraan jangkauan dan kunjungan profil dari anggaran iklan."
            aksiHeader={
              <StatusTeks
                status="estimated"
                labelKustom="Perkiraan / Simulasi"
              />
            }
          >
            <div className="space-y-3 text-xs">
              <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-emas)]/45 bg-[var(--aksen-emas)]/[0.06] p-3 space-y-1">
                <p className="font-semibold text-[var(--teks-utama)] flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-[var(--aksen-emas)]" aria-hidden="true" />
                  Rumus Perkiraan (Bukan Data Aktual)
                </p>
                <p className="text-[11px] text-[var(--teks-sekunder)] font-mono">
                  (a) Jangkauan = Anggaran ÷ Biaya per 1.000 Tayangan × 1.000
                </p>
                <p className="text-[11px] text-[var(--teks-sekunder)] font-mono">
                  (b) Kunjungan Profil = Jangkauan × (Kunjungan per 1.000 ÷ 1.000)
                </p>
                <p className="text-[11px] text-[var(--teks-sekunder)] font-mono">
                  (c) Peluang Sah = Jumlah pesan peluang sah yang tercatat
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectPilihan
                  label="Preset Anggaran Media"
                  value={anggaranKalkulator}
                  opsi={[
                    { nilai: '1400000', label: 'Hemat — Meta Rp1.400.000' },
                    { nilai: '4900000', label: 'Menengah — Meta Rp4.900.000' },
                    { nilai: '8050000', label: 'Menengah — Total Media Rp8.050.000' },
                    { nilai: '7000000', label: 'Agresif — Meta Rp7.000.000' },
                    { nilai: '12600000', label: 'Agresif — Total Media Rp12.600.000' },
                  ]}
                  onChange={(e) => setAnggaranKalkulator(e.target.value)}
                />

                <InputTeks
                  label="Anggaran Simulasi (IDR)"
                  type="number"
                  min="0"
                  step="100000"
                  value={anggaranKalkulator}
                  onChange={(e) => setAnggaranKalkulator(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[var(--teks-utama)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={pakaiSimulasiAsumsi}
                  onChange={(e) => setPakaiSimulasiAsumsi(e.target.checked)}
                  className="h-4 w-4 accent-[var(--aksen-maroon)]"
                />
                <span>
                  Uji dengan angka asumsi simulasi manual (jika baseline belum tercatat)
                </span>
              </label>

              {pakaiSimulasiAsumsi && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputTeks
                    label="Asumsi CPM (IDR)"
                    type="number"
                    min="1"
                    value={cpmSimulasi}
                    placeholder="Mis. 25000"
                    onChange={(e) => setCpmSimulasi(e.target.value)}
                  />
                  <InputTeks
                    label="Asumsi Visits / 1.000 Reach"
                    type="number"
                    min="0"
                    step="0.1"
                    value={rasioSimulasi}
                    placeholder="Mis. 18"
                    onChange={(e) => setRasioSimulasi(e.target.value)}
                  />
                </div>
              )}

              {hasilKalkulator.catatanValidasi ? (
                <p className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3 py-2.5 text-xs text-[var(--teks-sekunder)]">
                  {hasilKalkulator.catatanValidasi}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-2.5">
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      Estimasi Reach (Proyeksi)
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
                      {formatAngka(hasilKalkulator.reachEstimasi)}
                    </p>
                    <p className="text-[10px] text-[var(--teks-redup)]">
                      Basis CPM: {formatRupiah(cpmUntukRumus)}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-2.5">
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      Target Profile Visits (Proyeksi)
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--teks-utama)] angka-tabular">
                      {hasilKalkulator.targetProfileVisits !== null
                        ? formatAngka(hasilKalkulator.targetProfileVisits)
                        : 'Isi rasio baseline'}
                    </p>
                    <p className="text-[10px] text-[var(--teks-redup)]">
                      Rasio: {rasioUntukRumus ?? '—'} / 1.000 reach
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-2.5">
                    <p className="text-[11px] text-[var(--teks-redup)]">
                      Qualified Inquiry (Aktual)
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--teks-utama)] angka-tabular">
                      {formatAngka(hasilKalkulator.targetQualifiedInquiries)}
                    </p>
                    <p className="text-[10px] text-[var(--teks-redup)]">
                      Dari log terverifikasi
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-[var(--teks-redup)]">
                Catatan: Angka ini adalah <strong>perkiraan</strong> berdasarkan{' '}
                {pakaiSimulasiAsumsi ? 'simulasi manual' : 'catatan 72 jam'}, bukan hasil akhir.
              </p>
            </div>
          </Kartu>
        </div>
      </div>

      {/* Jadwal Evaluasi Rutin */}
      <Kartu
        judul="Jadwal Evaluasi Rutin"
        subjudul="Panduan kapan memeriksa hasil dan langkah perbaikannya."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--garis-halus)] text-[var(--teks-redup)]">
                <th className="py-2 pr-4 w-36">Kapan</th>
                <th className="py-2 pr-4">Pemeriksaan</th>
                <th className="py-2">Keputusan / Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--garis-halus)]">
              {RITME_MONITORING_KANONIK.map((r) => (
                <tr key={r.kapan}>
                  <td className="py-2.5 pr-4 font-semibold text-[var(--aksen-maroon-teks)] align-top">
                    {r.kapan}
                  </td>
                  <td className="py-2.5 pr-4 text-[var(--teks-utama)] align-top">
                    {r.pemeriksaan}
                  </td>
                  <td className="py-2.5 text-[var(--teks-sekunder)] align-top">
                    {r.keputusan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>
    </div>
  );
}
