import type {
  BarisCreativeMatrix,
  DetailSkenarioAnggaran,
  FlightKampanyeIklan,
  ItemBiayaProduksi,
  StateIklanAnggaran,
} from '../types/iklan';

export const KURS_PLANNING_USD_IDR_KANONIK = 17000;

export const THRESHOLD_ADS_MANAGER_KANONIK = {
  metaCatatan:
    'Meta Ads awal menggunakan 1 campaign, 1 broad ad set, 3–4 kreatif, dan Advantage+ placements (pratinjau tiap placement wajib sebelum tayang).',
  tiktokCampaignMinUsd: 50,
  tiktokAdGroupMinUsd: 20,
  tiktokCatatan:
    'Threshold platform pada sumber (pembaruan Agustus 2026): minimum USD 50 tingkat campaign dan USD 20 tingkat ad group. Wajib verifikasi ulang di TikTok Ads Manager sebelum top-up.',
  batasEvaluasiJam: '48–72 jam setelah peluncuran',
  geografiHipotesis:
    'Jakarta, Bandung, Medan, dan Sumatera Utara (termasuk Balige/Toba). Surabaya, Yogyakarta, Bali diuji hanya bila anggaran dan data mendukung. Tidak menjalankan iklan global berbayar sebelum profil, lookbook, kapasitas, dan daftar negara siap.',
  kebijakanCta:
    'Dilarang memakai CTA penjualan tiket ("beli tiket", "jual tiket", "datang langsung tanpa daftar"). Gunakan CTA follow, daftar kuota terbatas, lihat portofolio, atau kontak media/bisnis resmi.',
} as const;

export const RINCIAN_BIAYA_PRODUKSI_KANONIK: ItemBiayaProduksi[] = [
  {
    id: 'prod-videografer-iklan',
    komponen: 'Jasa Tim Video Iklan (Syuting)',
    keterangan:
      '1 hari syuting iklan (25 Nov: Hero Ad & wawancara inti); mencakup jasa tim, biaya operasional, dan sewa alat produksi sesuai skala paket.',
    hematIdr: 1000000,
    menengahIdr: 1500000,
    agresifIdr: 2000000,
  },
  {
    id: 'prod-content-creator-short',
    komponen: 'Jasa Content Creator (Syuting)',
    keterangan:
      '2 hari syuting short konten (30 Nov & 3 Des: content bank 44 video pendek & stok pra-Balige); tarif tetap Rp500.000/hari mencakup jasa content creator, biaya operasional, dan sewa alat standar.',
    hematIdr: 1000000,
    menengahIdr: 1000000,
    agresifIdr: 1000000,
  },
  {
    id: 'prod-editing-44',
    komponen: 'Editing Video Pendek',
    keterangan: 'Video master 9:16 (1080×1920) lengkap dengan subtitle & audio komersial berizin (2 video/hari × 22 hari)',
    hematIdr: 2200000,
    menengahIdr: 3300000,
    agresifIdr: 4400000,
  },
  {
    id: 'prod-desain-22',
    komponen: 'Desain Konten Statis & Carousel',
    keterangan: 'Penyusunan 4 template utama serta produksi desain statis/carousel mirror Instagram & Facebook dengan tarif stabil Rp25.000/desain (1 desain/hari × 22 hari)',
    hematIdr: 550000,
    menengahIdr: 550000,
    agresifIdr: 550000,
  },
  {
    id: 'prod-capcut-pro',
    komponen: 'Langganan CapCut Pro',
    keterangan: 'Lisensi bulanan editor video untuk ekspor resolusi tinggi, auto-caption, dan aset audio komersial',
    hematIdr: 120000,
    menengahIdr: 120000,
    agresifIdr: 120000,
  },
  {
    id: 'prod-canva-premium',
    komponen: 'Langganan Canva Premium',
    keterangan: 'Lisensi bulanan desain grafis untuk akses brand kit, template premium, font komersial, dan ekspor aset',
    hematIdr: 100000,
    menengahIdr: 100000,
    agresifIdr: 100000,
  },
];

export const RINCIAN_LAYANAN_TERMASUK_KANONIK: ItemBiayaProduksi[] = [
  {
    id: 'layanan-pengelolaan-akun',
    komponen: 'Pengelolaan Akun Media Sosial & Interaksi',
    keterangan:
      'Penjadwalan unggahan harian, pengelolaan profil Instagram, TikTok & Facebook, serta moderasi komentar dan DM dasar selama periode kampanye — termasuk dalam paket (Rp0).',
    hematIdr: 0,
    menengahIdr: 0,
    agresifIdr: 0,
    hargaCoretHematIdr: 750000,
    hargaCoretMenengahIdr: 1000000,
    hargaCoretAgresifIdr: 1250000,
  },
  {
    id: 'layanan-optimalisasi-seo',
    komponen: 'Optimalisasi SEO, Riset Tagar & Copywriting',
    keterangan:
      'Riset kata kunci pencarian brand/motif, penyusunan tagar terarah, penulisan caption terstruktur, serta optimalisasi metadata dan safe-zone konten — termasuk dalam paket (Rp0).',
    hematIdr: 0,
    menengahIdr: 0,
    agresifIdr: 0,
    hargaCoretHematIdr: 500000,
    hargaCoretMenengahIdr: 750000,
    hargaCoretAgresifIdr: 1000000,
  },
  {
    id: 'layanan-web-desk-penyimpanan',
    komponen: 'Web Desk Work & Penyimpanan Aset Cloud',
    keterangan:
      'Pemeliharaan workspace web kampanye, manajemen kalender & alur kerja digital (desk work), serta penyimpanan arsip master video/desain dan backup cloud — termasuk dalam paket (Rp0).',
    hematIdr: 0,
    menengahIdr: 0,
    agresifIdr: 0,
    hargaCoretHematIdr: 650000,
    hargaCoretMenengahIdr: 850000,
    hargaCoretAgresifIdr: 1100000,
  },
  {
    id: 'layanan-administrasi',
    komponen: 'Biaya Administrasi, Koordinasi & Pelaporan',
    keterangan:
      'Biaya administrasi operasional kampanye, koordinasi persetujuan jadwal & materi tim, serta penyusunan ringkasan laporan performa PDF — termasuk dalam paket (Rp0).',
    hematIdr: 0,
    menengahIdr: 0,
    agresifIdr: 0,
    hargaCoretHematIdr: 350000,
    hargaCoretMenengahIdr: 500000,
    hargaCoretAgresifIdr: 650000,
  },
];

export const DETAIL_SKENARIO_ANGGARAN_KANONIK: DetailSkenarioAnggaran[] = [
  {
    id: 'hemat',
    nama: 'Skenario Hemat',
    rekomendasi: false,
    ringkasanMedia:
      'Ads Setup Meta & TikTok (Rp150.000) + Meta Flight 1 (29 Nov–5 Des, Rp200.000/hari). TikTok tetap organik (2 video/hari, Rp0/hari).',
    subtotalProduksiIdr: 4970000,
    contingency10PersenIdr: 0,
    totalProduksiIdr: 4970000,
    adsSetupIdr: 150000,
    metaIdr: 1400000,
    tiktokIdr: 0,
    tiktokPerkiraan: false,
    totalMediaIdr: 1550000,
    grandTotalIdr: 6520000,
    grandTotalPerkiraan: false,
    asumsiKursNote: 'Seluruh biaya berdenominasi IDR; setup iklan sudah mencakup konfigurasi Meta Ads & TikTok Ads tanpa belanja iklan TikTok berbayar.',
  },
  {
    id: 'menengah',
    nama: 'Skenario Menengah',
    rekomendasi: true,
    ringkasanMedia:
      'Ads Setup Meta & TikTok (Rp300.000) + Meta 2 flight (29 Nov–5 Des + 11–17 Des, Rp350.000/hari) + TikTok 1 ad group (4–10 Des, Rp450.000/hari × 7 hari).',
    subtotalProduksiIdr: 6570000,
    contingency10PersenIdr: 0,
    totalProduksiIdr: 6570000,
    adsSetupIdr: 300000,
    metaIdr: 4900000,
    tiktokIdr: 3150000,
    tiktokPerkiraan: false,
    totalMediaIdr: 8350000,
    grandTotalIdr: 14920000,
    grandTotalPerkiraan: false,
    asumsiKursNote:
      'Termasuk Biaya Ads Setup Rp300.000 (Meta & TikTok) dan anggaran TikTok Rp450.000/hari untuk 1 ad group selama 7 hari (total Rp3.150.000).',
  },
  {
    id: 'agresif',
    nama: 'Skenario Agresif',
    rekomendasi: false,
    ringkasanMedia:
      'Ads Setup Meta & TikTok (Rp500.000) + Meta 2 flight (29 Nov–5 Des + 11–17 Des, Rp500.000/hari) + TikTok 2 ad groups (4–10 Des, Rp800.000/hari × 7 hari).',
    subtotalProduksiIdr: 8170000,
    contingency10PersenIdr: 0,
    totalProduksiIdr: 8170000,
    adsSetupIdr: 500000,
    metaIdr: 7000000,
    tiktokIdr: 5600000,
    tiktokPerkiraan: false,
    totalMediaIdr: 13100000,
    grandTotalIdr: 21270000,
    grandTotalPerkiraan: false,
    asumsiKursNote:
      'Termasuk Biaya Ads Setup Rp500.000 (Meta & TikTok) dan anggaran TikTok Rp800.000/hari untuk 2 ad groups (@Rp400.000/hari) selama 7 hari (total Rp5.600.000).',
  },
];

export function buatDaftarFlightDefault(
  skenario: 'hemat' | 'menengah' | 'agresif',
): FlightKampanyeIklan[] {
  const harianMeta =
    skenario === 'agresif' ? 500000 : skenario === 'menengah' ? 350000 : 200000;
  const jumlahAdGroupTiktok = skenario === 'agresif' ? 2 : 1;
  const harianTiktokPerAdGroup =
    skenario === 'hemat' ? 0 : skenario === 'agresif' ? 400000 : 450000;

  const flights: FlightKampanyeIklan[] = [
    {
      id: 'flight-meta-1',
      kodeFlight: 'META-F1',
      namaCampaign: 'Meta Flight 1 — Awareness & ThruPlay Pengenalan',
      platform: 'meta',
      tanggalMulai: '2026-11-29',
      tanggalSelesai: '2026-12-05',
      anggaranHarian: harianMeta,
      mataUang: 'IDR',
      jumlahAdGroup: 1,
      cakupanSkenario: ['hemat', 'menengah', 'agresif'],
      status: 'planned',
      objective: 'Awareness (Reach / ThruPlay)',
      targetAudiens:
        'Broad geo utama (Jakarta, Bandung, Medan, Sumut/Balige), usia 25–55, interest fashion design/textile/heritage (hipotesis awal).',
      daftarKreatif: [
        'Hero Ad (45–60 dtk)',
        'Hero Cutdown (15 dtk)',
        'Founder Story Melfarina (25–35 dtk)',
        'Designer/Product Preview (15–25 dtk)',
      ],
      catatanBilling:
        'Peluncuran hanya setelah minimal 6 konten organik terbit & 3 post ter-pin. Evaluasi wajib di jam ke-48–72.',
      isOrganikSaja: false,
    },
    {
      id: 'flight-tiktok-1',
      kodeFlight: 'TIKTOK-F1',
      namaCampaign:
        skenario === 'hemat'
          ? 'TikTok Organik (Tanpa Paid Spend pada Paket Hemat)'
          : 'TikTok Flight — Discovery & Spark Ads',
      platform: 'tiktok',
      tanggalMulai: '2026-12-04',
      tanggalSelesai: '2026-12-10',
      anggaranHarian: harianTiktokPerAdGroup,
      mataUang: 'IDR',
      jumlahAdGroup: skenario === 'hemat' ? 0 : jumlahAdGroupTiktok,
      cakupanSkenario: ['menengah', 'agresif'],
      status: 'planned',
      objective:
        skenario === 'hemat'
          ? 'Organik 2 video/hari (tanpa top-up iklan)'
          : 'Awareness / Reach / Video Views (Spark Ads bila diizinkan akun)',
      targetAudiens:
        'Dewasa (18+), geografi utama Indonesia (Jakarta, Bandung, Medan, Balige/Toba), interest fashion & budaya lokal.',
      daftarKreatif: [
        'Hero Cutdown (15 dtk)',
        'Founder Story (25–35 dtk)',
        'Product Detail / Macro Ulos (15–25 dtk)',
      ],
      catatanBilling:
        skenario === 'hemat'
          ? 'Paket Efisien berjalan organik 2 video/hari tanpa top-up iklan berbayar.'
          : skenario === 'agresif'
            ? 'Anggaran harian ditetapkan Rp800.000/hari (2 ad groups @Rp400.000/hari) selama 7 hari (4–10 Des). Verifikasi batas minimum Ads Manager sebelum top-up; fallback organik jika tidak memenuhi syarat.'
            : 'Anggaran harian ditetapkan Rp450.000/hari per ad group selama 7 hari (4–10 Des). Verifikasi batas minimum Ads Manager sebelum top-up; fallback organik jika tidak memenuhi syarat.',
      isOrganikSaja: skenario === 'hemat',
    },
  ];

  if (skenario !== 'hemat') {
    flights.push({
      id: 'flight-meta-2',
      kodeFlight: 'META-F2',
      namaCampaign: 'Meta Flight 2 — Collection Preview & Pengingat Kuota',
      platform: 'meta',
      tanggalMulai: '2026-12-11',
      tanggalSelesai: '2026-12-17',
      anggaranHarian: harianMeta,
      mataUang: 'IDR',
      jumlahAdGroup: 1,
      cakupanSkenario: ['menengah', 'agresif'],
      status: 'planned',
      objective: 'Awareness (ThruPlay / Profile Engagement) — tanpa retarget bila audiens belum cukup',
      targetAudiens:
        'Broad geo utama yang dioptimasi ulang berdasarkan evaluasi 2–3 kreatif pemenang dari Meta Flight 1 (pause optimasi 6–10 Des).',
      daftarKreatif: [
        'Kreatif Pemenang Flight 1',
        'Product Close-up & Detail Siluet (15–25 dtk)',
        'Pengingat Kuota Terbatas H-3 s.d. H-1',
      ],
      catatanBilling:
        'Berjalan paralel dengan masa keberangkatan tim owner ke Balige; materi wajib sudah terverifikasi sebelum 11 Desember.',
      isOrganikSaja: false,
    });
  }

  return flights;
}

export const CREATIVE_MATRIX_KANONIK: BarisCreativeMatrix[] = [
  {
    id: 'cr-hero',
    namaKreatif: 'Hero Ad — The Contemporary Heritage Reinterpretation',
    durasi: '45–60 detik (+ cutdown 15 dtk & 6 dtk)',
    format: '9:16 (1080×1920) + safe zone',
    pilar: 'hero',
    platformUtama: 'Meta Reels, TikTok, FB Reels',
    hookUtama: '0–3 dtk: Macro tenun motif Batak Ragi Hotang bertransisi cepat ke siluet busana kontemporer MRS.',
    isiCerita:
      'Memperkenalkan kolaborasi Melfarina Sianipar × Raden Sirait (MRS) serta makna Gala Fashion Show 18 Des 2026 di Balige.',
    ctaAman: 'Ikuti perjalanan Melfarina Sianipar × Raden Sirait (MRS) & daftarkan minat hadir — kuota terbatas.',
    kpiFokus: 'ThruPlay / 6-sec views, video completion, profile visits, dan pencarian nama brand.',
    catatanKesiapan: 'Diproduksi penuh pada Shooting Hari 1 (25 Nov 2026); audio wajib berizin komersial.',
  },
  {
    id: 'cr-founder',
    namaKreatif: 'Founder Story & Standards (Melfarina Sianipar)',
    durasi: '25–35 detik',
    format: '9:16 + subtitle jelas',
    pilar: 'founder',
    platformUtama: 'Meta Ads & TikTok Spark Ads',
    hookUtama: '0–3 dtk: Kutipan autentik alasan menjaga standar Vany Songket & Villa Balige.',
    isiCerita:
      'Menunjukkan standar kualitas nyata, konsistensi bisnis, dan visi realistis membuka akses motif Batak ke ekosistem yang lebih luas.',
    ctaAman: 'Simpan & bagikan cerita; kontak resmi tersedia di bio untuk pertanyaan media/bisnis.',
    kpiFokus: 'Average watch time, saves, shares, dan qualified DM/email dari calon mitra.',
    catatanKesiapan: 'Kutipan wajib berpersetujuan tertulis Melfarina sebelum naik iklan.',
  },
  {
    id: 'cr-designer',
    namaKreatif: 'Designer Proof & Craft Direction (Raden Sirait)',
    durasi: '15–25 detik',
    format: '9:16 + arsip sketsa/portofolio terizin',
    pilar: 'designer',
    platformUtama: 'Meta Ads (Instagram Reels / FB)',
    hookUtama: '0–3 dtk: Sketsa konstruksi pola bertemu motif tradisional Batak.',
    isiCerita:
      'Membuktikan kredibilitas desain melalui proses kerja terukur dan arsip karya terverifikasi tanpa klaim berlebih.',
    ctaAman: 'Lihat portofolio Raden Sirait & kolaborasi bersama Melfarina Sianipar di profil resmi MRS.',
    kpiFokus: 'Klik profil, interaksi akun industri fashion, dan komentar substantif.',
    catatanKesiapan: 'Arsip portofolio/foto wajib memiliki izin hak tayang dari Raden Sirait.',
  },
  {
    id: 'cr-product',
    namaKreatif: 'Product Close-up & Heritage Material Detail',
    durasi: '15–25 detik',
    format: '9:16 macro lighting editorial',
    pilar: 'product',
    platformUtama: 'Meta Flight 2 & TikTok',
    hookUtama: '0–3 dtk: Detail jahitan, tekstur kain, dan finishing busana pada close-up.',
    isiCerita:
      'Menjawab keingintahuan buyer & kurator atas kesiapan material, struktur drape, serta kehalusan pengerjaan.',
    ctaAman: 'Hubungi kontak resmi untuk permintaan lookbook atau diskusi kemitraan.',
    kpiFokus: 'Saves, shares, permintaan lookbook/katalog, dan minat buyer/ritel.',
    catatanKesiapan: 'Wajib direkam & difinalkan sebelum keberangkatan tim ke Balige (< 11 Des 2026).',
  },
];

export const STATE_AWAL_IKLAN_ANGGARAN: StateIklanAnggaran = {
  skenarioAktif: 'menengah',
  kursPlanningUsdIdr: KURS_PLANNING_USD_IDR_KANONIK,
  daftarFlight: buatDaftarFlightDefault('menengah'),
  creativeMatrix: CREATIVE_MATRIX_KANONIK,
  persetujuanAktif: null,
  riwayatPersetujuan: [],
  daftarBelanjaAktual: [],
};
