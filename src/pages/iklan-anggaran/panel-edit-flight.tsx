import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { KURS_PLANNING_USD_IDR_KANONIK } from '../../data/iklan-kanonik';
import type {
  FlightKampanyeIklan,
  MataUangIklan,
  PlatformIklan,
  StatusFlightIklan,
} from '../../types/iklan';
import { formatEstimasiRupiah } from '../../utils/beranda';
import {
  hitungEstimasiBiayaFlightIdr,
  hitungHariFlight,
  validasiFormFlight,
} from '../../utils/iklan';
import {
  AreaTeks,
  InputTeks,
  PanelSamping,
  SelectPilihan,
  Tombol,
} from '../../components/ui';

export interface PanelEditFlightProps {
  flight: FlightKampanyeIklan | null;
  kursUsdIdr?: number;
  onTutup: () => void;
  onSimpan: (flightBaru: FlightKampanyeIklan) => void;
}

export function PanelEditFlight({
  flight,
  kursUsdIdr = KURS_PLANNING_USD_IDR_KANONIK,
  onTutup,
  onSimpan,
}: PanelEditFlightProps) {
  const [namaCampaign, setNamaCampaign] = useState('');
  const [platform, setPlatform] = useState<PlatformIklan>('meta');
  const [status, setStatus] = useState<StatusFlightIklan>('planned');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [anggaranHarian, setAnggaranHarian] = useState('0');
  const [mataUang, setMataUang] = useState<MataUangIklan>('IDR');
  const [jumlahAdGroup, setJumlahAdGroup] = useState('1');
  const [isOrganikSaja, setIsOrganikSaja] = useState(false);
  const [objective, setObjective] = useState('');
  const [targetAudiens, setTargetAudiens] = useState('');
  const [kreatifTeks, setKreatifTeks] = useState('');
  const [catatanBilling, setCatatanBilling] = useState('');
  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (!flight) return;
    setNamaCampaign(flight.namaCampaign);
    setPlatform(flight.platform);
    setStatus(flight.status);
    setTanggalMulai(flight.tanggalMulai);
    setTanggalSelesai(flight.tanggalSelesai);
    setAnggaranHarian(String(flight.anggaranHarian));
    setMataUang(flight.mataUang);
    setJumlahAdGroup(String(flight.jumlahAdGroup));
    setIsOrganikSaja(Boolean(flight.isOrganikSaja));
    setObjective(flight.objective);
    setTargetAudiens(flight.targetAudiens);
    setKreatifTeks(flight.daftarKreatif.join('\n'));
    setCatatanBilling(flight.catatanBilling);
    setGalat('');
  }, [flight]);

  const angkaHarian = Number(anggaranHarian) || 0;
  const angkaAdGroup = Number(jumlahAdGroup) || 0;
  const hariPratinjau = hitungHariFlight(tanggalMulai, tanggalSelesai);

  const pratinjauFlight: FlightKampanyeIklan | null = flight
    ? {
        ...flight,
        namaCampaign,
        platform,
        status,
        tanggalMulai,
        tanggalSelesai,
        anggaranHarian: isOrganikSaja ? 0 : angkaHarian,
        mataUang,
        jumlahAdGroup: isOrganikSaja ? 0 : angkaAdGroup,
        isOrganikSaja,
        objective,
        targetAudiens,
        daftarKreatif: kreatifTeks
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        catatanBilling,
      }
    : null;

  const estimasiPratinjauIdr = pratinjauFlight
    ? hitungEstimasiBiayaFlightIdr(pratinjauFlight, kursUsdIdr)
    : 0;

  const tanganiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pratinjauFlight) return;

    const cek = validasiFormFlight({
      namaCampaign,
      tanggalMulai,
      tanggalSelesai,
      anggaranHarian: isOrganikSaja ? 0 : angkaHarian,
      jumlahAdGroup: isOrganikSaja ? 1 : angkaAdGroup,
      objective,
      isOrganikSaja,
    });

    if (!cek.valid) {
      setGalat(cek.pesanGalat);
      return;
    }

    onSimpan(pratinjauFlight);
  };

  return (
    <PanelSamping
      terbuka={Boolean(flight)}
      onTutup={onTutup}
      judul={flight ? `Edit Flight: ${flight.kodeFlight}` : 'Edit Flight'}
      subjudul="Perbarui anggaran harian, tanggal tayang, objektif, audiens, kreatif, status, dan catatan billing."
      footer={
        <div className="w-full flex items-center justify-end gap-2">
          <Tombol varian="sekunder" ukuran="sm" onClick={onTutup}>
            Batal
          </Tombol>
          <Tombol
            type="submit"
            form="form-edit-flight"
            varian="primer"
            ukuran="sm"
          >
            Simpan Perubahan Flight
          </Tombol>
        </div>
      }
    >
      <form
        id="form-edit-flight"
        noValidate
        onSubmit={tanganiSubmit}
        className="space-y-3.5"
      >
        {galat && (
          <p
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
          >
            {galat}
          </p>
        )}

        <InputTeks
          label="Nama Campaign / Flight"
          wajib
          value={namaCampaign}
          onChange={(e) => {
            setNamaCampaign(e.target.value);
            if (galat) setGalat('');
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectPilihan
            label="Platform"
            value={platform}
            opsi={[
              { nilai: 'meta', label: 'Meta Ads (IG / FB)' },
              { nilai: 'tiktok', label: 'TikTok Ads' },
            ]}
            onChange={(e) => {
              const p = e.target.value as PlatformIklan;
              setPlatform(p);
              if (p === 'meta') setMataUang('IDR');
            }}
          />

          <SelectPilihan
            label="Status Flight"
            value={status}
            opsi={[
              { nilai: 'planned', label: 'Planned (Rencana)' },
              { nilai: 'approved', label: 'Approved (Disetujui)' },
              { nilai: 'active', label: 'Active (Sedang Tayang)' },
              { nilai: 'paused', label: 'Paused (Dijeda)' },
              { nilai: 'completed', label: 'Completed (Selesai)' },
            ]}
            onChange={(e) => setStatus(e.target.value as StatusFlightIklan)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputTeks
            label="Tanggal Mulai"
            type="date"
            wajib
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
          />

          <InputTeks
            label="Tanggal Selesai"
            type="date"
            wajib
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-[var(--teks-utama)] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={isOrganikSaja}
            onChange={(e) => setIsOrganikSaja(e.target.checked)}
            className="h-4 w-4 accent-[var(--aksen-maroon)]"
          />
          <span>Jalur organik saja (tanpa belanja iklan berbayar / Rp0)</span>
        </label>

        {!isOrganikSaja && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputTeks
              label="Spend Harian / Ad Group"
              type="number"
              min="0"
              step={mataUang === 'USD' ? '1' : '50000'}
              value={anggaranHarian}
              onChange={(e) => setAnggaranHarian(e.target.value)}
            />

            <SelectPilihan
              label="Mata Uang"
              value={mataUang}
              opsi={[
                { nilai: 'IDR', label: 'IDR (Rupiah)' },
                { nilai: 'USD', label: 'USD (Kurs Rp17.000)' },
              ]}
              onChange={(e) => setMataUang(e.target.value as MataUangIklan)}
            />

            <InputTeks
              label="Jumlah Ad Group / Set"
              type="number"
              min="1"
              step="1"
              value={jumlahAdGroup}
              onChange={(e) => setJumlahAdGroup(e.target.value)}
            />
          </div>
        )}

        <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3 py-2.5 flex items-center justify-between text-xs">
          <span className="text-[var(--teks-sekunder)]">
            Pratinjau Estimasi ({hariPratinjau} hari)
          </span>
          <strong className="font-semibold text-[var(--aksen-maroon-teks)] angka-tabular">
            {isOrganikSaja
              ? 'Rp0 (Organik)'
              : formatEstimasiRupiah(estimasiPratinjauIdr, mataUang === 'USD')}
          </strong>
        </div>

        <InputTeks
          label="Objective Kampanye"
          wajib
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        />

        <AreaTeks
          label="Target Audiens & Geografi (Hipotesis Awal)"
          rows={2}
          value={targetAudiens}
          onChange={(e) => setTargetAudiens(e.target.value)}
        />

        <AreaTeks
          label="Daftar Kreatif (1 baris per kreatif)"
          rows={3}
          value={kreatifTeks}
          onChange={(e) => setKreatifTeks(e.target.value)}
        />

        <AreaTeks
          label="Catatan Billing & Threshold Platform"
          rows={2}
          value={catatanBilling}
          onChange={(e) => setCatatanBilling(e.target.value)}
        />
      </form>
    </PanelSamping>
  );
}
