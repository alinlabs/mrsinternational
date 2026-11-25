import type {
  ChannelOutreach,
  FilterStakeholder,
  KategoriStakeholder,
  PrioritasStakeholder,
  RecordStakeholder,
  StatusPipelineOutreach,
} from '../types/stakeholder';

// Seed CRM wajib kosong: dilarang membuat nama VIP, pejabat, media, atau RSVP palsu.
export const SEED_STAKEHOLDER_KOSONG: RecordStakeholder[] = [];

export const KATEGORI_STAKEHOLDER_KANONIK: Array<{
  nilai: KategoriStakeholder;
  label: string;
  prioritasDefault: PrioritasStakeholder;
  fokusPesan: string;
}> = [
  {
    nilai: 'commercial',
    label: 'A — Commercial (Buyer / Brand / Retail)',
    prioritasDefault: 'A',
    fokusPesan: 'Potensi produk, mutu tenun, desain kontemporer, kapasitas produksi, dan peluang kemitraan/katalog.',
  },
  {
    nilai: 'influence',
    label: 'A — Influence (Desainer / Stylist / Media)',
    prioritasDefault: 'A',
    fokusPesan: 'Konsep contemporary heritage reinterpretation, kualitas karya, diferensiasi visual, dan editorial.',
  },
  {
    nilai: 'institution',
    label: 'A — Institution (Ekonomi Kreatif / Budaya / Asosiasi)',
    prioritasDefault: 'A',
    fokusPesan: 'Pelestarian warisan tekstil Batak, penguatan ekonomi kreatif, dan dukungan promosi budaya.',
  },
  {
    nilai: 'cultural-ecosystem',
    label: 'B — Cultural Ecosystem (Penenun / Akademisi / Kurator)',
    prioritasDefault: 'B',
    fokusPesan: 'Akurasi budaya motif Batak Ragi Hotang, penghargaan bagi pengrajin kain, dan kesinambungan tradisi.',
  },
  {
    nilai: 'public-awareness',
    label: 'C — Public Awareness (Komunitas & Pemerhati Fashion)',
    prioritasDefault: 'C',
    fokusPesan: 'Storytelling heritage, pengenalan identitas budaya, dan informasi pendaftaran kuota terbatas.',
  },
];

export const PRIORITAS_STAKEHOLDER_KANONIK: Array<{
  nilai: PrioritasStakeholder;
  label: string;
  keterangan: string;
}> = [
  { nilai: 'A', label: 'Prioritas A (Strategis Inti)', keterangan: 'Commercial, Influence & Institution utama — pendekatan personal langsung.' },
  { nilai: 'B', label: 'Prioritas B (Ekosistem Budaya)', keterangan: 'Penenun, kurator, akademisi, dan komunitas diaspora.' },
  { nilai: 'C', label: 'Prioritas C (Kesadaran Publik)', keterangan: 'Komunitas fashion & budaya umum yang mengikuti dokumentasi.' },
];

export const PIPELINE_OUTREACH_KANONIK: Array<{
  nilai: StatusPipelineOutreach;
  label: string;
  nada: 'netral' | 'emas' | 'maroon' | 'hijau' | 'peringatan' | 'bahaya';
}> = [
  { nilai: 'identified', label: 'Identified (Teridentifikasi)', nada: 'netral' },
  { nilai: 'qualified', label: 'Qualified (Terverifikasi Relevan)', nada: 'emas' },
  { nilai: 'contacted', label: 'Contacted (Sudah Dihubungi)', nada: 'maroon' },
  { nilai: 'replied', label: 'Replied (Merespons)', nada: 'hijau' },
  { nilai: 'meeting-requested', label: 'Meeting / Lookbook Requested', nada: 'hijau' },
  { nilai: 'ongoing', label: 'Ongoing Relationship', nada: 'hijau' },
  { nilai: 'closed-lost', label: 'Closed / Tidak Lanjut', nada: 'peringatan' },
];

export const CHANNEL_OUTREACH_KANONIK: Array<{
  nilai: ChannelOutreach;
  label: string;
}> = [
  { nilai: 'email', label: 'Email Resmi' },
  { nilai: 'whatsapp', label: 'WhatsApp Direct' },
  { nilai: 'instagram-dm', label: 'Instagram DM' },
  { nilai: 'telepon', label: 'Telepon / Panggilan' },
  { nilai: 'pertemuan', label: 'Pertemuan Langsung' },
  { nilai: 'lainnya', label: 'Kanal Lainnya' },
];

export const FILTER_STAKEHOLDER_DEFAULT: FilterStakeholder = {
  kataKunci: '',
  kategori: 'semua',
  prioritas: 'semua',
  statusPipeline: 'semua',
  urutan: 'skor-tertinggi',
};

export const TEMPLATE_OUTREACH_KANONIK: Array<{
  id: string;
  judul: string;
  segmen: string;
  subjek: string;
  isi: string;
}> = [
  {
    id: 'tpl-commercial',
    judul: 'Pendekatan Buyer / Retailer / Mitra Komersial',
    segmen: 'Commercial (Prioritas A)',
    subjek: 'Undangan Privat & Pratinjau Koleksi: Melfarina Sianipar × Raden Sirait (MRS) — 18 Des 2026 (Balige)',
    isi: `Yth. [Nama & Jabatan],\n\nPerkenalkan, kami dari tim kolaborasi Melfarina Sianipar (Vany Songket & Villa Balige) bersama desainer Raden Sirait — dengan rencana brand kolaborasi MRS.\n\nPada 18 Desember 2026 di Balige, kami menyelenggarakan presentasi privat "Melfarina Sianipar × Raden Sirait: The Contemporary Heritage Reinterpretation" untuk memperkenalkan reinterpretasi busana kontemporer bermotif Batak Ragi Hotang beserta kesiapan koleksi barunya.\n\nMengingat relevansi [Organisasi] dalam ekosistem ritel/kurasi mode, kami ingin mengirimkan lookbook digital dan membuka diskusi awal mengenai potensi kolaborasi atau kurasi pasca-acara.\n\nApakah Anda bersedia menerima ringkasan profil koleksi minggu ini? (Acara bersifat private / by invitation only).\n\nHormat kami,\n[Nama PIC Outreach]`,
  },
  {
    id: 'tpl-influence',
    judul: 'Pendekatan Media / Fashion Editor / Stylist',
    segmen: 'Influence & Media (Prioritas A)',
    subjek: 'Press Brief Privat: Kolaborasi Melfarina Sianipar × Raden Sirait (MRS)',
    isi: `Halo [Nama / Tim Redaksi],\n\nKami ingin berbagi catatan pers mengenai kolaborasi budaya dan fashion Melfarina Sianipar × Raden Sirait (MRS) — "The Contemporary Heritage Reinterpretation" — yang dipresentasikan secara privat di Balige pada 18 Desember 2026.\n\nKolaborasi ini mempertemukan warisan motif Batak Ragi Hotang yang dijaga Melfarina Sianipar dengan pendekatan konstruksi kontemporer Raden Sirait.\n\nBila relevan untuk rubrik mode atau budaya Anda, kami siap mengirimkan press kit terverifikasi, arsip visual berizin, atau menjadwalkan wawancara singkat dengan kolaborator.\n\nTerima kasih atas perhatiannya,\n[Nama PIC Press]`,
  },
  {
    id: 'tpl-institution',
    judul: 'Pendekatan Institusi Ekonomi Kreatif / Budaya / Asosiasi',
    segmen: 'Institution (Prioritas A)',
    subjek: 'Silaturahmi & Pengenalan Kolaborasi Wastra Batak Kontemporer — Melfarina Sianipar × Raden Sirait (MRS)',
    isi: `Yth. [Nama & Pimpinan Institusi],\n\nKami menyampaikan salam hormat dari tim kolaborasi Melfarina Sianipar × Raden Sirait (rencana brand MRS). Melalui presentasi privat pada 18 Desember 2026 di Balige, kami berupaya membuka ruang pengenalan yang lebih luas bagi pengembangan busana bermotif Batak Ragi Hotang agar semakin siap menjangkau jejaring nasional maupun internasional.\n\nKami memohon kesempatan beraudiensi singkat atau menyampaikan ringkasan program pelestarian & pengembangan ekonomi kreatif ini kepada [Institusi].\n\nHormat kami,\n[Nama PIC Institusi]`,
  },
  {
    id: 'tpl-cultural',
    judul: 'Pendekatan Ekosistem Budaya, Kurator & Akademisi',
    segmen: 'Cultural Ecosystem (Prioritas B)',
    subjek: 'Diskusi & Apresiasi Motif Batak Ragi Hotang dalam Kolaborasi Melfarina Sianipar × Raden Sirait',
    isi: `Salam budaya [Nama],\n\nSebagai bagian dari kolaborasi Melfarina Sianipar × Raden Sirait (MRS) di Balige (18 Des 2026), kami berfokus memastikan penghormatan terhadap konteks budaya motif Batak Ragi Hotang dan para penenun berjalan seiring dengan reinterpretasi mode modern.\n\nKami sangat menghargai perspektif [Nama/Komunitas] dan bermaksud membagikan dokumentasi riset serta hasil presentasi privat kami untuk diskusi ekosistem wastra ke depan.\n\nSalam hangat,\n[Nama PIC]`,
  },
];

export const HEADER_CSV_STAKEHOLDER =
  'nama,jabatan_organisasi,kategori,prioritas,relevansi_catatan,pic_relasi,sumber_kontak,channel,nilai_kontak,konteks_relasi,izin_publikasi,status_pipeline,tindakan_berikutnya,tenggat_followup';

export const PANDUAN_CSV_STAKEHOLDER = `${HEADER_CSV_STAKEHOLDER}\n`;
