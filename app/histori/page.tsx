"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/deviceId";
import Link from "next/link";

interface Speech {
  id: string;
  kategori: string;
  tema: string;
  durasi: number;
  konten: string;
  ai_provider: string;
  created_at: string;
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoriPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistori() {
      try {
        const deviceId = getDeviceId();
        const supabase = createClient();

        const { data, error } = await supabase
          .from("speeches")
          .select("id, kategori, tema, durasi, konten, ai_provider, created_at")
          .eq("owner_type", "guest")
          .eq("owner_ref", deviceId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setSpeeches(data ?? []);
      } catch (err) {
        console.error("[histori] fetch error:", err);
        setError("Gagal memuat riwayat. Coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    }

    fetchHistori();
  }, []);

  function handleDownloadTxt(speech: Speech) {
    const namaFile = `pidato-${speech.tema.toLowerCase().replace(/\s+/g, "-")}.txt`;
    const blob = new Blob([speech.konten], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = namaFile;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      {/* Header */}
      <header className="max-w-xl mx-auto mb-8">
        <div className="brutal-card relative px-6 py-8 sm:px-8 sm:py-10">
          <span className="brutal-badge absolute -top-4 left-6 px-3 py-1 text-xs uppercase inline-block">
            MBS Tanggul
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">RIWAYAT</h1>
          <p className="mt-3 text-sm sm:text-base font-medium">
            Naskah yang pernah kamu buat di perangkat ini.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-xs font-bold uppercase underline underline-offset-2"
          >
            ← Buat naskah baru
          </Link>
        </div>
      </header>

      {/* Konten */}
      <section className="max-w-xl mx-auto space-y-4">
        {loading && (
          <div className="brutal-card p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-line" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="brutal-card p-4 text-sm font-medium bg-[var(--color-danger)]/20">
            {error}
          </p>
        )}

        {!loading && !error && speeches.length === 0 && (
          <div className="brutal-card p-8 text-center">
            <p className="font-display text-2xl mb-2">Belum ada naskah</p>
            <p className="text-sm text-black/60">
              Buat naskah pertamamu sekarang!
            </p>
            <Link href="/" className="brutal-btn inline-block mt-4 px-6 py-2 text-sm">
              Buat sekarang →
            </Link>
          </div>
        )}

        {!loading &&
          speeches.map((speech) => (
            <article key={speech.id} className="brutal-card overflow-hidden">
              {/* Card header */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-xs font-bold uppercase bg-[var(--color-accent)] border border-[var(--color-ink)] px-2 py-0.5 mb-2">
                      {speech.kategori}
                    </span>
                    <h2 className="font-display text-lg leading-tight">
                      {speech.tema}
                    </h2>
                    <p className="text-xs text-black/50 mt-1 font-medium">
                      {speech.durasi} menit ·{" "}
                      {speech.ai_provider === "groq" ? "Groq" : "Gemini"} ·{" "}
                      {formatTanggal(speech.created_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => toggleExpand(speech.id)}
                    className="brutal-btn px-3 py-1.5 text-xs"
                    id={`btn-lihat-${speech.id}`}
                  >
                    {expandedId === speech.id ? "Tutup" : "Lihat naskah"}
                  </button>
                  <button
                    onClick={() => handleDownloadTxt(speech)}
                    className="brutal-btn bg-[var(--color-accent-2)] px-3 py-1.5 text-xs"
                    id={`btn-download-${speech.id}`}
                  >
                    ↓ TXT
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {expandedId === speech.id && (
                <div className="border-t-[3px] border-[var(--color-ink)] p-4 sm:p-5 bg-[var(--color-bg)]">
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-[inherit]">
                    {speech.konten}
                  </pre>
                </div>
              )}
            </article>
          ))}

        {/* Info guest */}
        {!loading && speeches.length > 0 && (
          <p className="text-xs text-black/50 text-center font-medium pt-2">
            Riwayat ini hanya tersimpan di perangkat ini.
          </p>
        )}
      </section>
    </main>
  );
}
