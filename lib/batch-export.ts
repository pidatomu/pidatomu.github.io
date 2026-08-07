export interface SpeechExportData {
  tema: string;
  konten: string;
  kategori?: string;
  durasi?: number;
  created_at?: string;
}

export function batchExportTxt(speeches: { tema: string; konten: string }[]): void {
  const separator = "═".repeat(60);
  const sections = speeches.map((s, i) => {
    const header = `[${i + 1}] ${s.tema}`;
    return `${header}\n${"-".repeat(header.length)}\n\n${s.konten}`;
  });

  const combined = `PIDATOMU — BATCH EXPORT\n${new Date().toLocaleDateString("id-ID")}\n${separator}\n\n${sections.join(`\n\n${separator}\n\n`)}`;

  downloadFile(combined, `pidatomu-batch-${Date.now()}.txt`, "text/plain;charset=utf-8");
}

export function batchExportSummary(
  speeches: { tema: string; kategori: string; durasi: number; created_at: string }[]
): void {
  const header = "No;Tema;Kategori;Durasi (mnt);Tanggal";
  const rows = speeches.map((s, i) => {
    const tema = s.tema.replace(/;/g, ",");
    return `${i + 1};${tema};${s.kategori};${s.durasi};${s.created_at}`;
  });

  const csv = [header, ...rows].join("\n");
  downloadFile(csv, `pidatomu-ringkasan-${Date.now()}.csv`, "text/csv;charset=utf-8");
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
