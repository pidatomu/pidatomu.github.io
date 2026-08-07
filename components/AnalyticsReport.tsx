"use client";

import { useEffect, useCallback } from "react";
import { Printer, Download, X } from "lucide-react";

interface AnalyticsReportProps {
  data: {
    tema: string;
    kategori: string;
    wordCount: number;
    readingTime: string;
    readability: string;
    sentiment: string;
    difficulty: number;
    vocabulary: number;
    sections: number;
  };
  onClose: () => void;
}

export default function AnalyticsReport({ data, onClose }: AnalyticsReportProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const lines = [
      "ANALITIK PIDATOMU",
      "=".repeat(50),
      "",
      `Tema      : ${data.tema}`,
      `Kategori  : ${data.kategori}`,
      "",
      "STATISTIK UMUM",
      "-".repeat(30),
      `Jumlah Kata       : ${data.wordCount.toLocaleString("id")}`,
      `Estimasi Waktu    : ${data.readingTime}`,
      `Jumlah Section    : ${data.sections}`,
      "",
      "ANALISIS KUALITAS",
      "-".repeat(30),
      `Keterbacaan       : ${data.readability}`,
      `Sentimen          : ${data.sentiment}`,
      `Skor Kesulitan    : ${data.difficulty}/10`,
      `Kosakata Unik     : ${data.vocabulary}`,
      "",
      "=".repeat(50),
      `Dibuat pada: ${new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      "Dengan: Pidatomu",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analitik-${data.tema.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const difficultyLabel =
    data.difficulty <= 2 ? "Sangat Mudah" :
    data.difficulty <= 4 ? "Mudah" :
    data.difficulty <= 6 ? "Sedang" :
    data.difficulty <= 8 ? "Sulit" :
    "Sangat Sulit";

  const difficultyColor =
    data.difficulty <= 2 ? "bg-[#22c55e]" :
    data.difficulty <= 4 ? "bg-[var(--color-accent-2)]" :
    data.difficulty <= 6 ? "bg-[var(--color-accent)]" :
    data.difficulty <= 8 ? "bg-orange-500" :
    "bg-[var(--color-danger)]";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Screen controls */}
      <div className="no-print fixed top-4 right-4 z-[60] flex gap-2">
        <button onClick={handlePrint} className="brutal-btn p-3" title="Cetak">
          <Printer size={18} />
        </button>
        <button onClick={handleDownload} className="brutal-btn p-3" title="Unduh sebagai Teks">
          <Download size={18} />
        </button>
        <button onClick={onClose} className="brutal-btn p-3" title="Tutup">
          <X size={18} />
        </button>
      </div>

      {/* Report */}
      <div className="brutal-card w-full max-w-lg max-h-[85vh] overflow-auto print-area">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-4 border-[var(--color-ink)]">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">
              Laporan Analitik
            </div>
            <h2 className="text-xl font-bold">{data.tema}</h2>
            <div className="text-xs font-semibold text-black/50 mt-1">{data.kategori}</div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Kata" value={data.wordCount.toLocaleString("id")} />
            <StatCard label="Waktu Bicara" value={data.readingTime} />
            <StatCard label="Section" value={`${data.sections}`} />
            <StatCard label="Kosakata Unik" value={`${data.vocabulary}`} />
          </div>

          {/* Quality metrics */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[var(--color-accent)]" />
              Analisis Kualitas
            </h3>

            <div className="flex items-center justify-between text-xs p-2 bg-black/[0.03] border border-black/10">
              <span className="font-semibold text-black/60">Keterbacaan</span>
              <span className="font-bold">{data.readability}</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2 bg-black/[0.03] border border-black/10">
              <span className="font-semibold text-black/60">Sentimen</span>
              <span className="font-bold">{data.sentiment}</span>
            </div>

            {/* Difficulty bar */}
            <div className="p-2 bg-black/[0.03] border border-black/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-black/60">Skor Kesulitan</span>
                <span className="font-bold">{data.difficulty}/10 — {difficultyLabel}</span>
              </div>
              <div className="h-3 bg-black/5 border border-black/10 overflow-hidden">
                <div
                  className={`h-full ${difficultyColor} transition-all duration-500`}
                  style={{ width: `${(data.difficulty / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t-2 border-black/10 text-[0.6rem] text-black/40 font-semibold text-center">
            Dibuat pada {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · Pidatomu
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border-2 border-[var(--color-ink)] text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[0.6rem] font-semibold text-black/40 uppercase">{label}</div>
    </div>
  );
}
