"use client";

import { useEffect, useCallback } from "react";
import { X, Printer } from "lucide-react";

interface PrintPreviewProps {
  konten: string;
  tema: string;
  kategori: string;
  namaPenceramah?: string;
  namaLokasi?: string;
  tanggal?: string;
  onClose: () => void;
}

function parseSegments(raw: string) {
  return raw.split("\n").map((line) => {
    const m = line.match(/^\*\*([^*]+)\*\*\s*$/);
    if (m) return { type: "heading" as const, content: m[1] };
    if (!line.trim()) return { type: "empty" as const, content: "" };
    return { type: "text" as const, content: line };
  });
}

export default function PrintPreview({
  konten,
  tema,
  kategori,
  namaPenceramah,
  namaLokasi,
  tanggal,
  onClose,
}: PrintPreviewProps) {
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

  const segments = parseSegments(konten);

  const today = tanggal || new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Screen controls */}
      <div className="no-print fixed top-4 right-4 z-[60] flex gap-2">
        <button onClick={handlePrint} className="brutal-btn p-3" title="Cetak">
          <Printer size={18} />
        </button>
        <button onClick={onClose} className="brutal-btn p-3" title="Tutup">
          <X size={18} />
        </button>
      </div>

      {/* A4 Preview */}
      <div className="bg-white border-4 border-[var(--color-ink)] shadow-[6px_6px_0px_0px_var(--color-ink)] w-full max-w-[210mm] max-h-[90vh] overflow-auto">
        <div
          className="p-[25mm] text-[10.5pt] leading-relaxed text-[#282828]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {/* Header */}
          <div className="mb-6 pb-3 border-b-2 border-[#e0e0e0]">
            <div className="text-[8pt] text-gray-400 uppercase tracking-[0.2em] mb-2">
              PIDATOMU
            </div>
            <div className="text-[8pt] text-gray-400 uppercase tracking-[0.2em]">
              {today}
            </div>
          </div>

          {/* Category badge */}
          <div className="text-[8pt] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
            {kategori}
          </div>

          {/* Title */}
          <h1
            className="text-[20pt] font-bold leading-tight mb-4 text-[#1a1a1a]"
            style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
          >
            {tema}
          </h1>

          {/* Metadata */}
          {(namaPenceramah || namaLokasi || tanggal) && (
            <div className="text-[9pt] text-gray-500 mb-4 flex gap-4">
              {namaPenceramah && <span>Penceramah: {namaPenceramah}</span>}
              {namaLokasi && <span>Lokasi: {namaLokasi}</span>}
              {tanggal && <span>{tanggal}</span>}
            </div>
          )}

          {/* Separator */}
          <div className="h-px bg-[#e0e0e0] my-4" />

          {/* Content */}
          <div>
            {segments.map((seg, i) => {
              if (seg.type === "heading") {
                return (
                  <div key={i} className="mt-4 mb-2">
                    <div
                      className="text-[11pt] font-bold text-[#1a1a1a] border-b border-gray-300 pb-1"
                      style={{
                        fontFamily: "'Helvetica Neue', Arial, sans-serif",
                        display: "inline-block",
                      }}
                    >
                      {seg.content}
                    </div>
                  </div>
                );
              }
              if (seg.type === "empty") {
                return <div key={i} className="h-1.5" />;
              }
              return (
                <p key={i} className="mb-2 text-justify">
                  {seg.content}
                </p>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-3 border-t-2 border-[#e0e0e0] flex justify-between text-[7pt] text-gray-400">
            <span>Dibuat dengan Pidatomu</span>
            <span>Halaman 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
