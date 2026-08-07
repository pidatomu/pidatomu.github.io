"use client";

import { useState, useEffect, useRef } from "react";
import { getDeviceId } from "@/lib/deviceId";
import { exportToPdf } from "@/lib/export/pdf";
import type { GayaBahasa } from "@/lib/ai/generate";

// ─── Data ────────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS = [
  "Khutbah Jumat",
  "Kultum Subuh",
  "Ceramah Peringatan Hari Besar Islam",
  "Sambutan Acara Sekolah",
  "Pidato Perpisahan",
];

const TEMA_SUGGESTIONS: Record<string, string[]> = {
  "Khutbah Jumat": ["Sabar", "Ikhlas", "Syukur", "Birrul Walidain", "Taqwa", "Kejujuran", "Taubat"],
  "Kultum Subuh": ["Sholat tepat waktu", "Dzikir pagi", "Bersedekah", "Husnuzan", "Istiqomah"],
  "Ceramah Peringatan Hari Besar Islam": [
    "Hikmah Isra Mi'raj", "Semangat Maulid Nabi", "Makna Idul Fitri",
    "Makna Idul Adha", "Keutamaan Ramadhan",
  ],
  "Sambutan Acara Sekolah": [
    "Semangat belajar", "Akhlak siswa", "Disiplin dan tanggung jawab", "Meraih prestasi",
  ],
  "Pidato Perpisahan": [
    "Kenangan indah bersama", "Doa untuk masa depan", "Terima kasih guru", "Semangat melanjutkan perjuangan",
  ],
};

const GAYA_OPTIONS: { value: GayaBahasa; label: string; desc: string }[] = [
  { value: "formal", label: "Formal", desc: "Bahasa baku resmi" },
  { value: "semi-formal", label: "Semi-formal", desc: "Santai & sopan" },
  { value: "modern-pesantren", label: "Pesantren Modern", desc: "Khas santri, akrab" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.replace(/\*\*/g, "").trim().split(/\s+/).filter(Boolean).length;
}

function estimateDuration(wordCount: number): string {
  const minutes = Math.round(wordCount / 130);
  if (minutes < 1) return "< 1 menit";
  return `~${minutes} menit`;
}

interface TextSegment {
  type: "heading" | "text";
  content: string;
}

function parseNaskah(raw: string): TextSegment[] {
  return raw.split("\n").map((line) => {
    const m = line.match(/^\*\*([^*]+)\*\*\s*$/);
    return m ? { type: "heading", content: m[1] } : { type: "text", content: line };
  });
}

function RenderedNaskah({ text, isStreaming }: { text: string; isStreaming: boolean }) {
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
      {isStreaming && <span className="streaming-cursor">▍</span>}
    </div>
  );
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────

export default function HomePage() {
  // Form state
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0]);
  const [tema, setTema] = useState("");
  const [durasi, setDurasi] = useState(10);
  const [gayaBahasa, setGayaBahasa] = useState<GayaBahasa>("formal");

  // Personalisasi
  const [showPersonalisasi, setShowPersonalisasi] = useState(false);
  const [namaPenceramah, setNamaPenceramah] = useState("");
  const [namaLokasi, setNamaLokasi] = useState("");
  const [tanggal, setTanggal] = useState("");

  // Generate state
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [editMode, setEditMode] = useState(false);
  const [editedHasil, setEditedHasil] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Export state
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Salin Teks");
  const [linkCopied, setLinkCopied] = useState(false);

  const activeHasil = editMode ? editedHasil : (hasil ?? "");
  const wordCount = countWords(activeHasil);
  const suggestions = TEMA_SUGGESTIONS[kategori] ?? [];

  // Sync editedHasil saat hasil berubah (setelah generate)
  useEffect(() => {
    if (hasil !== null) setEditedHasil(hasil);
  }, [hasil]);

  // Auto-resize textarea
  useEffect(() => {
    if (editMode && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [editMode, editedHasil]);

  // Set default tanggal hari ini
  useEffect(() => {
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
    setTanggal(today);
  }, []);

  // ── Generate ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tema.trim()) { setError("Isi dulu tema pidatonya ya."); return; }

    setLoading(true);
    setError(null);
    setHasil("");
    setEditMode(false);
    setShareToken(null);
    setCopyLabel("Salin Teks");

    try {
      const res = await fetch("/api/generate-pidato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategori, tema, durasi, gayaBahasa,
          deviceId: getDeviceId(),
          namaPenceramah: namaPenceramah.trim() || undefined,
          namaLokasi: namaLokasi.trim() || undefined,
          tanggal: tanggal.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Naskah gagal dibuat. Coba lagi.");
        setHasil(null);
        return;
      }

      setProvider(res.headers.get("X-Provider"));
      const rem = res.headers.get("X-Remaining");
      setRemaining(rem !== null ? Number(rem) : null);
      setShareToken(res.headers.get("X-Share-Token"));

      if (!res.body) throw new Error("Tidak ada stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setHasil((prev) => (prev ?? "") + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError("Koneksi bermasalah. Cek internet lalu coba lagi.");
      setHasil(null);
    } finally {
      setLoading(false);
    }
  }

  // ── Copy teks ─────────────────────────────────────────────────────────────
  function handleCopyText() {
    navigator.clipboard.writeText(activeHasil).then(() => {
      setCopyLabel("Tersalin ✓");
      setTimeout(() => setCopyLabel("Salin Teks"), 2000);
    });
  }

  // ── Copy share link ────────────────────────────────────────────────────────
  function handleCopyLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/naskah/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  // ── Download TXT ──────────────────────────────────────────────────────────
  function handleDownloadTxt() {
    const blob = new Blob([activeHasil], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pidato-${tema.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Download DOCX ─────────────────────────────────────────────────────────
  async function handleDownloadDocx() {
    setDownloading("docx");
    try {
      const res = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          konten: activeHasil,
          tema, kategori, provider,
          namaPenceramah: namaPenceramah || undefined,
          namaLokasi: namaLokasi || undefined,
          tanggal: tanggal || undefined,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pidato-${tema.toLowerCase().replace(/\s+/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Gagal generate DOCX. Coba lagi.");
    } finally {
      setDownloading(null);
    }
  }

  // ── Download PDF ──────────────────────────────────────────────────────────
  function handleDownloadPdf() {
    setDownloading("pdf");
    setTimeout(() => {
      exportToPdf({
        konten: activeHasil, tema, kategori,
        namaPenceramah: namaPenceramah || undefined,
        namaLokasi: namaLokasi || undefined,
        tanggal: tanggal || undefined,
        provider: provider ?? undefined,
      });
      setDownloading(null);
    }, 100);
  }

  // ── Print ─────────────────────────────────────────────────────────────────
  function handlePrint() { window.print(); }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen px-4 pt-6 pb-16">

      {/* ── Form ── */}
      <section className="max-w-2xl mx-auto no-print">
        <form onSubmit={handleSubmit} className="brutal-card p-6 sm:p-8 space-y-5">

          {/* Row: Kategori + Gaya Bahasa */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="kategori" className="form-label">Jenis Kegiatan</label>
              <select
                id="kategori"
                value={kategori}
                onChange={(e) => { setKategori(e.target.value); setTema(""); }}
                className="brutal-input w-full px-3 py-2.5 text-sm font-medium"
              >
                {KATEGORI_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Gaya Bahasa</label>
              <div className="flex gap-2">
                {GAYA_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGayaBahasa(g.value)}
                    title={g.desc}
                    className={`gaya-chip ${gayaBahasa === g.value ? "gaya-chip--active" : ""}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tema */}
          <div>
            <label htmlFor="tema" className="form-label">Tema Pidato</label>
            <input
              id="tema"
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Contoh: pentingnya menuntut ilmu"
              className="brutal-input w-full px-3 py-2.5 text-sm font-medium placeholder:text-black/40"
            />
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((s) => (
                  <button
                    key={s} type="button" onClick={() => setTema(s)}
                    className={`suggestion-chip ${tema === s ? "suggestion-chip--active" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Durasi */}
          <div>
            <label htmlFor="durasi" className="form-label">
              Durasi: <span className="text-[var(--color-ink)] font-bold">{durasi} menit</span>
            </label>
            <input
              id="durasi" type="range" min={3} max={30} step={1}
              value={durasi}
              onChange={(e) => setDurasi(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="flex justify-between text-xs text-black/40 mt-1 font-medium">
              <span>3 mnt</span><span>30 mnt</span>
            </div>
          </div>

          {/* Personalisasi (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowPersonalisasi((p) => !p)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
              id="btn-toggle-personalisasi"
            >
              <span className={`transition-transform ${showPersonalisasi ? "rotate-90" : ""}`}>▶</span>
              Personalisasi Naskah {showPersonalisasi ? "" : "(opsional)"}
            </button>

            {showPersonalisasi && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="namaPenceramah" className="form-label">Nama Khatib / Penceramah</label>
                  <input
                    id="namaPenceramah" type="text"
                    value={namaPenceramah}
                    onChange={(e) => setNamaPenceramah(e.target.value)}
                    placeholder="Ustadz Ahmad Fauzi"
                    className="brutal-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="namaLokasi" className="form-label">Masjid / Sekolah</label>
                  <input
                    id="namaLokasi" type="text"
                    value={namaLokasi}
                    onChange={(e) => setNamaLokasi(e.target.value)}
                    placeholder="Masjid Al-Ikhlas"
                    className="brutal-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="tanggal" className="form-label">Tanggal Acara</label>
                  <input
                    id="tanggal" type="text"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="brutal-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit" id="btn-generate"
            disabled={loading}
            className="brutal-btn w-full py-3 text-sm"
          >
            {loading
              ? <span className="loading-dots">Menyusun naskah</span>
              : "Buat Naskah →"}
          </button>

          {error && (
            <p className="text-sm font-medium border-[3px] border-[var(--color-ink)] bg-[var(--color-danger)]/20 px-3 py-2">
              {error}
            </p>
          )}
        </form>
      </section>

      {/* ── Skeleton loading ── */}
      {loading && hasil === "" && (
        <section className="max-w-2xl mx-auto mt-6 no-print">
          <div className="brutal-card p-6 space-y-3">
            <div className="skeleton-line w-1/4" />
            <div className="skeleton-line w-full" />
            <div className="skeleton-line w-full" />
            <div className="skeleton-line w-3/4" />
            <div className="skeleton-line w-full mt-4" />
            <div className="skeleton-line w-5/6" />
            <div className="skeleton-line w-full" />
            <div className="skeleton-line w-2/3 mt-4" />
          </div>
        </section>
      )}

      {/* ── Hasil ── */}
      {hasil !== null && hasil !== "" && (
        <section className="max-w-2xl mx-auto mt-6" id="hasil-naskah">

          {/* Stats bar */}
          <div className="no-print flex items-center gap-4 mb-3 flex-wrap">
            <div className="stats-pill">{wordCount.toLocaleString("id")} kata</div>
            <div className="stats-pill">⏱ {estimateDuration(wordCount)}</div>
            <div className="stats-pill">{activeHasil.length.toLocaleString("id")} karakter</div>
            <div className="stats-pill">
              {provider === "groq" ? "⚡ Groq AI" : "✦ Gemini AI"}
            </div>
            {remaining !== null && (
              <div className="stats-pill">Sisa kuota: {remaining}/hari</div>
            )}
          </div>

          {/* Action bar */}
          <div className="no-print brutal-card px-4 py-3 mb-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {/* Toggle edit */}
              <button
                id="btn-toggle-edit"
                onClick={() => setEditMode((e) => !e)}
                className={`brutal-btn px-3 py-1.5 text-xs ${editMode ? "bg-[var(--color-accent)]" : ""}`}
              >
                {editMode ? "✏️ Mode Edit" : "✏️ Edit"}
              </button>
              <button onClick={handleCopyText} className="brutal-btn bg-[var(--color-accent-2)] px-3 py-1.5 text-xs" id="btn-copy">
                {copyLabel}
              </button>
            </div>

            {/* Export */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleDownloadDocx}
                disabled={!!downloading}
                className="brutal-btn px-3 py-1.5 text-xs"
                id="btn-export-docx"
              >
                {downloading === "docx" ? "..." : "📄 DOCX"}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={!!downloading}
                className="brutal-btn px-3 py-1.5 text-xs"
                id="btn-export-pdf"
              >
                {downloading === "pdf" ? "..." : "📋 PDF"}
              </button>
              <button onClick={handleDownloadTxt} className="brutal-btn px-3 py-1.5 text-xs" id="btn-export-txt">
                📝 TXT
              </button>
              <button onClick={handlePrint} className="brutal-btn bg-[var(--color-accent-2)] px-3 py-1.5 text-xs" id="btn-print">
                🖨 Cetak
              </button>
            </div>
          </div>

          {/* Editor / Preview */}
          {editMode ? (
            <div className="brutal-card overflow-hidden">
              <div className="bg-[var(--color-accent)] px-4 py-2 border-b-[3px] border-[var(--color-ink)] text-xs font-bold uppercase">
                Mode Edit — perubahan tidak tersimpan ke riwayat
              </div>
              <textarea
                ref={textareaRef}
                value={editedHasil}
                onChange={(e) => setEditedHasil(e.target.value)}
                className="w-full p-5 text-sm leading-relaxed font-[inherit] resize-none border-none outline-none bg-white"
                style={{ minHeight: "400px" }}
                id="textarea-edit"
              />
            </div>
          ) : (
            <article className="brutal-card p-6 sm:p-8 print-area">
              {namaPenceramah && (
                <p className="text-xs font-bold text-black/50 mb-4 uppercase tracking-wide">
                  {kategori} · {namaPenceramah}{namaLokasi ? ` · ${namaLokasi}` : ""}{tanggal ? ` · ${tanggal}` : ""}
                </p>
              )}
              <RenderedNaskah text={hasil} isStreaming={loading} />
            </article>
          )}

          {/* Share bar */}
          {shareToken && !loading && (
            <div className="no-print mt-4 brutal-card px-4 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wide">Bagikan:</span>
              <code className="text-xs bg-black/5 border border-black/20 px-2 py-1 flex-1 min-w-0 truncate">
                {typeof window !== "undefined" ? `${window.location.origin}/naskah/${shareToken}` : `/naskah/${shareToken}`}
              </code>
              <button
                onClick={handleCopyLink}
                className="brutal-btn bg-[var(--color-accent-2)] px-3 py-1.5 text-xs shrink-0"
                id="btn-copy-link"
              >
                {linkCopied ? "Tersalin ✓" : "🔗 Salin Link"}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
