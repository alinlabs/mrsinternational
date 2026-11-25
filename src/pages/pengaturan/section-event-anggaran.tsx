import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Lock, Save, ShieldAlert } from 'lucide-react';
import { DETAIL_SKENARIO_ANGGARAN_KANONIK } from '../../data/iklan-kanonik';
import {
  perbaruiPengaturanEventApi,
  perbaruiPlafonAnggaranApi,
} from '../../services/layanan-pengaturan';
import { repositoriIklanLokal } from '../../services/repositori-iklan';
import type { IdSkenarioAnggaran } from '../../types/iklan';
import type {
  DataPengaturanTerotorisasi,
  HandleSosialPengaturan,
} from '../../types/pengaturan';
import type { SesiPengguna } from '../../types/status';
import { formatEstimasiRupiah } from '../../utils/beranda';
import { formatRupiah, formatTanggalWib } from '../../utils/format';
import {
  AreaTeks,
  InputTeks,
  Kartu,
  SelectPilihan,
  StatusTeks,
  Tombol,
  gunakanToast,
} from '../../components/ui';

export interface SectionEventAnggaranProps {
  sesi: SesiPengguna;
  tokenBearer: string | null;
  dataPengaturan: DataPengaturanTerotorisasi;
  onDataDiperbarui: (dataBaru: DataPengaturanTerotorisasi) => void;
}

export function SectionEventAnggaran({
  sesi,
  tokenBearer,
  dataPengaturan,
  onDataDiperbarui,
}: SectionEventAnggaranProps) {
  const { tampilkanToast } = gunakanToast();

  const bolehUbahEvent =
    sesi.peran === 'owner' ||
    sesi.peran === 'admin' ||
    sesi.peran === 'digital-manager';
  const bolehApproveAnggaran =
    sesi.peran === 'owner' || sesi.peran === 'admin';

  // Form Event & Lokasi
  const [namaEvent, setNamaEvent] = useState(dataPengaturan.event.namaEvent);
  const [kotaWilayahPublik, setKotaWilayahPublik] = useState(
    dataPengaturan.event.kotaWilayahPublik,
  );
  const [lokasiPrivat, setLokasiPrivat] = useState(
    dataPengaturan.event.lokasiPrivat,
  );

  // Form Handle Sosial
  const [daftarHandle, setDaftarHandle] = useState<HandleSosialPengaturan[]>(
    dataPengaturan.handleSosial,
  );

  // Form Kontak Resmi
  const [emailPress, setEmailPress] = useState(
    dataPengaturan.kontakResmi.emailPress,
  );
  const [whatsappKemitraan, setWhatsappKemitraan] = useState(
    dataPengaturan.kontakResmi.whatsappKemitraan,
  );
  const [emailBisnis, setEmailBisnis] = useState(
    dataPengaturan.kontakResmi.emailBisnis,
  );
  const [konfirmasiKontak, setKonfirmasiKontak] = useState<
    'belum-diisi' | 'terkonfirmasi-owner'
  >(dataPengaturan.kontakResmi.statusKonfirmasi);

  const [sedangSimpanEvent, setSedangSimpanEvent] = useState(false);
  const [galatEvent, setGalatEvent] = useState('');

  // Form Plafon Anggaran
  const [skenarioTarget, setSkenarioTarget] = useState<IdSkenarioAnggaran>(
    dataPengaturan.anggaran.skenarioTarget,
  );
  const [plafonInput, setPlafonInput] = useState(
    dataPengaturan.anggaran.plafonDisetujuiIdr !== null
      ? String(dataPengaturan.anggaran.plafonDisetujuiIdr)
      : '',
  );
  const [catatanPersetujuan, setCatatanPersetujuan] = useState(
    dataPengaturan.anggaran.catatanPersetujuan,
  );
  const [sedangSimpanAnggaran, setSedangSimpanAnggaran] = useState(false);
  const [galatAnggaran, setGalatAnggaran] = useState('');

  useEffect(() => {
    setNamaEvent(dataPengaturan.event.namaEvent);
    setKotaWilayahPublik(dataPengaturan.event.kotaWilayahPublik);
    setLokasiPrivat(dataPengaturan.event.lokasiPrivat);
    setDaftarHandle(dataPengaturan.handleSosial);
    setEmailPress(dataPengaturan.kontakResmi.emailPress);
    setWhatsappKemitraan(dataPengaturan.kontakResmi.whatsappKemitraan);
    setEmailBisnis(dataPengaturan.kontakResmi.emailBisnis);
    setKonfirmasiKontak(dataPengaturan.kontakResmi.statusKonfirmasi);
    setSkenarioTarget(dataPengaturan.anggaran.skenarioTarget);
    setPlafonInput(
      dataPengaturan.anggaran.plafonDisetujuiIdr !== null
        ? String(dataPengaturan.anggaran.plafonDisetujuiIdr)
        : '',
    );
    setCatatanPersetujuan(dataPengaturan.anggaran.catatanPersetujuan);
  }, [dataPengaturan]);

  const tanganiSimpanEvent = async (e: FormEvent) => {
    e.preventDefault();
    setGalatEvent('');
    setSedangSimpanEvent(true);

    const resp = await perbaruiPengaturanEventApi(tokenBearer, {
      namaEvent,
      kotaWilayahPublik,
      lokasiPrivat,
      handleSosial: daftarHandle,
      kontakResmi: {
        emailPress,
        whatsappKemitraan,
        emailBisnis,
        statusKonfirmasi: konfirmasiKontak,
      },
    });

    setSedangSimpanEvent(false);
    if (!resp.ok || !resp.data) {
      setGalatEvent(resp.error?.message ?? 'Gagal menyimpan pengaturan event.');
      return;
    }

    onDataDiperbarui(resp.data);
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Pengaturan event & kanal disimpan',
      pesan: 'Perubahan metadata event dan handle kanal telah dicatat pada audit log.',
    });
  };

  const tanganiSimpanAnggaran = async (e: FormEvent) => {
    e.preventDefault();
    setGalatAnggaran('');

    const plafonAngka =
      plafonInput.trim() === '' ? null : Number(plafonInput.trim());
    if (
      plafonAngka !== null &&
      (!Number.isFinite(plafonAngka) || plafonAngka < 0)
    ) {
      setGalatAnggaran('Nominal plafon harus berupa angka rupiah yang valid.');
      return;
    }

    setSedangSimpanAnggaran(true);
    const resp = await perbaruiPlafonAnggaranApi(tokenBearer, {
      skenarioTarget,
      plafonDisetujuiIdr: plafonAngka,
      catatanPersetujuan,
    });
    setSedangSimpanAnggaran(false);

    if (!resp.ok || !resp.data) {
      setGalatAnggaran(
        resp.error?.message ?? 'Gagal menyimpan persetujuan plafon anggaran.',
      );
      return;
    }

    // Sinkronkan persetujuan aktif ke modul Iklan, Beranda, & Laporan jika plafon ditetapkan
    if (resp.data.anggaran.plafonDisetujuiIdr !== null) {
      repositoriIklanLokal.simpanPersetujuan({
        id: `apr-settings-${Date.now()}`,
        skenarioDisetujui: resp.data.anggaran.skenarioTarget,
        disetujuiOleh: resp.data.anggaran.disetujuiOleh || sesi.namaTampilan,
        peranApprover: sesi.peran === 'owner' ? 'Owner' : 'Admin Sistem',
        plafonDisetujuiIdr: resp.data.anggaran.plafonDisetujuiIdr,
        disetujuiPada: new Date().toISOString(),
        catatan:
          resp.data.anggaran.catatanPersetujuan ||
          'Disetujui melalui menu Pengaturan.',
      });
    }

    onDataDiperbarui(resp.data);
    tampilkanToast({
      jenis: 'sukses',
      judul: 'Plafon anggaran diperbarui',
      pesan:
        resp.data.anggaran.plafonDisetujuiIdr !== null
          ? `Plafon resmi disetujui sebesar ${formatRupiah(resp.data.anggaran.plafonDisetujuiIdr)}.`
          : 'Status plafon dikembalikan menjadi belum diisi.',
    });
  };

  const updateHandleItem = (
    id: string,
    perubahan: Partial<HandleSosialPengaturan>,
  ) => {
    setDaftarHandle((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...perubahan } : item)),
    );
  };

  return (
    <div className="space-y-5">
      <form onSubmit={tanganiSimpanEvent} noValidate className="space-y-5">
        {/* Pengaturan Event */}
        <Kartu
          judul="Info Acara & Privasi Lokasi"
          subjudul="Tanggal acara (18 Des 2026) dan penyampaian kampanye Kuota Terbatas tetap terkunci (kurasi dilakukan internal oleh Admin)."
          aksiHeader={
            <StatusTeks
              status="approved"
              labelKustom={dataPengaturan.event.labelAksesPublik}
            />
          }
        >
          {!bolehUbahEvent && (
            <div className="mb-4 rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] px-3.5 py-2.5 text-xs text-[var(--teks-sekunder)] flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[var(--teks-redup)] shrink-0" aria-hidden="true" />
              <span>
                Mode baca: hanya Owner, Admin, dan Digital Manager yang dapat mengubah info acara &amp; akun media sosial.
              </span>
            </div>
          )}

          {galatEvent && (
            <p
              role="alert"
              className="mb-4 rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
            >
              {galatEvent}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputTeks
              label="Nama Acara Resmi"
              value={namaEvent}
              disabled={!bolehUbahEvent}
              onChange={(e) => setNamaEvent(e.target.value)}
            />
            <InputTeks
              label="Kota / Wilayah Publik"
              value={kotaWilayahPublik}
              disabled={!bolehUbahEvent}
              petunjuk="Hanya menyebut kawasan (mis. Balige, Toba) pada materi publik."
              onChange={(e) => setKotaWilayahPublik(e.target.value)}
            />
            <InputTeks
              label="Tanggal & Waktu Acara"
              value={`${formatTanggalWib(dataPengaturan.event.tanggalEvent)} • ${dataPengaturan.event.zonaWaktu}`}
              disabled
            />
            <InputTeks
              label="Sifat Penyampaian Kampanye"
              value="Kuota Terbatas (Publik) · Kurasi Internal Admin di Balik Layar"
              disabled
            />
          </div>

          <div className="mt-4">
            <AreaTeks
              label="Lokasi Acara Detail (Khusus Tim Internal & Tamu Terkonfirmasi)"
              rows={2}
              value={lokasiPrivat}
              disabled={!bolehUbahEvent}
              placeholder="Alamat rinci venue (hanya dikirim kepada tamu yang memperoleh konfirmasi kursi)..."
              petunjuk="Alamat rinci tidak pernah ditampilkan ke publik sebelum konfirmasi undangan dikirim."
              onChange={(e) => setLokasiPrivat(e.target.value)}
            />
          </div>
        </Kartu>

        {/* Akun Media Sosial */}
        <Kartu
          judul="Akun Media Sosial Resmi"
          subjudul="Akun bawaan masih bertanda Contoh hingga dipastikan oleh Owner."
        >
          <div className="space-y-4">
            {daftarHandle.map((item) => (
              <div
                key={item.id}
                className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)]/70 p-3.5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-xs font-semibold text-[var(--teks-utama)]">
                    {item.platform}
                  </strong>
                  <StatusTeks
                    status={
                      item.statusKonfirmasi === 'terkonfirmasi-owner'
                        ? 'approved'
                        : 'sample'
                    }
                    labelKustom={
                      item.statusKonfirmasi === 'terkonfirmasi-owner'
                        ? 'Terkonfirmasi Owner'
                        : 'Contoh (Belum Dikonfirmasi)'
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <InputTeks
                    label="Handle / Nama Akun"
                    value={item.handle}
                    disabled={!bolehUbahEvent}
                    onChange={(e) =>
                      updateHandleItem(item.id, { handle: e.target.value })
                    }
                  />
                  <InputTeks
                    label="URL Profil HTTPS Resmi"
                    value={item.urlProfil}
                    disabled={!bolehUbahEvent}
                    placeholder="https://..."
                    onChange={(e) =>
                      updateHandleItem(item.id, { urlProfil: e.target.value })
                    }
                  />
                  <SelectPilihan
                    label="Status Verifikasi Handle"
                    value={item.statusKonfirmasi}
                    disabled={!bolehUbahEvent}
                    opsi={[
                      {
                        nilai: 'contoh-belum-dikonfirmasi',
                        label: 'Contoh / Belum Dikonfirmasi',
                      },
                      {
                        nilai: 'terkonfirmasi-owner',
                        label: 'Terkonfirmasi Resmi Owner',
                      },
                    ]}
                    onChange={(e) =>
                      updateHandleItem(item.id, {
                        statusKonfirmasi: e.target.value as
                          | 'contoh-belum-dikonfirmasi'
                          | 'terkonfirmasi-owner',
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Kartu>

        {/* Kontak Bisnis & Pers Resmi */}
        <Kartu
          judul="Kontak Bisnis, Kemitraan & Media"
          subjudul="Dibiarkan kosong hingga Owner mengisi nomor dan email resmi."
          aksiHeader={
            <StatusTeks
              status={
                konfirmasiKontak === 'terkonfirmasi-owner'
                  ? 'approved'
                  : 'not-configured'
              }
              labelKustom={
                konfirmasiKontak === 'terkonfirmasi-owner'
                  ? 'Terkonfirmasi Owner'
                  : 'Belum Diisi'
              }
            />
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputTeks
              label="Email Pers / Media Resmi"
              type="email"
              value={emailPress}
              disabled={!bolehUbahEvent}
              placeholder="Kosong (belum dikonfirmasi)"
              onChange={(e) => setEmailPress(e.target.value)}
            />
            <InputTeks
              label="WhatsApp Kemitraan / VIP Desk"
              value={whatsappKemitraan}
              disabled={!bolehUbahEvent}
              placeholder="Kosong (belum dikonfirmasi)"
              onChange={(e) => setWhatsappKemitraan(e.target.value)}
            />
            <InputTeks
              label="Email Bisnis / Kolaborasi Brand"
              type="email"
              value={emailBisnis}
              disabled={!bolehUbahEvent}
              placeholder="Kosong (belum dikonfirmasi)"
              onChange={(e) => setEmailBisnis(e.target.value)}
            />
            <SelectPilihan
              label="Status Konfirmasi Kontak Resmi"
              value={konfirmasiKontak}
              disabled={!bolehUbahEvent}
              opsi={[
                { nilai: 'belum-diisi', label: 'Belum Diisi / Menunggu Konfirmasi' },
                { nilai: 'terkonfirmasi-owner', label: 'Terkonfirmasi Resmi Owner' },
              ]}
              onChange={(e) =>
                setKonfirmasiKontak(
                  e.target.value as 'belum-diisi' | 'terkonfirmasi-owner',
                )
              }
            />
          </div>

          {bolehUbahEvent && (
            <div className="mt-4 flex justify-end">
              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                memuat={sedangSimpanEvent}
                ikonKiri={<Save className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Simpan Pengaturan Event &amp; Kanal
              </Tombol>
            </div>
          )}
        </Kartu>
      </form>

      {/* Batas Biaya Kampanye (Owner / Admin) */}
      <Kartu
        judul="Batas Biaya Disetujui (Owner / Admin)"
        subjudul="Mengunci batas maksimum biaya agar selalu terpisah dari estimasi awal."
        aksiHeader={
          <StatusTeks
            status={
              dataPengaturan.anggaran.plafonDisetujuiIdr !== null
                ? 'approved'
                : 'not-configured'
            }
            labelKustom={
              dataPengaturan.anggaran.plafonDisetujuiIdr !== null
                ? formatRupiah(dataPengaturan.anggaran.plafonDisetujuiIdr)
                : 'Belum Disetujui'
            }
          />
        }
      >
        {!bolehApproveAnggaran && (
          <div className="mb-4 rounded-[var(--radius-sm)] border border-[var(--status-peringatan)]/40 bg-[var(--status-peringatan)]/[0.06] px-3.5 py-2.5 text-xs text-[var(--status-peringatan)] flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Hanya <strong>Owner</strong> atau <strong>Admin Sistem</strong> yang dapat menyetujui atau mengubah batas biaya resmi.
            </span>
          </div>
        )}

        {galatAnggaran && (
          <p
            role="alert"
            className="mb-4 rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
          >
            {galatAnggaran}
          </p>
        )}

        <form onSubmit={tanganiSimpanAnggaran} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectPilihan
              label="Skenario Target Kampanye"
              value={skenarioTarget}
              disabled={!bolehApproveAnggaran}
              opsi={DETAIL_SKENARIO_ANGGARAN_KANONIK.map((s) => ({
                nilai: s.id,
                label: `${s.nama} (${formatEstimasiRupiah(s.grandTotalIdr, s.grandTotalPerkiraan)})`,
              }))}
              onChange={(e) => {
                const id = e.target.value as IdSkenarioAnggaran;
                setSkenarioTarget(id);
                const detail = DETAIL_SKENARIO_ANGGARAN_KANONIK.find(
                  (d) => d.id === id,
                );
                if (detail && plafonInput.trim() === '') {
                  setPlafonInput(String(detail.grandTotalIdr));
                }
              }}
            />

            <InputTeks
              label="Plafon Maksimum Disetujui (IDR)"
              type="number"
              min="0"
              step="50000"
              value={plafonInput}
              disabled={!bolehApproveAnggaran}
              placeholder="Kosongkan jika belum disetujui"
              petunjuk="Di atas angka ini sistem memicu peringatan batas plafon."
              onChange={(e) => setPlafonInput(e.target.value)}
            />

            <InputTeks
              label="Catatan Persetujuan Terakhir"
              value={
                dataPengaturan.anggaran.disetujuiOleh
                  ? `${dataPengaturan.anggaran.disetujuiOleh} (${dataPengaturan.anggaran.tanggalDisetujui})`
                  : 'Belum ada otorisasi tercatat'
              }
              disabled
            />
          </div>

          <AreaTeks
            label="Catatan & Syarat Pencairan Owner"
            rows={2}
            value={catatanPersetujuan}
            disabled={!bolehApproveAnggaran}
            onChange={(e) => setCatatanPersetujuan(e.target.value)}
          />

          {bolehApproveAnggaran && (
            <div className="flex justify-end">
              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                memuat={sedangSimpanAnggaran}
                ikonKiri={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Tetapkan &amp; Kunci Persetujuan Plafon
              </Tombol>
            </div>
          )}
        </form>
      </Kartu>
    </div>
  );
}
