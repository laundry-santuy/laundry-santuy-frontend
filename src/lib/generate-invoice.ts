import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { HistoryOrder } from '@/app/user/_components/riwayat/types';

// ── Brand colours ─────────────────────────────────────────────────────────────
const C = {
  blue:       [0,   88,  202] as [number, number, number],
  blueDark:   [0,   50,  140] as [number, number, number],
  blueDeep:   [0,   30,   90] as [number, number, number],
  blueLight:  [180, 210, 255] as [number, number, number],
  navy:       [17,  24,   39] as [number, number, number],
  muted:      [107, 114, 128] as [number, number, number],
  light:      [245, 247, 250] as [number, number, number],
  border:     [229, 231, 235] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  green:      [22,  163,  74] as [number, number, number],
  amber:      [217, 119,   6] as [number, number, number],
  red:        [220,  38,  38] as [number, number, number],
};

type DocWithTable = jsPDF & { lastAutoTable: { finalY: number } };

export function generateInvoice(order: HistoryOrder, userName?: string): void {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as DocWithTable;
  const W    = 210;
  const M    = 18; // left/right margin
  const CW   = W - M * 2; // content width

  // ── HEADER BACKGROUND ───────────────────────────────────────────────────────
  doc.setFillColor(...C.blueDark);
  doc.rect(0, 0, W, 45, 'F');

  // Accent strip top
  doc.setFillColor(...C.blueDeep);
  doc.rect(0, 0, W, 1.8, 'F');

  // Left accent bar
  doc.setFillColor(...C.blue);
  doc.rect(0, 1.8, 4, 43.2, 'F');

  // ── BRAND ───────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(...C.white);
  doc.text('LAUNDRY SANTUY', M + 4, 19);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.blueLight);
  doc.text('Premium & Clean Service', M + 4, 27);

  // ── INVOICE LABEL + NUMBER (right) ──────────────────────────────────────────
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.blueLight);
  doc.text('INVOICE', W - M, 14, { align: 'right' });

  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(order.id.toUpperCase(), W - M, 24, { align: 'right' });

  // ── STATUS BADGE ────────────────────────────────────────────────────────────
  const badgeColor =
    order.paymentStatus === 'Lunas'  ? C.green :
    order.paymentStatus === 'Refund' ? C.red   : C.amber;
  const badgeLabel = order.paymentStatus.toUpperCase();
  const badgeW = 24;
  const badgeX = W - M - badgeW;
  doc.setFillColor(...badgeColor);
  doc.roundedRect(badgeX, 28, badgeW, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text(badgeLabel, badgeX + badgeW / 2, 33.5, { align: 'center' });

  // ── DIVIDER ─────────────────────────────────────────────────────────────────
  let y = 53;
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.25);
  doc.line(M, y, W - M, y);

  // ── INFO ROW ────────────────────────────────────────────────────────────────
  y += 8;

  // Left column
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('Diterbitkan Untuk:', M, y);

  // Right column
  doc.text('Detail Pesanan:', W - M, y, { align: 'right' });

  y += 5.5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.navy);
  doc.text(userName ?? 'Pelanggan Laundry Santuy', M, y);

  // Right: detail items
  const details: [string, string][] = [
    ['Tanggal:', order.date],
    ...(order.time && order.time !== '-'   ? [['Penjemputan:', order.time] as [string, string]]  : []),
    ['Outlet:',   order.outlet],
    ...(order.courier && order.courier !== '-' ? [['Kurir:', order.courier] as [string, string]] : []),
    ...(order.paymentMethod && order.paymentMethod !== '-' ? [['Pembayaran:', order.paymentMethod] as [string, string]] : []),
  ];

  let ry = y - (details.length - 1) * 2.5;
  if (ry < 58) ry = 58;

  details.forEach(([label, val]) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(label, W - M - 55, ry);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.navy);
    doc.text(val, W - M, ry, { align: 'right' });
    ry += 5.5;
  });

  // Extend y past right column
  y = Math.max(y + 4, ry + 2);

  if (order.address && order.address !== '-') {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    const addrLines = doc.splitTextToSize(`Alamat penjemputan: ${order.address}`, CW / 2 - 4);
    doc.text(addrLines, M, y);
    y += addrLines.length * 5;
  }

  // ── ITEMS TABLE ─────────────────────────────────────────────────────────────
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['Layanan', 'Berat / Qty', 'Total']],
    body: order.items.map((item) => [item.name, item.quantity, item.price]),
    headStyles: {
      fillColor: C.blue,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: C.navy,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    alternateRowStyles: {
      fillColor: C.light,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 36, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
    },
    styles: {
      lineColor: C.border,
      lineWidth: 0.2,
    },
    tableLineColor: C.border,
    tableLineWidth: 0.2,
  });

  // ── SUMMARY ─────────────────────────────────────────────────────────────────
  let sy = doc.lastAutoTable.finalY + 10;
  const labelX = W - M - 82;
  const valX   = W - M;

  const summaryRow = (
    label: string,
    value: string,
    bold = false,
    color: [number, number, number] = C.muted,
  ) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...(bold ? C.navy : C.muted));
    doc.text(label, labelX, sy);
    doc.setTextColor(...color);
    doc.text(value, valX, sy, { align: 'right' });
    sy += bold ? 7 : 5.5;
  };

  summaryRow('Subtotal:', order.subtotal);

  if (order.discount && order.discount !== 'Rp0') {
    summaryRow('Diskon:', `- ${order.discount}`, false, C.green);
  }

  // Divider before total
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(labelX, sy, valX, sy);
  sy += 5;

  summaryRow('Total Bayar:', order.total, true, C.blue);

  // ── CATATAN ─────────────────────────────────────────────────────────────────
  const hasNote = order.note && order.note !== '-' && order.note !== 'Tidak ada catatan';
  if (hasNote) {
    sy += 6;
    doc.setFillColor(...C.light);
    const noteLines = doc.splitTextToSize(order.note, CW - 10);
    const noteH = noteLines.length * 5 + 10;
    doc.roundedRect(M, sy, CW, noteH, 3, 3, 'F');
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(M, sy, CW, noteH, 3, 3, 'S');
    sy += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.navy);
    doc.text('Catatan:', M + 5, sy);
    sy += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(noteLines, M + 5, sy);
  }

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const FY = 272;

  // Footer background
  doc.setFillColor(...C.light);
  doc.rect(0, FY, W, 25, 'F');

  // Blue top border on footer
  doc.setFillColor(...C.blue);
  doc.rect(0, FY, W, 1.2, 'F');

  // Footer text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...C.navy);
  doc.text(
    'Terima kasih telah memercayakan pakaian Anda pada kami!',
    W / 2, FY + 10, { align: 'center' },
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text(
    'Laundry Santuy  ·  Premium & Clean Service',
    W / 2, FY + 17, { align: 'center' },
  );

  // Bottom accent line
  doc.setFillColor(...C.blue);
  doc.rect(0, 295.5, W, 1.5, 'F');

  // ── SAVE ────────────────────────────────────────────────────────────────────
  const safeId   = order.id.replace(/[^a-zA-Z0-9]/g, '');
  const safeDate = order.date.replace(/\s/g, '-');
  doc.save(`Invoice-${safeId}-${safeDate}.pdf`);
}
