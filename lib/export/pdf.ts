import { jsPDF } from "jspdf";

export interface PdfExportParams {
  konten: string;
  tema: string;
  kategori: string;
  namaPenceramah?: string;
  namaLokasi?: string;
  tanggal?: string;
  provider?: string;
}

interface Segment {
  type: "heading" | "text" | "empty";
  content: string;
}

function parseSegments(raw: string): Segment[] {
  return raw.split("\n").map((line) => {
    const m = line.match(/^\*\*([^*]+)\*\*\s*$/);
    if (m) return { type: "heading", content: m[1] };
    if (!line.trim()) return { type: "empty", content: "" };
    return { type: "text", content: line };
  });
}

export function exportToPdf(params: PdfExportParams): void {
  const { konten, tema, kategori, namaPenceramah, namaLokasi, tanggal, provider } = params;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN_L = 25;
  const MARGIN_R = 25;
  const MARGIN_T = 25;
  const MARGIN_B = 20;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
  const FOOTER_Y = PAGE_H - MARGIN_B;

  let y = MARGIN_T;
  let pageNum = 1;

  function drawHeader() {
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("PIDATOMU — MBS Tanggul", PAGE_W - MARGIN_R, 12, { align: "right" });
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN_L, 15, PAGE_W - MARGIN_R, 15);
  }

  function drawFooter(page: number) {
    const prov = provider === "groq" ? "Groq AI" : "Gemini AI";
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN_L, FOOTER_Y - 4, PAGE_W - MARGIN_R, FOOTER_Y - 4);
    doc.text(`Dibuat dengan Pidatomu · ${prov}`, MARGIN_L, FOOTER_Y);
    doc.text(`Halaman ${page}`, PAGE_W - MARGIN_R, FOOTER_Y, { align: "right" });
  }

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > FOOTER_Y - 10) {
      drawFooter(pageNum);
      doc.addPage();
      pageNum++;
      drawHeader();
      y = MARGIN_T + 10;
    }
  }

  function addWrappedText(
    text: string,
    fontSize: number,
    fontStyle: "normal" | "bold",
    colorRGB: [number, number, number],
    lineHeight: number,
    maxWidth: number,
    xOffset: number = MARGIN_L
  ): number {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.setTextColor(...colorRGB);
    const lines = doc.splitTextToSize(text, maxWidth);
    const blockH = lines.length * lineHeight;
    checkPageBreak(blockH);
    doc.text(lines, xOffset, y);
    y += blockH;
    return blockH;
  }

  // ── Draw first page header ─────────────────────────────────────────────────
  drawHeader();
  y = MARGIN_T + 10;

  // Kategori badge
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text(kategori.toUpperCase(), MARGIN_L, y);
  y += 7;

  // Judul tema
  addWrappedText(tema, 18, "bold", [20, 20, 20], 8, CONTENT_W);
  y += 3;

  // Metadata
  if (namaPenceramah || namaLokasi || tanggal) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const metaParts = [
      namaPenceramah ? `Penceramah: ${namaPenceramah}` : null,
      namaLokasi ? `Lokasi: ${namaLokasi}` : null,
      tanggal ? `Tanggal: ${tanggal}` : null,
    ]
      .filter(Boolean)
      .join("   |   ");
    doc.text(metaParts, MARGIN_L, y);
    y += 7;
  }

  // Garis pemisah
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN_L, y, PAGE_W - MARGIN_R, y);
  y += 8;

  // ── Naskah body ─────────────────────────────────────────────────────────────
  const segments = parseSegments(konten);

  for (const seg of segments) {
    if (seg.type === "heading") {
      y += 4;
      checkPageBreak(12);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(seg.content, MARGIN_L, y);
      // Garis bawah heading
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.4);
      doc.line(MARGIN_L, y + 1.5, MARGIN_L + doc.getTextWidth(seg.content), y + 1.5);
      doc.setLineWidth(0.2);
      y += 8;
    } else if (seg.type === "empty") {
      y += 3;
    } else {
      addWrappedText(seg.content, 10.5, "normal", [40, 40, 40], 5.5, CONTENT_W);
      y += 2;
    }
  }

  // ── Footer halaman terakhir ─────────────────────────────────────────────────
  drawFooter(pageNum);

  // ── Trigger download ────────────────────────────────────────────────────────
  const fileName = `pidato-${tema.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.pdf`;
  doc.save(fileName);
}
