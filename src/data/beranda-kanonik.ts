import type {
  AksiKritisItem,
  CatatanStatusKonten,
  FaseKampanye,
  JadwalIklanRingkas,
  RingkasanKpiKelompok,
  RingkasanOutcome,
  SkenarioAnggaranRingkas,
} from '../types/beranda';

export const IDENTITAS_EVENT_KANONIK = {
  nama: 'MRs Plan — The Contemporary Heritage Reinterpretation (Melfarina × Raden Sirait)',
  rencanaBrand: 'MRs Plan (Melfarina Raden Sirait)',
  motifUtama: 'Motif Batak Ulos Ragi Hotang',
  format: 'Gala Fashion Show',
  tanggalEvent: '18 Desember 2026',
  lokasiPublik: 'Balige, Kabupaten Toba, Sumatera Utara',
  kolaborator: 'Melfarina Sianipar × Raden Sirait',
  pemilikBrand: 'Melfarina Sianipar (Owner Vany Songket & Villa Balige)',
  desainer: 'Raden Sirait',
  akses: 'Kuota Terbatas',
  periodeKampanye: '26 November – 17 Desember 2026 (22 hari)',
  periodePascaEvent: '18 – 22 Desember 2026 dan tindak lanjut 30 hari',
} as const;

export const NARASI_EKSEKUTIF_KANONIK =
  'Bangun awareness publik yang terarah di ekosistem fashion, media, dan budaya, buktikan kredibilitas melalui cerita founder serta portofolio desainer yang dapat diverifikasi, lalu ubah perhatian tersebut menjadi percakapan bisnis dan pipeline tamu melalui pendaftaran kuota terbatas.';

export const TIGA_OUTCOME_KANONIK: RingkasanOutcome[] = [
  {
    id: 'awareness',
    judul: 'Awareness Terarah',
    definisi:
      'Kolaborasi Melfarina Sianipar × Raden Sirait, rencana brand MRS, dan gagasan modernisasi motif Batak Ragi Hotang dikenal oleh ekosistem fashion, media, dan budaya yang relevan.',
    buktiKeberhasilan:
      'Reach audiens relevan, video views berkualitas (3-detik & ThruPlay), pencarian nama, kunjungan profil, serta share dan save dari akun industri.',
  },
  {
    id: 'trust',
    judul: 'Trust & Kredibilitas',
    definisi:
      'Publik melihat bukti nyata perjalanan owner, konsistensi kualitas proses, portofolio desainer terverifikasi, dan keseriusan arah koleksi.',
    buktiKeberhasilan:
      'Konten disimpan/dibagikan, komentar substantif, kunjungan profil oleh pelaku industri, liputan atau mention media, dan pertanyaan bisnis.',
  },
  {
    id: 'pipeline',
    judul: 'Stakeholder Pipeline',
    definisi:
      'Pihak strategis dari segmen komersial, influence, dan institusi membuka komunikasi lanjutan untuk kolaborasi, kemitraan, atau liputan.',
    buktiKeberhasilan:
      'Qualified DM/email, permintaan lookbook atau presentasi, balasan direct outreach, referral, serta tindak lanjut pendaftar terkurasi & undangan.',
  },
];

export const FASE_KAMPANYE_KANONIK: FaseKampanye[] = [
  {
    id: 'fase-1',
    nama: 'Warm-up & Identity',
    rentangTanggal: '26–30 Nov 2026',
    fokus: 'Perkenalan kolaborasi Melfarina Sianipar × Raden Sirait (MRS), founder story, motif Batak Ragi Hotang, serta pengumuman pendaftaran kuota terbatas tanpa alamat rinci.',
    status: 'planned',
  },
  {
    id: 'fase-2',
    nama: 'Credibility Build',
    rentangTanggal: '1–7 Des 2026',
    fokus: 'Konten proses desain, portofolio terverifikasi Raden, prinsip kerja owner, dan riset heritage.',
    status: 'planned',
  },
  {
    id: 'fase-3',
    nama: 'Product & Vision Reveal',
    rentangTanggal: '8–14 Des 2026',
    fokus: 'Detail material dan siluet koleksi, visi pasar yang lebih luas, serta persiapan pra-acara.',
    status: 'planned',
  },
  {
    id: 'fase-4',
    nama: 'Final Attention',
    rentangTanggal: '15–17 Des 2026',
    fokus: 'Countdown H-3 hingga H-1, preview karya, pengingat kuota terbatas, serta CTA ikuti dokumentasi.',
    status: 'planned',
  },
  {
    id: 'fase-5',
    nama: 'Event Day',
    rentangTanggal: '18 Des 2026',
    fokus: 'Gala Fashion Show di Balige bagi pemegang konfirmasi undangan kuota terbatas serta dokumentasi langsung oleh PIC di lokasi.',
    status: 'planned',
  },
  {
    id: 'fase-6',
    nama: 'Post-Event & Next Step',
    rentangTanggal: '19–22 Des 2026 dst',
    fokus: 'Recap 24 jam, media clipping, pengiriman lookbook, follow-up stakeholder, dan rencana 30 hari.',
    status: 'planned',
  },
];

// 22 hari × (2 video + 1 desain) = 66 master konten terencana (seluruhnya berstatus awal 'planned')
export const DAFTAR_STATUS_KONTEN_AWAL: CatatanStatusKonten[] = Array.from(
  { length: 22 },
  (_, indeksHari) => {
    const hari = indeksHari + 1;
    return [
      { id: `h${hari}-va`, jenis: 'video' as const, status: 'planned' as const },
      { id: `h${hari}-vb`, jenis: 'video' as const, status: 'planned' as const },
      { id: `h${hari}-ds`, jenis: 'desain' as const, status: 'planned' as const },
    ];
  },
).flat();

export const SKENARIO_ANGGARAN_KANONIK: SkenarioAnggaranRingkas[] = [
  {
    id: 'hemat',
    nama: 'Skenario Hemat',
    rekomendasi: false,
    produksiIdr: 4970000,
    adsSetupIdr: 150000,
    metaIdr: 1400000,
    tiktokIdr: 0,
    tiktokPerkiraan: false,
    totalIdr: 6520000,
    totalPerkiraan: false,
    catatan: 'Ads Setup Rp150.000 (Meta & TikTok) + Meta 1 flight (7 hari @Rp200.000/hari), TikTok organik (Rp0/hari), outreach langsung ke stakeholder prioritas.',
  },
  {
    id: 'menengah',
    nama: 'Skenario Menengah',
    rekomendasi: true,
    produksiIdr: 6570000,
    adsSetupIdr: 300000,
    metaIdr: 4900000,
    tiktokIdr: 3150000,
    tiktokPerkiraan: false,
    totalIdr: 14920000,
    totalPerkiraan: false,
    catatan: 'Ads Setup Rp300.000 (Meta & TikTok) + Meta 2 flight (2×7 hari @Rp350.000/hari) + TikTok 1 ad group (7 hari @Rp450.000/hari).',
  },
  {
    id: 'agresif',
    nama: 'Skenario Agresif',
    rekomendasi: false,
    produksiIdr: 8170000,
    adsSetupIdr: 500000,
    metaIdr: 7000000,
    tiktokIdr: 5600000,
    tiktokPerkiraan: false,
    totalIdr: 21270000,
    totalPerkiraan: false,
    catatan: 'Ads Setup Rp500.000 (Meta & TikTok) + Meta 2 flight (2×7 hari @Rp500.000/hari) + TikTok 2 ad group (7 hari @Rp800.000/hari, perlu otorisasi penuh).',
  },
];

export const JADWAL_IKLAN_KANONIK: JadwalIklanRingkas[] = [
  {
    id: 'meta-1',
    platform: 'Meta Ads',
    namaFlight: 'Meta Flight 1 (Awareness / ThruPlay)',
    rentangTanggal: '29 Nov – 5 Des 2026',
    cakupanSkenario: 'Hemat, Menengah, Agresif',
    catatan: '1 campaign, 1 broad ad set, 3–4 kreatif utama setelah 6 konten organik dan 3 pinned post siap.',
    status: 'planned',
  },
  {
    id: 'tiktok-1',
    platform: 'TikTok Ads',
    namaFlight: 'TikTok Flight (Discovery & Spark Ads)',
    rentangTanggal: '4 – 10 Des 2026',
    cakupanSkenario: 'Menengah & Agresif saja',
    catatan: 'Wajib verifikasi minimum Ads Manager (USD 50 campaign / USD 20 ad group) sebelum top-up. Paket Hemat tetap organik.',
    status: 'planned',
  },
  {
    id: 'meta-2',
    platform: 'Meta Ads',
    namaFlight: 'Meta Flight 2 (Collection Preview & Reminder)',
    rentangTanggal: '11 – 17 Des 2026',
    cakupanSkenario: 'Menengah & Agresif saja',
    catatan: 'Memfokuskan anggaran pada 2–3 kreatif pemenang dari evaluasi Flight 1 menjelang acara.',
    status: 'planned',
  },
];

export const AKSI_KRITIS_KANONIK: AksiKritisItem[] = [
  {
    id: 'aksi-1',
    tenggat: '24–25 Nov 2026',
    judul: 'Konfirmasi lokasi, jadwal talent, dan pelaksanaan Shooting Hari 1 — Syuting Iklan (Hero Ad & interview inti)',
    penanggungJawab: 'Digital Manager & Production Coordinator',
    kritis: true,
    status: 'planned',
  },
  {
    id: 'aksi-2',
    tenggat: '24–26 Nov 2026',
    judul: 'Setup akun sosial media, aktifkan 2FA, siapkan folder kerja, dan pastikan 6 konten awal + 3 pinned post',
    penanggungJawab: 'Digital Manager',
    kritis: false,
    status: 'planned',
  },
  {
    id: 'aksi-3',
    tenggat: '29 Nov 2026',
    judul: 'Siapkan buffer edit awal dan luncurkan Meta Flight 1 setelah skenario anggaran disetujui',
    penanggungJawab: 'Digital Manager & Owner',
    kritis: false,
    status: 'planned',
  },
  {
    id: 'aksi-4',
    tenggat: '30 Nov & 3 Des 2026',
    judul: 'Pelaksanaan Shooting Hari 2 & 3 — Syuting Short Konten (Content Bank 44 video, wawancara lanjutan, B-roll, dan detail produk)',
    penanggungJawab: 'Videografer & Digital Manager',
    kritis: true,
    status: 'planned',
  },
  {
    id: 'aksi-5',
    tenggat: 'Sebelum 11 Des 2026',
    judul: 'Batas Kritis: Seluruh footage dan aset Melfarina & Ghivany wajib tuntas direkam sebelum berangkat ke Balige',
    penanggungJawab: 'Owner, Ghivany & Tim Produksi',
    kritis: true,
    status: 'planned',
  },
  {
    id: 'aksi-6',
    tenggat: 'Sebelum Launch Penuh',
    judul: 'Konfirmasi skenario anggaran, finalisasi rencana brand MRS (Melfarina Raden Sirait), kontak resmi press/bisnis, serta izin portofolio',
    penanggungJawab: 'Owner & Raden Sirait',
    kritis: true,
    status: 'not-configured',
  },
];

export const KPI_RINGKAS_KANONIK: RingkasanKpiKelompok[] = [
  {
    id: 'kpi-awareness',
    kategori: 'Awareness',
    indikatorUtama: 'Unique reach, impressions, frequency, CPM, 3-sec views, ThruPlay/6-sec views',
    nilaiAktual: null,
    status: 'not-configured',
  },
  {
    id: 'kpi-interest',
    kategori: 'Interest',
    indikatorUtama: 'Average watch time, video completion, profile visits, saves, shares',
    nilaiAktual: null,
    status: 'not-configured',
  },
  {
    id: 'kpi-trust',
    kategori: 'Trust',
    indikatorUtama: 'Komentar substantif, akun industri engage, mentions, inbound media/partner, klik portofolio',
    nilaiAktual: null,
    status: 'not-configured',
  },
  {
    id: 'kpi-relationship',
    kategori: 'Relationship',
    indikatorUtama: 'Qualified DM/email, permintaan meeting/lookbook, referral, balasan outreach, stakeholder RSVP',
    nilaiAktual: null,
    status: 'not-configured',
  },
  {
    id: 'kpi-readiness',
    kategori: 'Brand Readiness',
    indikatorUtama: 'Pencarian nama brand, relevant followers, permintaan katalog, minat buyer/kemitraan',
    nilaiAktual: null,
    status: 'not-configured',
  },
];
