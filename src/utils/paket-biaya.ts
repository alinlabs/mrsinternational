import {
  DETAIL_SKENARIO_ANGGARAN_KANONIK,
  RINCIAN_BIAYA_PRODUKSI_KANONIK,
  RINCIAN_LAYANAN_TERMASUK_KANONIK,
} from '../data/iklan-kanonik';
import type { DetailSkenarioAnggaran, IdSkenarioAnggaran } from '../types/iklan';

export type IdTabPaketBiaya = 'efisien' | 'optimal' | 'maksimal';

export interface DefinisiTabPaketBiaya {
  id: IdTabPaketBiaya;
  label: string;
  idSkenario: IdSkenarioAnggaran;
}

export interface BarisRincianPaketBiaya {
  id: string;
  judul: string;
  keterangan: string;
  qty: string;
  hargaIdr: number | null;
  hargaCoretIdr?: number;
  satuanHarga: string;
  hargaPerkiraan?: boolean;
  totalIdr: number;
  totalPerkiraan?: boolean;
  organikSaja?: boolean;
}

export interface DataTabPaketBiaya {
  tab: DefinisiTabPaketBiaya;
  skenario: DetailSkenarioAnggaran;
  rincianProduksi: BarisRincianPaketBiaya[];
  rincianMedia: BarisRincianPaketBiaya[];
  rincianLayananTermasuk: BarisRincianPaketBiaya[];
  totalNilaiCoretLayananIdr: number;
}

export const DAFTAR_TAB_PAKET_BIAYA: DefinisiTabPaketBiaya[] = [
  { id: 'efisien', label: 'Efisien', idSkenario: 'hemat' },
  { id: 'optimal', label: 'Optimal', idSkenario: 'menengah' },
  { id: 'maksimal', label: 'Maksimal', idSkenario: 'agresif' },
];

const QTY_PRODUKSI_BY_ID: Record<
  string,
  { qty: string; pengali: number; satuanHarga: string }
> = {
  'prod-videografer-iklan': { qty: '1 hari', pengali: 1, satuanHarga: '/ hari' },
  'prod-content-creator-short': { qty: '2 hari', pengali: 2, satuanHarga: '/ hari' },
  'prod-editing-44': { qty: '44 video', pengali: 44, satuanHarga: '/ video' },
  'prod-desain-22': { qty: '22 desain', pengali: 22, satuanHarga: '/ desain' },
  'prod-capcut-pro': { qty: '1 bulan', pengali: 1, satuanHarga: '/ bulan' },
  'prod-canva-premium': { qty: '1 bulan', pengali: 1, satuanHarga: '/ bulan' },
};

const KETERANGAN_META_BY_SKENARIO: Record<
  IdSkenarioAnggaran,
  { qty: string; harga: number; satuanHarga: string; keterangan: string }
> = {
  hemat: {
    qty: '7 hari',
    harga: 200000,
    satuanHarga: '/ hari',
    keterangan: '1 flight (29 Nov – 5 Des) dengan anggaran harian Rp200.000/hari.',
  },
  menengah: {
    qty: '14 hari',
    harga: 350000,
    satuanHarga: '/ hari',
    keterangan: '2 flight (29 Nov – 5 Des & 11 – 17 Des) dengan anggaran harian Rp350.000/hari.',
  },
  agresif: {
    qty: '14 hari',
    harga: 500000,
    satuanHarga: '/ hari',
    keterangan: '2 flight (29 Nov – 5 Des & 11 – 17 Des) dengan anggaran harian Rp500.000/hari.',
  },
};

const KETERANGAN_TIKTOK_BY_SKENARIO: Record<
  IdSkenarioAnggaran,
  {
    qty: string;
    harga: number | null;
    satuanHarga: string;
    keterangan: string;
    organikSaja?: boolean;
  }
> = {
  hemat: {
    qty: 'Organik',
    harga: null,
    satuanHarga: '/ hari',
    keterangan: 'Distribusi organik 2 video/hari tanpa belanja iklan berbayar (Rp0/hari).',
    organikSaja: true,
  },
  menengah: {
    qty: '7 hari',
    harga: 450000,
    satuanHarga: '/ hari',
    keterangan:
      '1 ad group dengan anggaran harian Rp450.000/hari selama 7 hari (4 – 10 Des).',
  },
  agresif: {
    qty: '7 hari',
    harga: 800000,
    satuanHarga: '/ hari',
    keterangan:
      '2 ad groups paralel @Rp400.000/hari = Rp800.000/hari selama 7 hari (4 – 10 Des).',
  },
};

export function ambilIdTabDariSkenario(idSkenario: IdSkenarioAnggaran): IdTabPaketBiaya {
  const cocok = DAFTAR_TAB_PAKET_BIAYA.find((tab) => tab.idSkenario === idSkenario);
  return cocok ? cocok.id : 'optimal';
}

export function ambilDataPaketBiaya(idSkenario: IdSkenarioAnggaran): DataTabPaketBiaya {
  const tab =
    DAFTAR_TAB_PAKET_BIAYA.find((item) => item.idSkenario === idSkenario) ??
    DAFTAR_TAB_PAKET_BIAYA[1];

  const skenario =
    DETAIL_SKENARIO_ANGGARAN_KANONIK.find((item) => item.id === tab.idSkenario) ??
    DETAIL_SKENARIO_ANGGARAN_KANONIK[1];

  const rincianProduksi: BarisRincianPaketBiaya[] = RINCIAN_BIAYA_PRODUKSI_KANONIK.map((item) => {
    const totalIdr =
      tab.idSkenario === 'hemat'
        ? item.hematIdr
        : tab.idSkenario === 'menengah'
          ? item.menengahIdr
          : item.agresifIdr;

    const hargaCoretIdr =
      tab.idSkenario === 'hemat'
        ? item.hargaCoretHematIdr
        : tab.idSkenario === 'menengah'
          ? item.hargaCoretMenengahIdr
          : item.hargaCoretAgresifIdr;

    const metaQty = QTY_PRODUKSI_BY_ID[item.id] ?? {
      qty: '1 unit',
      pengali: 1,
      satuanHarga: '/ unit',
    };
    const hargaIdr = Math.round(totalIdr / metaQty.pengali);

    return {
      id: item.id,
      judul: item.komponen,
      keterangan: item.keterangan,
      qty: metaQty.qty,
      hargaIdr,
      hargaCoretIdr,
      satuanHarga: metaQty.satuanHarga,
      totalIdr,
    };
  });

  const metaInfo = KETERANGAN_META_BY_SKENARIO[tab.idSkenario];
  const tiktokInfo = KETERANGAN_TIKTOK_BY_SKENARIO[tab.idSkenario];

  const rincianMedia: BarisRincianPaketBiaya[] = [
    {
      id: 'ads-setup',
      judul: 'Biaya Ads Setup (Meta Ads & TikTok Ads)',
      keterangan:
        'Biaya setup kampanye iklan yang sudah mencakup konfigurasi Meta Ads dan TikTok Ads (akun iklan/BM, struktur campaign, pixel/tracking, penempatan kreatif, serta verifikasi Ads Manager).',
      qty: '1 setup',
      hargaIdr: skenario.adsSetupIdr,
      satuanHarga: '/ setup',
      totalIdr: skenario.adsSetupIdr,
    },
    {
      id: 'meta-ads',
      judul: 'Meta Ads (Awareness / ThruPlay)',
      keterangan: metaInfo.keterangan,
      qty: metaInfo.qty,
      hargaIdr: metaInfo.harga,
      satuanHarga: metaInfo.satuanHarga,
      totalIdr: skenario.metaIdr,
    },
    {
      id: 'tiktok-ads',
      judul: 'TikTok Ads',
      keterangan: tiktokInfo.keterangan,
      qty: tiktokInfo.qty,
      hargaIdr: tiktokInfo.harga,
      satuanHarga: tiktokInfo.satuanHarga,
      hargaPerkiraan: false,
      totalIdr: skenario.tiktokIdr,
      totalPerkiraan: false,
      organikSaja: tiktokInfo.organikSaja,
    },
  ];

  const rincianLayananTermasuk: BarisRincianPaketBiaya[] = RINCIAN_LAYANAN_TERMASUK_KANONIK.map(
    (item) => {
      const hargaCoretIdr =
        tab.idSkenario === 'hemat'
          ? item.hargaCoretHematIdr
          : tab.idSkenario === 'menengah'
            ? item.hargaCoretMenengahIdr
            : item.hargaCoretAgresifIdr;

      return {
        id: item.id,
        judul: item.komponen,
        keterangan: item.keterangan,
        qty: '1 periode',
        hargaIdr: 0,
        hargaCoretIdr,
        satuanHarga: '/ periode',
        totalIdr: 0,
      };
    },
  );

  const totalNilaiCoretLayananIdr = rincianLayananTermasuk.reduce(
    (sum, item) => sum + (item.hargaCoretIdr ?? 0),
    0,
  );

  return {
    tab,
    skenario,
    rincianProduksi,
    rincianMedia,
    rincianLayananTermasuk,
    totalNilaiCoretLayananIdr,
  };
}
