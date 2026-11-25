import type {
  DataKonfirmasiV11,
  LevelFunnelStrategi,
  PesanIntiStrategi,
  PilarKontenStrategi,
  SegmenStakeholderStrategi,
} from '../types/rencana';
import type { RisikoKeputusanItem } from '../types/beranda';

export const FUNNEL_KAMPANYE_KANONIK: LevelFunnelStrategi[] = [
  {
    id: 'funnel-attention',
    level: 'Attention',
    tujuanKomunikasi: 'Membuat orang mengenali nama event, tema, dan visual karya.',
    aksiDiharapkan: 'Menonton, berhenti scroll, membagikan, dan mengingat kolaborasi Melfarina Sianipar × Raden Sirait (MRS).',
  },
  {
    id: 'funnel-interest',
    level: 'Interest',
    tujuanKomunikasi: 'Membuat audiens memahami alasan kolaborasi dan makna produk.',
    aksiDiharapkan: 'Menonton video owner/desainer, membuka profil, dan menyimpan konten.',
  },
  {
    id: 'funnel-trust',
    level: 'Trust',
    tujuanKomunikasi: 'Menunjukkan pengalaman owner, kualitas proses, portofolio, dan keseriusan rencana.',
    aksiDiharapkan: 'Memeriksa portofolio, mengunjungi profil, dan mengirim pertanyaan substantif.',
  },
  {
    id: 'funnel-relationship',
    level: 'Relationship',
    tujuanKomunikasi: 'Mendorong koneksi dengan buyer, media, fashion leaders, institusi, dan calon mitra.',
    aksiDiharapkan: 'DM/email berkualitas, permintaan presentasi, permintaan lookbook, meeting, dan referral.',
  },
  {
    id: 'funnel-launch',
    level: 'Launch readiness',
    tujuanKomunikasi: 'Membuat calon audiens mengenali brand/produk baru ketika identitasnya dirilis.',
    aksiDiharapkan: 'Mencari nama brand, mengikuti kanal brand, dan meminta katalog atau informasi kerja sama.',
  },
];

export const SEGMEN_STAKEHOLDER_KANONIK: SegmenStakeholderStrategi[] = [
  {
    id: 'segmen-a-commercial',
    prioritas: 'A',
    labelPrioritas: 'A – Commercial',
    segmen: 'Pemilik brand fashion, buyer, distributor, retailer premium, butik, fashion entrepreneur, sourcing/procurement tekstil.',
    kepentinganPesan: 'Potensi produk, konsistensi mutu, desain, kapasitas, margin/kemitraan, katalog/lookbook, dan cara tindak lanjut.',
    jalurPendekatan: 'LinkedIn/Instagram direct outreach, email bisnis, undangan terkurasi, meeting pasca-event.',
  },
  {
    id: 'segmen-a-influence',
    prioritas: 'A',
    labelPrioritas: 'A – Influence',
    segmen: 'Desainer fashion, stylist, fashion director, figur publik aktif di bidang fashion, fotografer/editorial, fashion media.',
    kepentinganPesan: 'Kekuatan konsep, kualitas karya, cerita visual, diferensiasi motif, peluang editorial/kolaborasi.',
    jalurPendekatan: 'Personalized DM/email, press kit, partner amplification, undangan VIP.',
  },
  {
    id: 'segmen-a-institution',
    prioritas: 'A',
    labelPrioritas: 'A – Institution',
    segmen: 'Pemangku kebijakan ekonomi kreatif, kebudayaan, pariwisata, perdagangan, asosiasi, lembaga promosi ekspor, dan institusi budaya.',
    kepentinganPesan: 'Kontribusi pada pelestarian warisan, ekonomi kreatif, pengembangan produk, peluang promosi, dan kemitraan.',
    jalurPendekatan: 'Surat resmi, proposal singkat, briefing stakeholder, dan undangan protokoler.',
  },
  {
    id: 'segmen-b-cultural',
    prioritas: 'B',
    labelPrioritas: 'B – Cultural ecosystem',
    segmen: 'Penenun/pengrajin, komunitas Batak, diaspora, akademisi, kurator, museum, pemerhati wastra/heritage.',
    kepentinganPesan: 'Akurasi representasi budaya, penghargaan terhadap pembuat kain, kesinambungan tradisi, dan nilai simbolik.',
    jalurPendekatan: 'Kolaborasi konten, wawancara, komunitas, kredensial narasumber.',
  },
  {
    id: 'segmen-c-public',
    prioritas: 'C',
    labelPrioritas: 'C – Public awareness',
    segmen: 'Pecinta fashion, pengguna busana tradisional, audiens budaya Indonesia, calon pengikut brand baru.',
    kepentinganPesan: 'Cerita yang menarik, visual produk, identitas budaya, dan perkembangan brand.',
    jalurPendekatan: 'Reels/TikTok organik, Meta awareness, hashtag, dan share lintas akun.',
  },
];

export const PESAN_INTI_KANONIK: PesanIntiStrategi[] = [
  {
    id: 'pesan-heritage',
    judul: 'Heritage, reinterpreted',
    rumusan: 'Motif dan warisan tekstil Batak dapat hadir dalam bahasa desain kontemporer.',
    buktiWajib: 'Foto detail tekstil, narasumber budaya, penjelasan motif dari sumber tepercaya/pengrajin, dan dokumentasi proses.',
  },
  {
    id: 'pesan-founder',
    judul: 'Founder credibility',
    rumusan: 'Melfarina Sianipar membangun bisnis dan ekosistem Vany Songket & Villa Balige dengan visi mengembangkan karya berbasis tekstil.',
    buktiWajib: 'Profil usaha, foto tempat/produk, tahun mulai, rekam jejak, dokumentasi pelanggan/mitra yang diizinkan, kisah yang dapat diverifikasi.',
  },
  {
    id: 'pesan-designer',
    judul: 'Designer credibility',
    rumusan: 'Raden Sirait membawa perspektif desain dan pengalaman profesional ke kolaborasi ini.',
    buktiWajib: 'Portofolio resmi, koleksi terdahulu, liputan, penghargaan/pertunjukan yang dapat dicek, persetujuan penggunaan foto karya.',
  },
  {
    id: 'pesan-product',
    judul: 'Product readiness',
    rumusan: 'Koleksi dikembangkan sebagai produk busana, bukan hanya kostum panggung.',
    buktiWajib: 'Foto produk, detail material, finishing, ukuran, kualitas jahitan, kesiapan produksi dan model bisnis yang benar.',
  },
  {
    id: 'pesan-international',
    judul: 'International ambition',
    rumusan: 'Proyek ini ingin membuka ruang bagi motif Batak di jaringan fashion lebih luas.',
    buktiWajib: 'Rencana bisnis, target pasar, lookbook, kesiapan produksi, standar kualitas, jaringan distribusi, dan materi bahasa Inggris.',
  },
];

export const PILAR_KONTEN_KANONIK: PilarKontenStrategi[] = [
  {
    id: 'founder',
    nama: 'Founder / Melfarina',
    proporsiPersen: 30,
    contohMateri: 'Kisah merintis Vany Songket & Villa Balige, visi, keputusan bisnis, standar kerja, tantangan, dan alasan membuat kolaborasi.',
    peranStrategis: 'Trust dan personal brand.',
  },
  {
    id: 'designer',
    nama: 'Designer / Raden Sirait',
    proporsiPersen: 20,
    contohMateri: 'Portofolio terverifikasi, filosofi desain, sketsa ke busana, potongan wawancara, dan referensi koleksi.',
    peranStrategis: 'Authority dan proof of design.',
  },
  {
    id: 'heritage',
    nama: 'Heritage / Motif Batak Ragi Hotang',
    proporsiPersen: 20,
    contohMateri: 'Detail motif, nilai budaya, susunan benang/tekstur, konteks penggunaan, serta dialog tradisi dan desain modern.',
    peranStrategis: 'Differentiation dan kedalaman cerita.',
  },
  {
    id: 'product',
    nama: 'Product / Collection Preview',
    proporsiPersen: 20,
    contohMateri: 'Detail bahan, siluet, tekstur, finishing, styling Ghivany, dan sneak peek koleksi.',
    peranStrategis: 'Desire dan product awareness.',
  },
  {
    id: 'event',
    nama: 'Event / Collaboration / Vision',
    proporsiPersen: 10,
    contohMateri: 'Pengumuman resmi, kisah kolaborasi, tujuan jangka panjang, countdown, ajakan daftar kuota terbatas, serta informasi press/partner.',
    peranStrategis: 'Event notice dan action.',
  },
];

export const STRUKTUR_STORYTELLING_VIDEO = [
  { segmen: '0–3 detik', peran: 'Hook', arahan: 'Satu pertanyaan, pernyataan kuat, detail kain yang memancing rasa ingin tahu, atau ekspresi talent. Hindari intro logo panjang.' },
  { segmen: '3–12 detik', peran: 'Cerita', arahan: 'Siapa yang berbicara dan apa persoalannya; gunakan bahasa natural dan fokus satu gagasan per video.' },
  { segmen: '12–25 detik', peran: 'Bukti Visual', arahan: 'Tunjukkan foto proses, tekstur kain, detail busana, arsip karya berizin, atau contoh konkret.' },
  { segmen: '25–35 detik', peran: 'Penutup & CTA', arahan: 'Simpulkan satu pesan inti dan beri CTA sesuai tahap funnel (ikuti, simpan, bagikan, lihat profil, atau kontak resmi).' },
] as const;

export const RISIKO_LENGKAP_KANONIK: RisikoKeputusanItem[] = [
  {
    id: 'r-01',
    judul: 'Pendaftar umum mengira kuota terbatas langsung menjamin kursi tanpa konfirmasi',
    dampak: 'Pendaftar datang tanpa konfirmasi resmi; membebani kapasitas venue, protokol, dan kurasi tamu strategis.',
    mitigasi: 'Di seluruh materi kampanye cukup sampaikan pendaftaran "Kuota Terbatas" tanpa menyebut verifikasi Admin. Secara internal, Admin melakukan penyaringan di balik layar agar detail lokasi & pas masuk hanya dikirim kepada tamu terpilih.',
  },
  {
    id: 'r-02',
    judul: 'Klaim owner/desainer tidak didukung bukti tertulis',
    dampak: 'Kepercayaan turun drastis apabila diverifikasi oleh media, buyer, atau institusi.',
    mitigasi: 'Buat claim sheet; setiap pencapaian wajib diberi sumber/dokumen pendukung atau dihapus dari materi publik.',
  },
  {
    id: 'r-03',
    judul: 'Hak cipta foto, musik, dan karya arsip tidak jelas',
    dampak: 'Konten terkena takedown, iklan ditolak Ads Manager, atau memicu sengketa hukum.',
    mitigasi: 'Gunakan hanya aset milik sendiri/berizin tertulis dan musik berlisensi komersial untuk iklan.',
  },
  {
    id: 'r-04',
    judul: 'Volume 66 master konten terlalu padat untuk kapasitas edit',
    dampak: 'Posting terlambat, kualitas video/desain menurun, dan burnout tim produksi.',
    mitigasi: 'Terapkan batch filming 3 hari (1 hari syuting iklan 25 Nov + 2 hari syuting short konten 30 Nov & 3 Des), 4 template desain, cutdown wawancara panjang, buffer edit 3–4 hari, dan stok cadangan.',
  },
  {
    id: 'r-05',
    judul: 'Owner & Ghivany tidak tersedia setelah 11 Desember (berangkat ke Balige)',
    dampak: 'Kehilangan materi real-time dan keterlambatan persetujuan konten.',
    mitigasi: 'Tuntaskan seluruh rekaman Melfarina dan Ghivany sebelum 11 Desember; tunjuk PIC onsite untuk kiriman materi dan alur approval via chat.',
  },
  {
    id: 'r-06',
    judul: 'Targeting terlalu luas sehingga paid reach tidak relevan',
    dampak: 'Views terlihat tinggi tetapi tidak menghasilkan interaksi dari ekosistem fashion/stakeholder.',
    mitigasi: 'Pisahkan paid awareness publik dari direct outreach VIP; monitor breakdown geografi, save/share, dan qualified inquiry.',
  },
  {
    id: 'r-07',
    judul: 'TikTok Ads tidak berjalan pada anggaran mikro',
    dampak: 'Campaign tidak delivery atau tertolak ambang minimum Ads Manager (USD 50 campaign / USD 20 ad group).',
    mitigasi: 'Verifikasi minimum budget langsung di TikTok Ads Manager sebelum top-up; gunakan jalur TikTok organik penuh bila berada di bawah ambang.',
  },
  {
    id: 'r-08',
    judul: 'Ekspektasi “booming / viral” dianggap hasil yang dapat dijamin',
    dampak: 'Ekspektasi tidak realistis dan keputusan anggaran yang reaktif.',
    mitigasi: 'Komitmen pada proses terukur, kualitas bukti, KPI baseline 72 jam pertama, dan eksekusi konsisten.',
  },
];

export const DATA_KONFIRMASI_V11_KANONIK: DataKonfirmasiV11[] = [
  {
    id: 'konf-01',
    dataBelumAda: 'Finalisasi jadwal rilis resmi rencana brand kolaborasi MRS (Melfarina Raden Sirait)',
    alasanPenting: 'Menentukan apakah nama brand MRS dibuka sebelum atau setelah 18 Desember (memengaruhi konten 13 Desember) dan penyesuaian arah akun.',
    pemilikData: 'Owner',
    status: 'not-configured',
  },
  {
    id: 'konf-02',
    dataBelumAda: 'Kategori produk, range harga, kapasitas produksi, MOQ, dan model order',
    alasanPenting: 'Menentukan buyer persona, positioning produk, CTA bisnis, dan kesiapan ekspansi pasar.',
    pemilikData: 'Owner / Product',
    status: 'not-configured',
  },
  {
    id: 'konf-03',
    dataBelumAda: 'Target negara/kota/pasar dan buyer utama',
    alasanPenting: 'Menentukan bahasa materi, geografi iklan lanjutan, target media, daftar buyer, dan kesiapan go-international.',
    pemilikData: 'Owner / Business',
    status: 'not-configured',
  },
  {
    id: 'konf-04',
    dataBelumAda: 'Kompetitor atau brand pembanding',
    alasanPenting: 'Menyusun diferensiasi pesan, standar visual, dan positioning yang akurat.',
    pemilikData: 'Owner / Digital Manager',
    status: 'not-configured',
  },
  {
    id: 'konf-05',
    dataBelumAda: 'Portofolio resmi Melfarina & Raden Sirait beserta bukti pencapaian',
    alasanPenting: 'Menentukan materi kredibilitas yang aman dan sah untuk dipublikasikan.',
    pemilikData: 'Melfarina & Raden Sirait',
    status: 'not-configured',
  },
  {
    id: 'konf-06',
    dataBelumAda: 'Foto, video, logo final, kode warna, product samples, dan izin penggunaan tertulis',
    alasanPenting: 'Mempercepat produksi konten dan menghindari pelanggaran hak cipta.',
    pemilikData: 'Tim Brand',
    status: 'not-configured',
  },
  {
    id: 'konf-07',
    dataBelumAda: 'Daftar prioritas tamu (VIP, media, buyer, institusi, sponsor) dan kriteria kurasi internal',
    alasanPenting: 'Menjadi acuan internal Admin di balik layar saat menyeleksi pendaftar kuota terbatas agar konfirmasi undangan tetap terfokus pada pihak strategis.',
    pemilikData: 'PIC Stakeholder',
    status: 'not-configured',
  },
  {
    id: 'konf-08',
    dataBelumAda: 'Plafon anggaran maksimum yang disetujui dan metode pembayaran iklan',
    alasanPenting: 'Mengunci jadwal flight Meta/TikTok, top-up, dan batas belanja harian.',
    pemilikData: 'Owner / Finance',
    status: 'not-configured',
  },
  {
    id: 'konf-09',
    dataBelumAda: 'Kota & lokasi shooting pasti, jam talent, serta ketersediaan Raden Sirait',
    alasanPenting: 'Mengunci agenda 3 hari shooting: Hari 1 syuting iklan (25 Nov) serta Hari 2 & 3 syuting short konten (30 Nov & 3 Des).',
    pemilikData: 'Production Coordinator',
    status: 'not-configured',
  },
  {
    id: 'konf-10',
    dataBelumAda: 'Kontak resmi press, kemitraan bisnis, dan undangan',
    alasanPenting: 'Agar CTA mengarah ke kontak resmi organisasi dan tidak menumpuk di akun pribadi.',
    pemilikData: 'Owner / Secretariat',
    status: 'not-configured',
  },
];
