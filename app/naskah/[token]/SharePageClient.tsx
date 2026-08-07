"use client";

import { useState } from "react";
import Link from "next/link";
import { exportToPdf } from "@/lib/export/pdf";

interface Speech {
  id: string;
  tema: string;
  kategori: string;
  durasi: number;
  konten: string;
  ai_provider: string;
  created_at: string;
  nama_penceramah?: string;
  nama_lokasi?: string;
  tanggal?: string;
  gaya_bahasa?: string;
}

interface TextSegment {
  type: "heading" | "text";
  content: string;
}

function parseNaskah(raw: string): TextSegment[] {
  return raw.split("\n").map((line) => {
    const m = line.match(/^\*\*([^*]+)\*\*\s*$/);
    return m
      ? { type: "heading", content: m[1] }
      : { type: "text", content: line };
  });
}

function RenderedNaskah({ text }: { text: string }) {
  const segments = parseNaskah(text);
  return (
    <div className="naskah-content">
      {segments.map((seg, i) =>
        seg.type === "heading" ? (
          <p key={i} className="naskah-heading">{seg.content}</p>
        ) : (
          <p key={i} className="naskah-paragraph">{seg.content}</p>
        )
      )}
    </div>
  );
}

export default function SharePageClient({
  speech,
  token,
}: {
  speech: Speech;
  token: string;
}) {
  const [copyLabel, setCopyLabel] = useState("Salin Link");
  const [downloading, setDownloading] = useState<string | null>(null);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/naskah/${token}`
      : `/naskah/${token}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyLabel("Tersalin ✓");
      setTimeout(() => setCopyLabel("Salin Link"), 2000);
    });
  }

  function handleDownloadTxt() {
    const blob = new Blob([speech.konten], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pidato-${speech.tema.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadDocx() {
    setDownloading("docx");
    try {
      const res = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          konten: speech.konten,
          tema: speech.tema,
          kategori: speech.kategori,
          namaPenceramah: speech.nama_penceramah,
          namaLokasi: speech.nama_lokasi,
          tanggal: speech.tanggal,
          provider: speech.ai_provider,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pidato-${speech.tema.toLowerCase().replace(/\s+/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  function handleDownloadPdf() {
    setDownloading("pdf");
    setTimeout(() => {
      exportToPdf({
        konten: speech.konten,
        tema: speech.tema,
        kategori: speech.kategori,
        namaPenceramah: speech.nama_penceramah,
        namaLokasi: speech.nama_lokasi,
        tanggal: speech.tanggal,
        provider: speech.ai_provider,
      });
      setDownloading(null);
    }, 100);
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header card */}
        <div className="brutal-card px-6 py-8 relative">
          <span className="brutal-badge absolute -top-4 left-6 px-3 py-1 text-xs uppercase inline-block">
            {speech.kategori}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl mt-2">{speech.tema}</h1>

          <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium text-black/60">
            {speech.nama_penceramah && <span>👤 {speech.nama_penceramah}</span>}
            {speech.nama_lokasi && <span>📍 {speech.nama_lokasi}</span>}
            {speech.tanggal && <span>📅 {speech.tanggal}</span>}
            <span>⏱ {speech.durasi} menit</span>
          </div>
        </div>

        {/* Export panel */}
        <div className="brutal-card px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-3">Unduh Naskah</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadDocx}
              disabled={!!downloading}
              className="brutal-btn px-4 py-2 text-xs"
              id="btn-share-docx"
            >
              {downloading === "docx" ? "Membuat..." : "📄 Word (DOCX)"}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={!!downloading}
              className="brutal-btn bg-[var(--color-accent-2)] px-4 py-2 text-xs"
              id="btn-share-pdf"
            >
              {downloading === "pdf" ? "Membuat..." : "📋 PDF"}
            </button>
            <button
              onClick={handleDownloadTxt}
              className="brutal-btn px-4 py-2 text-xs"
              id="btn-share-txt"
            >
              📝 TXT
            </button>
            <button
              onClick={handleCopyLink}
              className="brutal-btn bg-[var(--color-accent-2)] px-4 py-2 text-xs"
              id="btn-share-link"
            >
              🔗 {copyLabel}
            </button>
          </div>
        </div>

        {/* Naskah */}
        <article className="brutal-card p-6 sm:p-8">
          <RenderedNaskah text={speech.konten} />
        </article>

        {/* Footer */}
        <p className="text-center text-xs text-black/50 font-medium">
          Dibuat dengan{" "}
          <Link href="/" className="font-bold underline underline-offset-2">
            Pidatomu
          </Link>{" "}
          ·{" "}
          {speech.ai_provider === "groq" ? "Groq AI" : "Gemini AI"}
        </p>
      </div>
    </main>
  );
}
