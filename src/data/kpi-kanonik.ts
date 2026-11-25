import type {
  DefinisiMetrikKpi,
  GrupKpi,
  PlatformKpi,
  SnapshotKpiAktual,
  StateKpiMonitoring,
} from '../types/kpi';

export interface InfoGrupKpi {
  id: GrupKpi;
  nama: string;
  caraMembaca: string;
}

export const INFO_GRUP_KPI_KANONIK: InfoGrupKpi[] = [
  {
    id: 'awareness',
    nama: 'Jangkauan (Awareness)',
    caraMembaca:
      'Mengukur seberapa luas konten menjangkau orang baru dan apakah pembuka 3 detik pertama mampu menahan penonton.',
  },
  {
    id: 'interest',
    nama: 'Ketertarikan (Interest)',
    caraMembaca:
      'Mengukur ketertarikan lanjutan audiens lewat simpan (saves), bagikan (shares), dan kunjungan profil.',
  },
  {
    id: 'trust',
    nama: 'Kepercayaan (Trust)',
    caraMembaca:
      'Mengukur interaksi bermakna dari pelaku fashion, media, atau calon mitra yang relevan.',
  },
  {
    id: 'relationship',
    nama: 'Peluang Relasi',
    caraMembaca:
      'Mengukur pesan masuk yang berlanjut menjadi komunikasi bisnis nyata dan undangan.',
  },
  {
    id: 'brand-readiness',
    nama: 'Kesiapan Brand',
    caraMembaca:
      'Mengukur permintaan katalog, pencarian nama brand, dan minat kemitraan untuk rilis berikutnya.',
  },
];

export const DEFINISI_METRIK_KPI_KANONIK: DefinisiMetrikKpi[] = [
  // Awareness
  {
    kode: 'unique_reach',
    nama: 'Jangkauan Akun Unik',
    grup: 'awareness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Jumlah orang/akun berbeda yang melihat konten atau iklan.',
  },
  {
    kode: 'impressions',
    nama: 'Total Tayangan (Impressions)',
    grup: 'awareness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Total penayangan konten atau iklan di layar audiens.',
  },
  {
    kode: 'frequency',
    nama: 'Frekuensi Tayang',
    grup: 'awareness',
    satuan: 'rasio',
    agregasi: 'rata-rata',
    keterangan: 'Rata-rata berapa kali satu akun melihat iklan yang sama.',
  },
  {
    kode: 'cpm',
    nama: 'Biaya per 1.000 Tayangan (CPM)',
    grup: 'awareness',
    satuan: 'idr',
    agregasi: 'rata-rata',
    keterangan: 'Biaya rata-rata untuk setiap 1.000 tayangan iklan.',
  },
  {
    kode: 'video_starts',
    nama: 'Pemutaran Awal Video',
    grup: 'awareness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Jumlah pemutaran video dimulai.',
  },
  {
    kode: 'views_3s',
    nama: 'Tontonan 3 Detik',
    grup: 'awareness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Penonton yang bertahan melewati pembuka 3 detik pertama.',
  },
  {
    kode: 'thruplay_6s',
    nama: 'Tontonan 6 Detik / Penuh',
    grup: 'awareness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Penonton yang bertahan minimal 6 detik atau selesai penuh.',
  },

  // Interest
  {
    kode: 'avg_watch_time',
    nama: 'Rata-rata Durasi Tonton (detik)',
    grup: 'interest',
    satuan: 'detik',
    agregasi: 'rata-rata',
    keterangan: 'Rata-rata lama menonton per pemutaran video.',
  },
  {
    kode: 'video_completion',
    nama: 'Persentase Tonton Selesai (%)',
    grup: 'interest',
    satuan: 'persen',
    agregasi: 'rata-rata',
    keterangan: 'Persentase penonton yang melihat video sampai selesai.',
  },
  {
    kode: 'profile_visits',
    nama: 'Kunjungan Profil',
    grup: 'interest',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Kunjungan langsung ke halaman profil resmi Melfarina Sianipar × Raden Sirait (MRS).',
  },
  {
    kode: 'profile_activity',
    nama: 'Aktivitas di Profil',
    grup: 'interest',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Klik tautan bio, ikuti akun, atau tombol pesan.',
  },
  {
    kode: 'saves',
    nama: 'Simpan Konten (Saves)',
    grup: 'interest',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Jumlah konten yang disimpan audiens.',
  },
  {
    kode: 'shares',
    nama: 'Bagikan Konten (Shares)',
    grup: 'interest',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Jumlah konten yang dibagikan ke pesan atau Stories.',
  },

  // Trust
  {
    kode: 'substantive_comments',
    nama: 'Komentar Bermakna',
    grup: 'trust',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Komentar tentang karya, bahan ulos, cerita, atau kolaborasi.',
  },
  {
    kode: 'industry_engagement',
    nama: 'Interaksi Pelaku Industri',
    grup: 'trust',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Interaksi dari desainer, redaksi media, buyer, atau pengrajin.',
  },
  {
    kode: 'mentions',
    nama: 'Sebutan & Liputan Media',
    grup: 'trust',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Penyebutan akun resmi atau liputan media.',
  },
  {
    kode: 'inbound_media_partner',
    nama: 'Pesan Masuk Media / Mitra',
    grup: 'trust',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Pesan awal dari jurnalis atau calon mitra kolaborasi.',
  },
  {
    kode: 'portfolio_clicks',
    nama: 'Klik Portofolio',
    grup: 'trust',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Klik menuju portofolio desainer atau profil kolaborasi.',
  },

  // Relationship
  {
    kode: 'qualified_dm_email',
    nama: 'DM / Email Peluang Sah',
    grup: 'relationship',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Pesan bisnis, media, atau institusi yang dinilai layak ditindaklanjuti.',
  },
  {
    kode: 'meeting_lookbook_request',
    nama: 'Permintaan Pertemuan / Lookbook',
    grup: 'relationship',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Permintaan resmi presentasi, lookbook, atau jadwal bertemu.',
  },
  {
    kode: 'referrals',
    nama: 'Rekomendasi Jaringan',
    grup: 'relationship',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Perkenalan ke pihak baru melalui relasi yang sudah dikenal.',
  },
  {
    kode: 'outreach_replies',
    nama: 'Balasan Undangan Langsung',
    grup: 'relationship',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Respons positif dari daftar tamu VIP, buyer, atau media.',
  },
  {
    kode: 'stakeholder_rsvp',
    nama: 'Konfirmasi Hadir Tamu Privat',
    grup: 'relationship',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Konfirmasi kehadiran tamu undangan khusus.',
  },

  // Brand Readiness
  {
    kode: 'brand_searches',
    nama: 'Pencarian Nama Brand',
    grup: 'brand-readiness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Pencarian langsung nama Melfarina Sianipar, Raden Sirait, maupun rencana brand MRS.',
  },
  {
    kode: 'relevant_followers',
    nama: 'Pengikut Baru yang Relevan',
    grup: 'brand-readiness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Pertambahan pengikut dari kalangan fashion, wastra, dan media.',
  },
  {
    kode: 'catalog_requests',
    nama: 'Permintaan Katalog',
    grup: 'brand-readiness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Permintaan daftar koleksi, detail kain, atau kisaran harga.',
  },
  {
    kode: 'buyer_interest',
    nama: 'Minat Buyer / Butik',
    grup: 'brand-readiness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Ketertarikan pembelian atau titip jual dari butik maupun toko.',
  },
  {
    kode: 'partnership_inquiry',
    nama: 'Pertanyaan Produksi / Kemitraan',
    grup: 'brand-readiness',
    satuan: 'angka',
    agregasi: 'jumlah',
    keterangan: 'Pertanyaan seputar kapasitas produksi atau kerja sama pasca-acara.',
  },
];

export const OPSI_PLATFORM_KPI: Array<{ nilai: PlatformKpi; label: string }> = [
  { nilai: 'instagram', label: 'Instagram Organik' },
  { nilai: 'facebook', label: 'Facebook Page Organik' },
  { nilai: 'tiktok', label: 'TikTok Organik' },
  { nilai: 'meta-ads', label: 'Meta Ads Manager' },
  { nilai: 'tiktok-ads', label: 'TikTok Ads Manager' },
  { nilai: 'direct-outreach', label: 'Outreach / DM / Email Resmi' },
  { nilai: 'analytics', label: 'Search / Web / Analytics' },
];

export const OPSI_PILAR_KPI: Array<{
  nilai: 'founder' | 'designer' | 'heritage' | 'product' | 'event';
  label: string;
}> = [
  { nilai: 'founder', label: 'Founder / Melfarina (30%)' },
  { nilai: 'designer', label: 'Designer / Raden (20%)' },
  { nilai: 'heritage', label: 'Heritage / Motif Ragi Hotang (20%)' },
  { nilai: 'product', label: 'Product / Collection (20%)' },
  { nilai: 'event', label: 'Event / Vision (10%)' },
];

export const RITME_MONITORING_KANONIK = [
  {
    kapan: 'Setiap Hari',
    pemeriksaan:
      'Status tayang, kualitas audio & gambar, komentar/DM masuk, dan belanja iklan harian.',
    keputusan:
      'Perbaiki kendala teknis, balas pesan relevan, dan jeda iklan jika ada fakta yang perlu dikoreksi.',
  },
  {
    kapan: 'Setiap 48–72 Jam',
    pemeriksaan:
      'Daya tarik 3 detik pertama, durasi tonton, biaya per tayangan, simpan/bagikan, dan kunjungan profil.',
    keputusan:
      'Ubah 1–2 hal saja secara bertahap dan pertahankan konten dengan hasil terbaik.',
  },
  {
    kapan: 'Setiap Akhir Periode Iklan',
    pemeriksaan:
      'Ringkasan belanja, jangkauan, kunjungan profil, 5 konten terbaik, dan peluang pesan masuk.',
    keputusan:
      'Pilih konten, kota, dan pesan terbaik untuk dipakai lagi pada periode berikutnya.',
  },
  {
    kapan: '18–22 Des 2026',
    pemeriksaan:
      'Dokumentasi acara, liputan media, daftar tamu hadir, dan kontak tindak lanjut.',
    keputusan:
      'Kirim rekap 24 jam, materi pers resmi, dan tindak lanjut personal ke tamu serta mitra.',
  },
] as const;

export const DEFINISI_QUALIFIED_INQUIRY_KANONIK = [
  {
    judul: 'Fokus pada Kualitas Peluang',
    deskripsi:
      'Keberhasilan diukur dari pesan peluang yang nyata dan siap ditindaklanjuti, bukan sekadar banyaknya like atau komentar umum.',
  },
  {
    judul: 'Syarat Peluang Sah',
    deskripsi:
      'Memuat identitas pengirim/instansi yang jelas (buyer, butik, media, kurator, atau calon mitra) serta tujuan komunikasi yang konkret.',
  },
  {
    judul: 'Pesan Umum / Pertanyaan Tiket',
    deskripsi:
      'Pertanyaan tiket umum tetap dicatat sebagai pesan biasa dan dijawab sopan bahwa acara bersifat undangan khusus.',
  },
] as const;

export const HEADER_CSV_KPI_TEMPLATE =
  'periode,platform,metrik,nilai,kampanye_konten,pilar,sumber,tanggal_laporan,pic,catatan\n';

// Data awal WAJIB kosong sesuai ketentuan kanonik (no invented actuals / benchmarks)
export const STATE_AWAL_KPI_MONITORING: StateKpiMonitoring = {
  daftarSnapshot: [],
  baseline72Jam: null,
  daftarInquiry: [],
};

// Hanya dipakai bila pengguna mengaktifkan "Mode Contoh (Simulasi UI)" secara eksplisit dan TIDAK disimpan
export const SNAPSHOT_CONTOH_SIMULASI: SnapshotKpiAktual[] = [
  {
    id: 'sample-1',
    grup: 'awareness',
    kodeMetrik: 'unique_reach',
    platform: 'meta-ads',
    periode: '2026-12-01',
    kampanyeAtauKonten: 'Meta Flight 1 — Hero Ad 45s',
    pilar: 'heritage',
    nilai: 18400,
    source: 'Data Contoh Simulasi UI',
    reportedAt: '2026-12-02',
    importedAt: '2026-12-02T10:00:00.000Z',
    pic: 'Simulasi',
    notes: 'Hanya pratinjau format grafik — bukan kinerja nyata MRS (Melfarina × Raden Sirait).',
    dataContoh: true,
  },
  {
    id: 'sample-2',
    grup: 'awareness',
    kodeMetrik: 'unique_reach',
    platform: 'meta-ads',
    periode: '2026-12-04',
    periodePembanding: '2026-12-01',
    kampanyeAtauKonten: 'Meta Flight 1 — Founder Story',
    pilar: 'founder',
    nilai: 24600,
    source: 'Data Contoh Simulasi UI',
    reportedAt: '2026-12-05',
    importedAt: '2026-12-05T10:00:00.000Z',
    pic: 'Simulasi',
    notes: 'Hanya pratinjau format grafik — bukan kinerja nyata MRS (Melfarina × Raden Sirait).',
    dataContoh: true,
  },
  {
    id: 'sample-3',
    grup: 'interest',
    kodeMetrik: 'profile_visits',
    platform: 'instagram',
    periode: '2026-12-01',
    kampanyeAtauKonten: 'IG Reels — Soft Announcement',
    pilar: 'event',
    nilai: 310,
    source: 'Data Contoh Simulasi UI',
    reportedAt: '2026-12-02',
    importedAt: '2026-12-02T10:00:00.000Z',
    pic: 'Simulasi',
    notes: 'Hanya pratinjau format grafik — bukan kinerja nyata.',
    dataContoh: true,
  },
];
