"use client";

import { useMemo } from "react";
import {
  Sparkles, Zap, Download, Share2, Star, Clock, FileText,
  BookOpen, Lightbulb, TrendingUp, Keyboard, Wand2, Target,
  CheckCircle2, ArrowRight,
} from "lucide-react";
import { getStats, getRecentThemes, type UserStats } from "@/lib/storage";

// ─── Tips Panel ──────────────────────────────────────────────────────────────

const TIPS = [
  { icon: <Target className="w-3.5 h-3.5" />, text: "Tentukan tema spesifik agar naskah lebih fokus dan mendalam." },
  { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Pilih gaya bahasa yang sesuai dengan audiens tujuanmu." },
  { icon: <Clock className="w-3.5 h-3.5" />, text: "Durasi 10-15 menit ideal untuk khutbah Jumat." },
  { icon: <Wand2 className="w-3.5 h-3.5" />, text: "Gunakan mode edit untuk personalisasi setelah naskah jadi." },
  { icon: <Download className="w-3.5 h-3.5" />, text: "Export ke DOCX untuk format Word yang rapi." },
  { icon: <Share2 className="w-3.5 h-3.5" />, text: "Bagikan naskah via link atau QR Code ke teman." },
];

function TipsPanel() {
  return (
    <div className="brutal-card p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        Tips Naskah
      </h3>
      <div className="space-y-2.5">
        {TIPS.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 text-[var(--color-accent)] shrink-0">{tip.icon}</span>
            <span className="text-black/70 font-medium leading-relaxed">{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Panel ─────────────────────────────────────────────────────────────

function StatsPanel() {
  const stats = useMemo(() => getStats(), []);

  if (stats.totalGenerated === 0) return null;

  const topCategory = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="brutal-card p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <TrendingUp className="w-3.5 h-3.5 text-[var(--color-accent-2)]" />
        Statistik Saya
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 border border-black/10">
          <div className="text-lg font-bold">{stats.totalGenerated}</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Naskah</div>
        </div>
        <div className="text-center p-2 border border-black/10">
          <div className="text-lg font-bold">{Math.round(stats.totalWords / 130)}</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Menit Hemat</div>
        </div>
        <div className="text-center p-2 border border-black/10">
          <div className="text-lg font-bold">{(stats.totalWords / 1000).toFixed(1)}k</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Kata Ditulis</div>
        </div>
        <div className="text-center p-2 border border-black/10">
          <div className="text-lg font-bold">{topCategory ? topCategory[0].split(" ")[0] : "-"}</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Top Kategori</div>
        </div>
      </div>
    </div>
  );
}

// ─── Features Panel ──────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <Zap className="w-3.5 h-3.5" />, label: "Streaming Real-time", desc: "Naskah muncul karakter per karakter" },
  { icon: <BookOpen className="w-3.5 h-3.5" />, label: "5 Kategori", desc: "Khutbah, kultum, ceramah, sambutan, pidato" },
  { icon: <Wand2 className="w-3.5 h-3.5" />, label: "3 Gaya Bahasa", desc: "Formal, semi-formal, pesantren modern" },
  { icon: <Download className="w-3.5 h-3.5" />, label: "Multi Export", desc: "DOCX, PDF, TXT, atau cetak langsung" },
  { icon: <Share2 className="w-3.5 h-3.5" />, label: "Share & QR Code", desc: "Bagikan naskah via link atau QR" },
  { icon: <FileText className="w-3.5 h-3.5" />, label: "Editor Built-in", desc: "Edit naskah langsung di browser" },
  { icon: <Star className="w-3.5 h-3.5" />, label: "Favorit & Draft", desc: "Simpan tema favorit dan draft otomatis" },
  { icon: <Keyboard className="w-3.5 h-3.5" />, label: "Keyboard Shortcuts", desc: "16 shortcuts untuk produktivitas" },
];

function FeaturesPanel() {
  return (
    <div className="brutal-card p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        Fitur Unggulan
      </h3>
      <div className="space-y-2">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5 p-2 hover:bg-black/[0.02] transition-colors">
            <span className="w-7 h-7 flex items-center justify-center border border-black/10 bg-[var(--color-accent)]/10 text-[var(--color-accent)] shrink-0">
              {f.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold">{f.label}</p>
              <p className="text-[0.6rem] text-black/40 font-medium truncate">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shortcuts Reference Panel ───────────────────────────────────────────────

const SHORTCUT_REFS = [
  { keys: "Ctrl + Enter", action: "Generate naskah" },
  { keys: "Ctrl + S", action: "Simpan draft" },
  { keys: "Ctrl + E", action: "Toggle edit mode" },
  { keys: "Ctrl + D", action: "Toggle dark mode" },
  { keys: "Ctrl + H", action: "Find & Replace" },
  { keys: "/", action: "Focus ke input tema" },
];

function ShortcutsPanel() {
  return (
    <div className="brutal-card p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Keyboard className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        Shortcut
      </h3>
      <div className="space-y-1.5">
        {SHORTCUT_REFS.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-black/60 font-medium">{s.action}</span>
            <kbd className="px-1.5 py-0.5 border border-black/20 bg-black/5 font-mono text-[0.6rem] font-bold whitespace-nowrap">
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Exported Sidebar ────────────────────────────────────────────────────────

export default function Sidebar() {
  return (
    <aside className="space-y-4 no-print">
      <StatsPanel />
      <TipsPanel />
      <FeaturesPanel />
      <ShortcutsPanel />

      {/* CTA */}
      <div className="brutal-card p-4 bg-[var(--color-accent)] text-[var(--color-ink)]">
        <h3 className="font-display text-sm font-bold uppercase mb-1">Butuh Lebih Banyak?</h3>
        <p className="text-[0.65rem] font-medium mb-3 opacity-80">
          Buat naskah dengan personalisasi lengkap: nama khatib, lokasi, target audiens, dan banyak lagi.
        </p>
        <div className="flex items-center gap-1 text-xs font-bold">
          <CheckCircle2 className="w-3 h-3" />
          <span>Semua fitur gratis, tanpa batas</span>
        </div>
      </div>
    </aside>
  );
}
