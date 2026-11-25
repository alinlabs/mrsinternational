import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAFTAR_TAB_PAKET_BIAYA,
  ambilDataPaketBiaya,
  ambilIdTabDariSkenario,
} from './paket-biaya';

test('DAFTAR_TAB_PAKET_BIAYA memiliki tepat 3 tab: Efisien, Optimal, Maksimal', () => {
  assert.deepEqual(
    DAFTAR_TAB_PAKET_BIAYA.map((t) => t.label),
    ['Efisien', 'Optimal', 'Maksimal'],
  );
  assert.equal(ambilIdTabDariSkenario('hemat'), 'efisien');
  assert.equal(ambilIdTabDariSkenario('menengah'), 'optimal');
  assert.equal(ambilIdTabDariSkenario('agresif'), 'maksimal');
});

test('Setiap tab menghitung subtotal produksi, total media, dan grand total sesuai data kanonik', () => {
  for (const tab of DAFTAR_TAB_PAKET_BIAYA) {
    const data = ambilDataPaketBiaya(tab.idSkenario);
    const subtotalHitung = data.rincianProduksi.reduce((sum, item) => sum + item.totalIdr, 0);
    assert.equal(subtotalHitung, data.skenario.subtotalProduksiIdr);
    assert.equal(data.skenario.contingency10PersenIdr, 0);
    assert.equal(data.skenario.totalProduksiIdr, data.skenario.subtotalProduksiIdr);

    const mediaHitung = data.rincianMedia.reduce((sum, item) => sum + item.totalIdr, 0);
    assert.equal(mediaHitung, data.skenario.totalMediaIdr);

    assert.equal(
      data.skenario.totalProduksiIdr + data.skenario.totalMediaIdr,
      data.skenario.grandTotalIdr,
    );

    for (const baris of data.rincianProduksi) {
      if (baris.hargaCoretIdr) {
        assert.ok(baris.hargaCoretIdr > 0);
        assert.equal(baris.totalIdr, 0);
      } else {
        assert.ok(baris.hargaIdr !== null && baris.hargaIdr > 0);
      }
      assert.equal(baris.qty.includes('paket'), false);
      assert.ok(baris.satuanHarga.startsWith('/ '));
      const qtyAngka = Number.parseInt(baris.qty, 10);
      assert.equal(qtyAngka * (baris.hargaIdr ?? 0), baris.totalIdr);
    }

    const adsSetup = data.rincianMedia.find((b) => b.id === 'ads-setup');
    assert.ok(adsSetup);
    assert.equal(adsSetup.judul, 'Biaya Ads Setup (Meta Ads & TikTok Ads)');
    assert.equal(adsSetup.qty, '1 setup');
    assert.equal(
      adsSetup.hargaIdr,
      tab.id === 'efisien' ? 150000 : tab.id === 'optimal' ? 300000 : 500000,
    );
    assert.equal(adsSetup.totalIdr, adsSetup.hargaIdr);

    const meta = data.rincianMedia.find((b) => b.id === 'meta-ads');
    assert.ok(meta);
    assert.equal(
      meta.hargaIdr,
      tab.id === 'efisien' ? 200000 : tab.id === 'optimal' ? 350000 : 500000,
    );

    const tiktok = data.rincianMedia.find((b) => b.id === 'tiktok-ads');
    assert.ok(tiktok);
    assert.equal(tiktok.satuanHarga, '/ hari');
    assert.equal(tiktok.hargaPerkiraan, false);
    assert.equal(tiktok.totalPerkiraan, false);
    assert.equal(tiktok.keterangan.includes('±'), false);
    assert.equal(tiktok.keterangan.toLowerCase().includes('kurang lebih'), false);
    assert.ok(tiktok.keterangan.includes('/hari'));
    if (tab.id === 'efisien') {
      assert.equal(tiktok.organikSaja, true);
      assert.equal(tiktok.hargaIdr, null);
    } else if (tab.id === 'optimal') {
      assert.equal(tiktok.qty, '7 hari');
      assert.equal(tiktok.hargaIdr, 450000);
      assert.equal(7 * tiktok.hargaIdr, tiktok.totalIdr);
    } else {
      assert.equal(tiktok.qty, '7 hari');
      assert.equal(tiktok.hargaIdr, 800000);
      assert.equal(7 * tiktok.hargaIdr, tiktok.totalIdr);
    }

    const shootIklan = data.rincianProduksi.find((b) => b.id === 'prod-videografer-iklan');
    const shootShort = data.rincianProduksi.find((b) => b.id === 'prod-content-creator-short');
    const editing = data.rincianProduksi.find((b) => b.id === 'prod-editing-44');
    const desain = data.rincianProduksi.find((b) => b.id === 'prod-desain-22');
    assert.equal(shootIklan?.judul, 'Jasa Tim Video Iklan (Syuting)');
    assert.equal(shootIklan?.qty, '1 hari');
    assert.equal(
      shootIklan?.hargaIdr,
      tab.id === 'efisien' ? 1000000 : tab.id === 'optimal' ? 1500000 : 2000000,
    );
    assert.equal(shootShort?.judul, 'Jasa Content Creator (Syuting)');
    assert.equal(shootShort?.qty, '2 hari');
    assert.equal(shootShort?.hargaIdr, 500000);
    assert.equal(shootShort?.totalIdr, 1000000);
    assert.equal(editing?.qty, '44 video');
    assert.equal(
      editing?.hargaIdr,
      tab.id === 'efisien' ? 50000 : tab.id === 'optimal' ? 75000 : 100000,
    );
    assert.equal(
      editing?.totalIdr,
      tab.id === 'efisien' ? 2200000 : tab.id === 'optimal' ? 3300000 : 4400000,
    );
    assert.equal(desain?.qty, '22 desain');
    assert.equal(desain?.hargaIdr, 25000);
    assert.equal(desain?.totalIdr, 550000);
    assert.equal(data.rincianLayananTermasuk.length, 4);
    assert.ok(data.rincianLayananTermasuk.every((b) => b.totalIdr === 0 && (b.hargaCoretIdr ?? 0) > 0));
    assert.ok(data.rincianLayananTermasuk.some((b) => b.id === 'layanan-pengelolaan-akun'));
    assert.ok(data.rincianLayananTermasuk.some((b) => b.id === 'layanan-optimalisasi-seo'));
    assert.ok(data.rincianLayananTermasuk.some((b) => b.id === 'layanan-web-desk-penyimpanan'));
    assert.ok(data.rincianLayananTermasuk.some((b) => b.id === 'layanan-administrasi'));
    assert.equal(
      data.totalNilaiCoretLayananIdr,
      tab.id === 'efisien' ? 2250000 : tab.id === 'optimal' ? 3100000 : 4000000,
    );
    assert.ok(data.rincianProduksi.some((b) => b.id === 'prod-capcut-pro'));
    assert.ok(data.rincianProduksi.some((b) => b.id === 'prod-canva-premium'));
    assert.equal(data.rincianProduksi.some((b) => b.id === 'prod-hero-cutdown'), false);
    assert.equal(data.rincianProduksi.some((b) => b.id === 'prod-transport'), false);
  }
});
