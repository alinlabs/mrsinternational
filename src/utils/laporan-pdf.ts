import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Styles } from 'jspdf-autotable';
import type { DokumenLaporanTerbangun } from '../types/laporan';

export interface HasilRenderPdfLaporan {
  blob: Blob;
  base64: string;
  ukuranBytes: number;
  jumlahHalaman: number;
}

/**
 * Normalisasi karakter non-Latin-1 agar font standar vector PDF (Helvetica WinAnsi)
 * tidak menampilkan kotak/simbol rusak saat dibuka di viewer PDF mana pun.
 */
export function sanitasiTeksPdf(teks: string): string {
  return teks
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/\u2022/g, '*')
    .replace(/\u00a0/g, ' ');
}

function arrayBufferKeBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const bagian: string[] = [];
  const ukuranChunk = 0x8000;
  for (let i = 0; i < bytes.length; i += ukuranChunk) {
    const sub = bytes.subarray(i, i + ukuranChunk);
    bagian.push(String.fromCharCode(...sub));
  }
  return btoa(bagian.join(''));
}

export function buatPdfBlobLaporan(
  dokumen: DokumenLaporanTerbangun,
): HasilRenderPdfLaporan {
  const doc = new jsPDF({
    orientation: dokumen.orientasi,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const marginKiri = 14;
  const marginKanan = 14;
  const marginAtas = 24;
  const marginBawah = 16;
  const lebarHalaman = doc.internal.pageSize.getWidth();
  const tinggiHalaman = doc.internal.pageSize.getHeight();
  const lebarKonten = lebarHalaman - marginKiri - marginKanan;

  const gambarHeaderHalaman = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(122, 28, 36);
    doc.text(
      sanitasiTeksPdf(`MRs PLAN - ${dokumen.judul.toUpperCase()}`),
      marginKiri,
      11,
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(109, 106, 99);
    doc.text(
      sanitasiTeksPdf(`Dicetak: ${dokumen.dibuatPadaLabelWib}`),
      lebarHalaman - marginKanan,
      11,
      { align: 'right' },
    );

    doc.setDrawColor(212, 207, 196);
    doc.setLineWidth(0.3);
    doc.line(marginKiri, 14, lebarHalaman - marginKanan, 14);
  };

  // Halaman 1: Judul, Subjudul, Parameter & Ringkasan Metrik
  gambarHeaderHalaman();
  let y = 21;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(24, 24, 27);
  const barisJudul = doc.splitTextToSize(
    sanitasiTeksPdf(dokumen.judul),
    lebarKonten,
  ) as string[];
  doc.text(barisJudul, marginKiri, y);
  y += barisJudul.length * 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(74, 72, 67);
  const barisSubjudul = doc.splitTextToSize(
    sanitasiTeksPdf(dokumen.subjudul),
    lebarKonten,
  ) as string[];
  doc.text(barisSubjudul, marginKiri, y);
  y += barisSubjudul.length * 4.5;

  doc.setFontSize(8);
  doc.setTextColor(109, 106, 99);
  const infoMeta = sanitasiTeksPdf(
    `Disusun oleh: ${dokumen.dibuatOleh} | Berkas: ${dokumen.namaFile}`,
  );
  const barisMeta = doc.splitTextToSize(infoMeta, lebarKonten) as string[];
  doc.text(barisMeta, marginKiri, y + 1);
  y += barisMeta.length * 4 + 3;

  // Kotak Parameter & Catatan Integritas (hemat tinta: border halus + latar netral)
  const teksParam = [
    ...dokumen.parameterAktif,
    ...dokumen.catatanIntegritas,
  ]
    .map((item) => `- ${sanitasiTeksPdf(item)}`)
    .join('\n');

  const barisParam = doc.splitTextToSize(teksParam, lebarKonten - 6) as string[];
  const tinggiKotakParam = barisParam.length * 3.8 + 5;
  doc.setFillColor(250, 249, 246);
  doc.setDrawColor(231, 228, 221);
  doc.rect(marginKiri, y, lebarKonten, tinggiKotakParam, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(74, 72, 67);
  doc.text(barisParam, marginKiri + 3, y + 4.5);
  y += tinggiKotakParam + 5;

  // Grid 4 Metrik Ringkasan
  if (dokumen.ringkasanMetrik.length > 0) {
    const jumlahKartu = dokumen.ringkasanMetrik.length;
    const celah = 3;
    const lebarKartu =
      (lebarKonten - celah * (jumlahKartu - 1)) / jumlahKartu;
    const tinggiKartu = 18;

    dokumen.ringkasanMetrik.forEach((metrik, idx) => {
      const xKartu = marginKiri + idx * (lebarKartu + celah);
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(212, 207, 196);
      doc.rect(xKartu, y, lebarKartu, tinggiKartu, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(109, 106, 99);
      const labelPotong = doc.splitTextToSize(
        sanitasiTeksPdf(metrik.label),
        lebarKartu - 4,
      ) as string[];
      doc.text(labelPotong[0] ?? '', xKartu + 2.5, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(24, 24, 27);
      const nilaiPotong = doc.splitTextToSize(
        sanitasiTeksPdf(metrik.nilai),
        lebarKartu - 4,
      ) as string[];
      doc.text(nilaiPotong[0] ?? '', xKartu + 2.5, y + 10.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(122, 28, 36);
      doc.text(
        sanitasiTeksPdf(`[${metrik.labelStatus}]`),
        xKartu + 2.5,
        y + 15.5,
      );
    });

    y += tinggiKartu + 7;
  }

  // Render setiap bagian tabel laporan
  for (const bagian of dokumen.bagian) {
    if (y > tinggiHalaman - marginBawah - 28) {
      doc.addPage();
      y = marginAtas;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(24, 24, 27);
    const judulBagian = sanitasiTeksPdf(
      `${bagian.judul} [${bagian.labelStatus}]`,
    );
    const barisJudulBagian = doc.splitTextToSize(
      judulBagian,
      lebarKonten,
    ) as string[];
    doc.text(barisJudulBagian, marginKiri, y);
    y += barisJudulBagian.length * 4.5;

    if (bagian.deskripsi) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(74, 72, 67);
      const barisDesk = doc.splitTextToSize(
        sanitasiTeksPdf(bagian.deskripsi),
        lebarKonten,
      ) as string[];
      doc.text(barisDesk, marginKiri, y + 0.5);
      y += barisDesk.length * 3.8 + 1.5;
    }

    const columnStyles: Record<string, Partial<Styles>> = {};
    if (bagian.kolomRataKanan) {
      for (const idxKol of bagian.kolomRataKanan) {
        columnStyles[String(idxKol)] = { halign: 'right' };
      }
    }

    autoTable(doc, {
      startY: y + 1,
      margin: {
        top: marginAtas,
        right: marginKanan,
        bottom: marginBawah,
        left: marginKiri,
      },
      head: [bagian.kolom.map((k) => sanitasiTeksPdf(k))],
      body: bagian.baris.map((r) => r.map((sel) => sanitasiTeksPdf(sel))),
      theme: 'grid',
      showHead: 'everyPage',
      rowPageBreak: 'avoid',
      tableWidth: lebarKonten,
      styles: {
        font: 'helvetica',
        fontSize: dokumen.orientasi === 'landscape' ? 8 : 8.2,
        cellPadding: { top: 2.2, right: 2.5, bottom: 2.2, left: 2.5 },
        textColor: [24, 24, 27],
        lineColor: [224, 220, 212],
        lineWidth: 0.2,
        overflow: 'linebreak',
        valign: 'top',
      },
      headStyles: {
        fillColor: [243, 241, 236],
        textColor: [24, 24, 27],
        fontStyle: 'bold',
        lineColor: [122, 28, 36],
        lineWidth: 0.3,
      },
      alternateRowStyles: {
        fillColor: [252, 251, 249],
      },
      columnStyles,
      didDrawPage: () => {
        gambarHeaderHalaman();
      },
    });

    const autoDoc = doc as unknown as { lastAutoTable?: { finalY?: number } };
    y = (autoDoc.lastAutoTable?.finalY ?? y + 10) + 7;
  }

  // Pass akhir: header/footer nomor halaman pada seluruh halaman
  const totalHalaman = doc.getNumberOfPages();
  const statusPiiFooter = dokumen.piiDisertakan
    ? 'INTERNAL - MEMUAT KONTAK PRIVAT (PII)'
    : 'TEREDAKSI DEFAULT (TANPA PII)';

  for (let hal = 1; hal <= totalHalaman; hal += 1) {
    doc.setPage(hal);
    if (hal > 1) {
      gambarHeaderHalaman();
    }
    doc.setDrawColor(231, 228, 221);
    doc.setLineWidth(0.25);
    doc.line(
      marginKiri,
      tinggiHalaman - 12,
      lebarHalaman - marginKanan,
      tinggiHalaman - 12,
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(109, 106, 99);
    doc.text(
      sanitasiTeksPdf(
        `MRs Plan (Melfarina Sianipar x Raden Sirait) | ${statusPiiFooter} | Kuota Terbatas`,
      ),
      marginKiri,
      tinggiHalaman - 7.5,
    );
    doc.text(
      `Halaman ${hal} dari ${totalHalaman}`,
      lebarHalaman - marginKanan,
      tinggiHalaman - 7.5,
      { align: 'right' },
    );
  }

  const arrayBuffer = doc.output('arraybuffer');
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const base64 = arrayBufferKeBase64(arrayBuffer);

  return {
    blob,
    base64,
    ukuranBytes: arrayBuffer.byteLength,
    jumlahHalaman: totalHalaman,
  };
}
