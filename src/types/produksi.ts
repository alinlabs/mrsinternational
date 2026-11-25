export type StatusTugasProduksi =
  | 'brief'
  | 'ready-to-shoot'
  | 'shooting'
  | 'editing'
  | 'review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'blocked'
  | 'cancelled';

export type PrioritasTugas = 'kritis' | 'tinggi' | 'sedang' | 'rendah';

export interface TugasProduksi {
  id: string;
  judul: string;
  deskripsi: string;
  fase: string;
  tenggat: string;
  status: StatusTugasProduksi;
  prioritas: PrioritasTugas;
  assignee: string;
  kontenTertaut: string[];
  dependensi: string;
  approver: string;
  alasanBlocked: string;
  selesaiPada: string;
  catatan: string;
  adalahMilestoneKritis11Des?: boolean;
  adalahSeedAwal?: boolean;
}

export interface FilterTugasProduksi {
  kataKunci: string;
  status: StatusTugasProduksi | 'semua';
  prioritas: PrioritasTugas | 'semua';
  assignee: string;
}

export type StatusSlotShooting = 'planned' | 'siap' | 'selesai' | 'tertunda';

export interface AgendaSlotShooting {
  id: string;
  jam: string;
  agenda: string;
  talentObjek: string;
  outputWajib: string;
  status: StatusSlotShooting;
  catatanLapangan: string;
}

export interface SesiShooting {
  id: 'shoot-hari-1' | 'shoot-hari-2' | 'shoot-hari-3';
  judul: string;
  tanggal: string;
  jamOperasional: string;
  ringkasanTujuan: string;
  lokasiPrivat: string;
  statusKesiapan: 'planned' | 'siap' | 'selesai' | 'tertunda';
  daftarSlot: AgendaSlotShooting[];
  catatanTambahan: string;
}

export interface ItemChecklistShooting {
  id: string;
  kategori: 'Izin & Etika' | 'Peralatan & Audio' | 'Wardrobe & Properti' | 'Backup & Embargo';
  judul: string;
  rincian: string;
  selesai: boolean;
}

export type NarasumberWawancara = 'melfarina' | 'raden' | 'ghivany';

export type StatusPersetujuanKutipan =
  | 'belum-direkam'
  | 'tercatat-draft'
  | 'menunggu-approval'
  | 'approved'
  | 'revisi';

export interface PertanyaanWawancara {
  id: string;
  narasumber: NarasumberWawancara;
  urutan: number;
  pertanyaan: string;
  catatanSumber: string;
  jawabanTercatat: string;
  kutipanDisetujui: string;
  statusPersetujuan: StatusPersetujuanKutipan;
  disetujuiOleh: string;
  tanggalDisetujui: string;
}

export interface BeatHeroAd {
  id: string;
  rentangWaktu: string;
  referensiWaktuBagian8: string;
  bagian: string;
  visual: string;
  drafNarasi: string;
}

export type StatusDeliverable = 'planned' | 'editing' | 'review' | 'approved' | 'delivered';

export interface DeliverableProduksi {
  id: string;
  nama: string;
  targetVolume: string;
  spesifikasi: string;
  aturanRevisi: string;
  status: StatusDeliverable;
  catatan: string;
}

export interface StatusStateProduksi {
  daftarTugas: TugasProduksi[];
  daftarSesiShooting: SesiShooting[];
  checklistShooting: ItemChecklistShooting[];
  bankPertanyaan: PertanyaanWawancara[];
  daftarDeliverables: DeliverableProduksi[];
}
