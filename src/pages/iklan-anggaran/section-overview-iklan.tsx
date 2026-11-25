import { AlertTriangle, CheckCircle2, Info, Layers, ShieldAlert } from 'lucide-react';
import {
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  THRESHOLD_ADS_MANAGER_KANONIK,
} from '../../data/iklan-kanonik';
import type {
  IdSkenarioAnggaran,
  RingkasanPengendalianAnggaran,
  StateIklanAnggaran,
} from '../../types/iklan';
import { formatEstimasiRupiah } from '../../utils/beranda';
import { formatRupiah, formatTanggalWib } from '../../utils/format';
import {
  dapatkanDetailSkenario,
  dapatkanInfoStatusFlight,
  hitungEstimasiBiayaFlightIdr,
  hitungHariFlight,
} from '../../utils/iklan';
import { Kartu, StatusTeks, Tombol } from '../../components/ui';

export interface SectionOverviewIklanProps {
  stateIklan: StateIklanAnggaran;
  ringkasan: RingkasanPengendalianAnggaran;
  onUbahSkenario: (skenario: IdSkenarioAnggaran) => void;
  onBukaTab: (tab: string) => void;
}

export function SectionOverviewIklan({
  stateIklan,
  ringkasan,
  onUbahSkenario,
  onBukaTab,
}: SectionOverviewIklanProps) {
  const detailSkenario = dapatkanDetailSkenario(stateIklan.skenarioAktif);
  const persetujuan = stateIklan.persetujuanAktif;

  return (
    <div className="space-y-5">
      {ringkasan.melebihiPlafon && ringkasan.plafonDisetujuiIdr !== null && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--status-bahaya)]/45 bg-[var(--status-bahaya)]/[0.06] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="h-5 w-5 text-[var(--status-bahaya)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-[var(--status-bahaya)]">
                Peringatan Batas Biaya: Estimasi Melebihi Plafon Owner
              </p>
              <p className="mt-1 text-xs text-[var(--teks-utama)] leading-relaxed">
                Estimasi paket aktif ({formatEstimasiRupiah(ringkasan.estimasiGrandTotalIdr, ringkasan.estimasiPerkiraan)})
                melebihi plafon disetujui ({formatRupiah(ringkasan.plafonDisetujuiIdr)}) sebesar{' '}
                <strong className="angka-tabular">
                  {formatRupiah(Math.abs(ringkasan.selisihTerhadapPlafonIdr ?? 0))}
                </strong>.
              </p>
            </div>
          </div>
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={() => onBukaTab('actual-approvals')}
          >
            Tinjau Plafon
          </Tombol>
        </div>
      )}

      {/* 4 Kartu Pemisahan Estimasi vs Disetujui vs Aktual vs Varians */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-between gap-2"
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium text-[var(--teks-redup)]">
              Estimasi Total ({detailSkenario.nama})
            </p>
            <StatusTeks status="estimated" />
          </div>
          <p className="text-xl font-semibold text-[var(--teks-utama)] angka-tabular">
            {formatEstimasiRupiah(
              ringkasan.estimasiGrandTotalIdr,
              ringkasan.estimasiPerkiraan,
            )}
          </p>
          <p className="text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
            Produksi {formatRupiah(ringkasan.estimasiProduksiIdr)} • Setup &amp; Media{' '}
            {formatEstimasiRupiah(
              ringkasan.estimasiMediaIdr,
              ringkasan.estimasiPerkiraan,
            )}
          </p>
        </div>

        <div
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-between gap-2"
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium text-[var(--teks-redup)]">
              Plafon Anggaran Disetujui
            </p>
            <StatusTeks
              status={persetujuan ? 'approved' : 'not-configured'}
              labelKustom={persetujuan ? 'Disetujui' : 'Menunggu Owner'}
            />
          </div>
          <p className="text-xl font-semibold text-[var(--teks-utama)] angka-tabular">
            {persetujuan
              ? formatRupiah(persetujuan.plafonDisetujuiIdr)
              : 'Belum disetujui'}
          </p>
          <p className="text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
            {persetujuan
              ? `Oleh ${persetujuan.disetujuiOleh} (${formatTanggalWib(persetujuan.disetujuiPada)})`
              : 'Persetujuan plafon diperlukan sebelum aktivasi top-up Ads Manager.'}
          </p>
        </div>

        <div
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-between gap-2"
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium text-[var(--teks-redup)]">
              Belanja Aktual Tercatat
            </p>
            <StatusTeks
              status={ringkasan.totalAktualIdr !== null ? 'actual' : 'not-configured'}
              labelKustom={
                ringkasan.totalAktualIdr !== null ? 'Aktual' : 'Belum ada data'
              }
            />
          </div>
          <p className="text-xl font-semibold text-[var(--teks-utama)] angka-tabular">
            {ringkasan.totalAktualIdr !== null
              ? formatRupiah(ringkasan.totalAktualIdr)
              : 'Belum ada data aktual'}
          </p>
          <p className="text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
            {stateIklan.daftarBelanjaAktual.length > 0
              ? `${stateIklan.daftarBelanjaAktual.length} catatan belanja tersimpan`
              : 'Diisi manual atau lewat CSV saat iklan berjalan.'}
          </p>
        </div>

        <div
          style={{ backgroundImage: 'var(--gradasi-kartu-lembut)' }}
          className="rounded-[var(--radius-md)] border border-[var(--aksen-maroon-garis)]/25 p-4 text-center shadow-[var(--bayangan-halus)] flex flex-col items-center justify-between gap-2"
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium text-[var(--teks-redup)]">
              Selisih Biaya (Aktual vs Rencana)
            </p>
            <StatusTeks
              status={
                ringkasan.variansTerhadapEstimasiIdr !== null
                  ? 'actual'
                  : 'not-configured'
              }
              labelKustom={
                ringkasan.variansTerhadapEstimasiIdr !== null
                  ? 'Terhitung'
                  : 'Menunggu Aktual'
              }
            />
          </div>
          <p className="text-xl font-semibold text-[var(--teks-utama)] angka-tabular">
            {ringkasan.variansTerhadapEstimasiIdr !== null
              ? `${ringkasan.variansTerhadapEstimasiIdr > 0 ? '+' : ''}${formatRupiah(ringkasan.variansTerhadapEstimasiIdr)}`
              : 'Belum ada data aktual'}
          </p>
          <p className="text-[11px] text-[var(--teks-sekunder)] leading-relaxed">
            {ringkasan.persentaseVarians !== null
              ? `Selisih ${ringkasan.persentaseVarians > 0 ? '+' : ''}${ringkasan.persentaseVarians}% dari estimasi rencana.`
              : 'Dihitung otomatis setelah catatan belanja aktual masuk.'}
          </p>
        </div>
      </div>

      {/* Pemilih Skenario Aktif */}
      <Kartu
        judul="Paket Biaya Aktif"
        subjudul="Pilih paket untuk memperbarui estimasi biaya dan jadwal iklan."
        aksiHeader={
          <Tombol
            varian="sekunder"
            ukuran="sm"
            onClick={() => onBukaTab('budget-scenarios')}
          >
            Lihat Rincian Komponen
          </Tombol>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DETAIL_SKENARIO_ANGGARAN_KANONIK.map((skenario) => {
            const aktif = stateIklan.skenarioAktif === skenario.id;
            return (
              <button
                key={skenario.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => onUbahSkenario(skenario.id)}
                className={`rounded-[var(--radius-sm)] border p-4 text-left transition-colors cursor-pointer ${
                  aktif
                    ? 'border-[var(--aksen-maroon-garis)]/60 bg-[var(--aksen-maroon-lembut)]/80'
                    : 'border-[var(--garis-halus)] bg-[var(--bg-permukaan)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--teks-utama)]">
                    {skenario.nama}
                  </span>
                  {aktif ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--aksen-maroon-teks)]">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Aktif
                    </span>
                  ) : skenario.rekomendasi ? (
                    <span className="text-[11px] font-medium text-[var(--aksen-emas)]">
                      Rekomendasi
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-lg font-semibold text-[var(--teks-utama)] angka-tabular">
                  {formatEstimasiRupiah(
                    skenario.grandTotalIdr,
                    skenario.grandTotalPerkiraan,
                  )}
                </p>
                <p className="mt-1 text-[11px] text-[var(--teks-redup)] angka-tabular">
                  Produksi {formatRupiah(skenario.totalProduksiIdr)} • Setup{' '}
                  {formatRupiah(skenario.adsSetupIdr)} • Meta{' '}
                  {formatRupiah(skenario.metaIdr)} • TikTok{' '}
                  {skenario.tiktokIdr === 0
                    ? 'Rp0 (Organik)'
                    : formatEstimasiRupiah(skenario.tiktokIdr, skenario.tiktokPerkiraan)}
                </p>
                <p className="mt-2 text-xs text-[var(--teks-sekunder)] leading-relaxed">
                  {skenario.ringkasanMedia}
                </p>
              </button>
            );
          })}
        </div>
      </Kartu>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <Kartu
            judul="Ringkasan Jadwal Iklan Aktif"
            subjudul="Atur biaya harian dan tanggal tayang pada tab Jadwal Iklan."
            aksiHeader={
              <Tombol
                varian="sekunder"
                ukuran="sm"
                onClick={() => onBukaTab('flight-schedule')}
              >
                Kelola Jadwal Iklan
              </Tombol>
            }
          >
            <div className="divide-y divide-[var(--garis-halus)]">
              {stateIklan.daftarFlight.map((flight) => {
                const hari = hitungHariFlight(
                  flight.tanggalMulai,
                  flight.tanggalSelesai,
                );
                const estimasiIdr = hitungEstimasiBiayaFlightIdr(
                  flight,
                  stateIklan.kursPlanningUsdIdr,
                );
                const infoStatus = dapatkanInfoStatusFlight(flight.status);
                return (
                  <div
                    key={flight.id}
                    className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold text-[var(--aksen-maroon-teks)]">
                          {flight.kodeFlight}
                        </span>
                        <p className="text-sm font-medium text-[var(--teks-utama)]">
                          {flight.namaCampaign}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--teks-redup)]">
                        {formatTanggalWib(flight.tanggalMulai)} –{' '}
                        {formatTanggalWib(flight.tanggalSelesai)} ({hari} hari) •{' '}
                        {flight.isOrganikSaja
                          ? 'Organik 2 video/hari'
                          : flight.mataUang === 'USD'
                            ? `${flight.jumlahAdGroup} ad group × USD ${flight.anggaranHarian}/hari`
                            : flight.jumlahAdGroup > 1
                              ? `${formatRupiah(flight.anggaranHarian * flight.jumlahAdGroup)}/hari (${flight.jumlahAdGroup} ad group × ${formatRupiah(flight.anggaranHarian)})`
                              : `${formatRupiah(flight.anggaranHarian)}/hari`}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-1 shrink-0">
                      <span className="text-sm font-semibold text-[var(--teks-utama)] angka-tabular">
                        {flight.isOrganikSaja
                          ? 'Rp0 (Organik)'
                          : formatEstimasiRupiah(
                              estimasiIdr,
                              flight.mataUang === 'USD',
                            )}
                      </span>
                      <StatusTeks
                        labelKustom={infoStatus.label}
                        nadaKustom={infoStatus.nada}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Kartu>
        </div>

        <div className="xl:col-span-5">
          <Kartu
            judul="Anggaran Harian & Aturan Platform"
            subjudul="Panduan sebelum pengisian saldo iklan di Meta dan TikTok"
            aksiHeader={
              <Layers className="h-4 w-4 text-[var(--aksen-emas)]" aria-hidden="true" />
            }
          >
            <div className="space-y-3 text-xs text-[var(--teks-sekunder)] leading-relaxed">
              <div className="rounded-[var(--radius-sm)] border border-[var(--aksen-emas)]/35 bg-[var(--aksen-emas)]/[0.06] p-3 flex items-start gap-2">
                <AlertTriangle
                  className="h-4 w-4 text-[var(--aksen-emas)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-[var(--teks-utama)]">
                    Anggaran Harian &amp; Batas Minimum TikTok
                  </p>
                  <p className="mt-0.5">
                    Anggaran TikTok Ads ditetapkan tetap per hari: <strong>Rp450.000/hari</strong> (1 ad group pada Optimal) atau <strong>Rp800.000/hari</strong> (2 ad groups pada Maksimal).{' '}
                    {THRESHOLD_ADS_MANAGER_KANONIK.tiktokCatatan}
                  </p>
                </div>
              </div>

              <div className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3 flex items-start gap-2">
                <Info
                  className="h-4 w-4 text-[var(--aksen-maroon-teks)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1.5">
                  <p>{THRESHOLD_ADS_MANAGER_KANONIK.metaCatatan}</p>
                  <p>
                    <strong className="text-[var(--teks-utama)]">Wilayah Awal:</strong>{' '}
                    {THRESHOLD_ADS_MANAGER_KANONIK.geografiHipotesis}
                  </p>
                  <p>
                    <strong className="text-[var(--teks-utama)]">Aturan Ajakan:</strong>{' '}
                    {THRESHOLD_ADS_MANAGER_KANONIK.kebijakanCta}
                  </p>
                  <p className="text-[11px] text-[var(--teks-redup)]">
                    Catatan belanja iklan diisi manual atau melalui impor CSV.
                  </p>
                </div>
              </div>
            </div>
          </Kartu>
        </div>
      </div>
    </div>
  );
}
