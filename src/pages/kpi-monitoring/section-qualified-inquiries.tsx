import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { DEFINISI_QUALIFIED_INQUIRY_KANONIK } from '../../data/kpi-kanonik';
import type { InquiryKualifikasi } from '../../types/kpi';
import { formatTanggalWib } from '../../utils/format';
import { validasiInquiryKualifikasi } from '../../utils/kpi';
import {
  AreaTeks,
  InputTeks,
  Kartu,
  KondisiKosong,
  SelectPilihan,
  StatusTeks,
  Tombol,
} from '../../components/ui';

export interface SectionQualifiedInquiriesProps {
  daftarInquiry: InquiryKualifikasi[];
  onTambahInquiry: (inquiry: InquiryKualifikasi) => void;
  onPerbaruiInquiry: (inquiry: InquiryKualifikasi) => void;
  onHapusInquiry: (idInquiry: string) => void;
}

const LABEL_KANAL: Record<InquiryKualifikasi['kanal'], string> = {
  'dm-instagram': 'DM Instagram',
  'dm-tiktok': 'DM TikTok',
  facebook: 'Facebook Message',
  email: 'Email Bisnis / Press',
  whatsapp: 'WhatsApp Resmi',
  'media-inbound': 'Inbound Media / Partner',
};

export function SectionQualifiedInquiries({
  daftarInquiry,
  onTambahInquiry,
  onPerbaruiInquiry,
  onHapusInquiry,
}: SectionQualifiedInquiriesProps) {
  const [tanggal, setTanggal] = useState('');
  const [pengirimOrganisasi, setPengirimOrganisasi] = useState('');
  const [kanal, setKanal] =
    useState<InquiryKualifikasi['kanal']>('dm-instagram');
  const [kategoriStakeholder, setKategoriStakeholder] = useState('Commercial / Buyer');
  const [ringkasanPesan, setRingkasanPesan] = useState('');
  const [terkualifikasi, setTerkualifikasi] = useState(true);
  const [alasanKualifikasi, setAlasanKualifikasi] = useState('');
  const [dinilaiOleh, setDinilaiOleh] = useState('Digital Manager');
  const [galat, setGalat] = useState('');

  // Inline modal/state untuk ubah status kualifikasi inquiry yang sudah tercatat
  const [idSedangEdit, setIdSedangEdit] = useState<string | null>(null);
  const [alasanEdit, setAlasanEdit] = useState('');
  const [galatEdit, setGalatEdit] = useState('');

  const jumlahQualified = daftarInquiry.filter((i) => i.terkualifikasi).length;

  const tanganiSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cek = validasiInquiryKualifikasi({
      tanggal,
      pengirimOrganisasi,
      ringkasanPesan,
      terkualifikasi,
      alasanKualifikasi,
      dinilaiOleh,
    });

    if (!cek.valid) {
      setGalat(cek.pesanGalat);
      return;
    }

    setGalat('');
    onTambahInquiry({
      id: `inq-${Date.now()}`,
      tanggal: tanggal.trim(),
      pengirimOrganisasi: pengirimOrganisasi.trim(),
      kanal,
      kategoriStakeholder: kategoriStakeholder.trim(),
      ringkasanPesan: ringkasanPesan.trim(),
      terkualifikasi,
      alasanKualifikasi: alasanKualifikasi.trim(),
      dinilaiOleh: dinilaiOleh.trim(),
      dinilaiPada: new Date().toISOString(),
    });

    setPengirimOrganisasi('');
    setRingkasanPesan('');
    setAlasanKualifikasi('');
  };

  const simpanKualifikasiUlang = (item: InquiryKualifikasi, jadiQualified: boolean) => {
    if (jadiQualified && !alasanEdit.trim()) {
      setGalatEdit('Isi alasan kualifikasi sebelum menandai Qualified.');
      return;
    }
    setGalatEdit('');
    onPerbaruiInquiry({
      ...item,
      terkualifikasi: jadiQualified,
      alasanKualifikasi: alasanEdit.trim() || item.alasanKualifikasi,
      dinilaiPada: new Date().toISOString(),
    });
    setIdSedangEdit(null);
    setAlasanEdit('');
  };

  return (
    <div className="space-y-5">
      {/* Panduan Menilai Pesan & Peluang Masuk */}
      <Kartu
        judul="Panduan Menilai Pesan & Peluang Masuk"
        subjudul="Memilah pesan umum dari peluang bisnis, media, atau undangan yang sah."
        aksiHeader={
          <StatusTeks
            status={jumlahQualified > 0 ? 'actual' : 'not-configured'}
            labelKustom={`${jumlahQualified} Peluang Sah / ${daftarInquiry.length} Total`}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {DEFINISI_QUALIFIED_INQUIRY_KANONIK.map((def) => (
            <div
              key={def.judul}
              className="rounded-[var(--radius-sm)] border border-[var(--garis-halus)] bg-[var(--bg-kanvas)] p-3.5"
            >
              <p className="font-semibold text-[var(--teks-utama)]">{def.judul}</p>
              <p className="mt-1 text-[var(--teks-sekunder)] leading-relaxed">
                {def.deskripsi}
              </p>
            </div>
          ))}
        </div>
      </Kartu>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Form Catat & Nilai Pesan Masuk */}
        <div className="xl:col-span-5">
          <Kartu
            judul="Catat Pesan Masuk"
            subjudul="Tulis alasan penilaian saat menandai sebagai Peluang Sah."
          >
            <form onSubmit={tanganiSubmit} noValidate className="space-y-3">
              {galat && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-sm)] border border-[var(--status-bahaya)]/40 bg-[var(--status-bahaya)]/[0.06] px-3 py-2 text-xs text-[var(--status-bahaya)]"
                >
                  {galat}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputTeks
                  label="Tanggal Masuk"
                  type="date"
                  wajib
                  value={tanggal}
                  onChange={(e) => {
                    setTanggal(e.target.value);
                    if (galat) setGalat('');
                  }}
                />
                <SelectPilihan
                  label="Kanal Masuk"
                  value={kanal}
                  opsi={Object.entries(LABEL_KANAL).map(([nilai, label]) => ({
                    nilai,
                    label,
                  }))}
                  onChange={(e) =>
                    setKanal(e.target.value as InquiryKualifikasi['kanal'])
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputTeks
                  label="Pengirim / Organisasi"
                  wajib
                  value={pengirimOrganisasi}
                  placeholder="Mis. Nama Butik / Redaksi Media"
                  onChange={(e) => {
                    setPengirimOrganisasi(e.target.value);
                    if (galat) setGalat('');
                  }}
                />
                <SelectPilihan
                  label="Segmen Relevan"
                  value={kategoriStakeholder}
                  opsi={[
                    { nilai: 'Commercial / Buyer', label: 'A — Commercial / Buyer' },
                    { nilai: 'Influence / Media', label: 'A — Influence / Media' },
                    { nilai: 'Institution', label: 'A — Institution' },
                    { nilai: 'Cultural Ecosystem', label: 'B — Cultural Ecosystem' },
                    { nilai: 'Public Umum', label: 'C — Pertanyaan Umum' },
                  ]}
                  onChange={(e) => setKategoriStakeholder(e.target.value)}
                />
              </div>

              <AreaTeks
                label="Ringkasan Pesan / Permintaan"
                wajib
                rows={2}
                value={ringkasanPesan}
                placeholder="Mis. Meminta lookbook koleksi Ragi Hotang dan jadwal pertemuan kurasi."
                onChange={(e) => {
                  setRingkasanPesan(e.target.value);
                  if (galat) setGalat('');
                }}
              />

              <label className="flex items-center gap-2 text-xs font-medium text-[var(--teks-utama)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={terkualifikasi}
                  onChange={(e) => {
                    setTerkualifikasi(e.target.checked);
                    if (galat) setGalat('');
                  }}
                  className="h-4 w-4 accent-[var(--aksen-maroon)]"
                />
                <span>Tandai sebagai Peluang Sah (masuk hitungan KPI)</span>
              </label>

              <AreaTeks
                label={
                  terkualifikasi
                    ? 'Alasan Penilaian (Wajib Diisi)'
                    : 'Catatan Penilaian'
                }
                wajib={terkualifikasi}
                rows={2}
                value={alasanKualifikasi}
                placeholder="Jelaskan relevansi bisnis/media/institusi dan tindak lanjutnya."
                onChange={(e) => {
                  setAlasanKualifikasi(e.target.value);
                  if (galat) setGalat('');
                }}
              />

              <InputTeks
                label="Dinilai Oleh"
                wajib
                value={dinilaiOleh}
                onChange={(e) => setDinilaiOleh(e.target.value)}
              />

              <Tombol
                type="submit"
                varian="primer"
                ukuran="sm"
                className="w-full"
                ikonKiri={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Simpan Pesan Masuk
              </Tombol>
            </form>
          </Kartu>
        </div>

        {/* Daftar Pesan Masuk */}
        <div className="xl:col-span-7">
          <Kartu
            judul="Daftar Pesan Masuk"
            subjudul="Pesan yang sudah dinilai; Peluang Sah otomatis menambah hitungan relasi."
          >
            {daftarInquiry.length === 0 ? (
              <KondisiKosong
                judul="Belum ada pesan masuk tercatat"
                deskripsi="Catat DM, email bisnis, permintaan lookbook, atau kontak media yang masuk."
              />
            ) : (
              <ul className="divide-y divide-[var(--garis-halus)]">
                {daftarInquiry.map((item) => (
                  <li key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[var(--teks-utama)]">
                            {item.pengirimOrganisasi}
                          </span>
                          <StatusTeks
                            status={item.terkualifikasi ? 'approved' : 'planned'}
                            labelKustom={
                              item.terkualifikasi
                                ? 'Peluang Sah'
                                : 'Pesan Umum'
                            }
                          />
                        </div>
                        <p className="text-[11px] text-[var(--teks-redup)] mt-0.5">
                          {formatTanggalWib(item.tanggal)} • {LABEL_KANAL[item.kanal]} •{' '}
                          {item.kategoriStakeholder}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Tombol
                          varian="sekunder"
                          ukuran="sm"
                          onClick={() => {
                            if (idSedangEdit === item.id) {
                              setIdSedangEdit(null);
                              setGalatEdit('');
                            } else {
                              setIdSedangEdit(item.id);
                              setAlasanEdit(item.alasanKualifikasi);
                              setGalatEdit('');
                            }
                          }}
                        >
                          {item.terkualifikasi ? 'Ubah Status' : 'Tandai Peluang Sah'}
                        </Tombol>
                        <Tombol
                          varian="halus"
                          ukuran="sm"
                          aria-label={`Hapus pesan ${item.pengirimOrganisasi}`}
                          onClick={() => onHapusInquiry(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </Tombol>
                      </div>
                    </div>

                    <p className="text-[var(--teks-sekunder)]">{item.ringkasanPesan}</p>

                    {item.alasanKualifikasi && (
                      <p className="rounded-[var(--radius-sm)] bg-[var(--bg-kanvas)] border border-[var(--garis-halus)] px-2.5 py-1.5 text-[11px] text-[var(--teks-utama)]">
                        <strong>Alasan ({item.dinilaiOleh}):</strong>{' '}
                        {item.alasanKualifikasi}
                      </p>
                    )}

                    {idSedangEdit === item.id && (
                      <div className="rounded-[var(--radius-sm)] border border-[var(--garis-tegas)] bg-[var(--bg-kanvas)] p-3 space-y-2">
                        {galatEdit && (
                          <p role="alert" className="text-[11px] text-[var(--status-bahaya)]">
                            {galatEdit}
                          </p>
                        )}
                        <AreaTeks
                          label="Alasan Penilaian Terbaru"
                          rows={2}
                          value={alasanEdit}
                          onChange={(e) => {
                            setAlasanEdit(e.target.value);
                            if (galatEdit) setGalatEdit('');
                          }}
                        />
                        <div className="flex flex-wrap justify-end gap-2">
                          <Tombol
                            varian="sekunder"
                            ukuran="sm"
                            onClick={() => simpanKualifikasiUlang(item, false)}
                          >
                            Jadikan Pesan Umum
                          </Tombol>
                          <Tombol
                            varian="primer"
                            ukuran="sm"
                            ikonKiri={<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                            onClick={() => simpanKualifikasiUlang(item, true)}
                          >
                            Simpan Peluang Sah
                          </Tombol>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Kartu>
        </div>
      </div>
    </div>
  );
}
