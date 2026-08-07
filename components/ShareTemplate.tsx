"use client";

import { useState, useMemo } from "react";
import { Link, Copy, Upload, Download } from "lucide-react";

interface ShareTemplateProps {
  settings: {
    kategori: string;
    tema: string;
    durasi: number;
    gayaBahasa: string;
    [key: string]: any;
  };
  onImport: (settings: Record<string, any>) => void;
}

export default function ShareTemplate({ settings, onImport }: ShareTemplateProps) {
  const [importInput, setImportInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const encoded = useMemo(() => {
    const json = JSON.stringify(settings);
    return btoa(unescape(encodeURIComponent(json)));
  }, [settings]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}?template=${encoded}`;
  }, [encoded]);

  const handleExport = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setError("");
    try {
      let raw = importInput.trim();

      if (raw.includes("?template=")) {
        raw = raw.split("?template=")[1];
      }

      const json = decodeURIComponent(escape(atob(raw)));
      const parsed = JSON.parse(json);

      if (!parsed.kategori || !parsed.tema) {
        setError("Template tidak valid: kategori dan tema diperlukan");
        return;
      }

      onImport(parsed);
      setImportInput("");
    } catch {
      setError("Format template tidak valid");
    }
  };

  const preview = useMemo(() => {
    if (!importInput.trim()) return null;
    try {
      let raw = importInput.trim();
      if (raw.includes("?template=")) raw = raw.split("?template=")[1];
      const json = decodeURIComponent(escape(atob(raw)));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [importInput]);

  return (
    <div className="brutal-card p-4 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
        <Link className="w-3 h-3" />
        Bagikan Template
      </h4>

      {/* Export */}
      <div>
        <button onClick={handleExport} className="brutal-btn px-3 py-2 text-xs font-bold flex items-center gap-2 w-full">
          <Download className="w-3 h-3" />
          {copied ? "Tautan Disalin!" : "Ekspor Template"}
        </button>
        <p className="text-[0.6rem] text-black/40 mt-1 font-medium">
          Salin tautan untuk membagikan pengaturan ini
        </p>
      </div>

      {/* Import */}
      <div>
        <label className="text-[0.65rem] font-bold uppercase text-black/50 block mb-1">
          Impor Template
        </label>
        <div className="flex gap-2">
          <input
            value={importInput}
            onChange={(e) => setImportInput(e.target.value)}
            placeholder="Tempel URL atau kode base64..."
            className="flex-1 border-3 border-[var(--color-ink)] px-3 py-2 text-xs font-medium bg-white focus:outline-none focus:ring-0 placeholder:text-black/30"
          />
          <button
            onClick={handleImport}
            disabled={!importInput.trim()}
            className="brutal-btn px-3 py-2 text-xs font-bold disabled:opacity-40"
            title="Impor"
          >
            <Upload className="w-3 h-3" />
          </button>
        </div>
        {error && (
          <p className="text-[0.65rem] font-bold text-[var(--color-danger)] mt-1">{error}</p>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="border-2 border-black/10 bg-black/[0.02] p-3 text-xs space-y-1">
          <div className="text-[0.6rem] font-bold uppercase text-black/40 mb-2">Pratinjau</div>
          {Object.entries(preview).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-semibold text-black/60">{key}</span>
              <span className="font-bold">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
