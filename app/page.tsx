"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getDeviceId } from "@/lib/deviceId";
import { exportToPdf } from "@/lib/export/pdf";
import type { GayaBahasa } from "@/lib/ai/generate";
import { analyzeReadability, getSentiment, getKeywordDensity, getSentenceComplexity, getReadingTime } from "@/lib/readability";
import { storage, getDrafts, saveDraft, deleteDraft, getFavoriteThemes, toggleFavoriteTheme, getRecentThemes, addRecentTheme, getSettings, updateSettings, getStats, updateStats, type Draft, type AppSettings, type UserStats } from "@/lib/storage";
import { findMatchingShortcut, SHORTCUTS } from "@/lib/shortcuts";
import SpeechStats from "@/components/SpeechStats";
import EditorToolbar, { FindReplaceBar } from "@/components/EditorToolbar";
import DarkModeToggle from "@/components/DarkModeToggle";
import Sidebar from "@/components/Sidebar";
import {
  BookOpen,
  MessageCircle,
  Landmark,
  GraduationCap,
  Flame,
  Megaphone,
  AlertTriangle,
  Smile,
  Save,
  FileText,
  Keyboard,
  X,
  Pencil,
  Eye,
  FileDown,
  File,
  Printer,
  BarChart3,
  List,
  Link2,
  Star,
  Clock,
  Loader2,
  Sparkles,
  Zap,
  Download,
  Share2,
  QrCode as QrCodeIcon,
  Key,
  Send,
  ExternalLink,
  Mic,
  LayoutTemplate,
  GitCompareArrows,
  Maximize2,
  Minimize2,
  History,
  Volume2,
  ChevronDown,
  ChevronUp,
  Copy as CopyIcon,
  RefreshCw,
  Lightbulb,
  ArrowDownToLine,
  BarChart,
} from "lucide-react";
import VoicePreview from "@/components/VoicePreview";
import TemplateLibrary from "@/components/TemplateLibrary";
import CompareMode from "@/components/CompareMode";
import FullscreenMode from "@/components/FullscreenMode";
import ToneSlider from "@/components/ToneSlider";
import WordChart from "@/components/WordChart";
import GoalTracker from "@/components/GoalTracker";
import ThemeHeatmap from "@/components/ThemeHeatmap";
import PrintPreview from "@/components/PrintPreview";
import ShareTemplate from "@/components/ShareTemplate";
import GeneratingSpinner from "@/components/GeneratingSpinner";
import { getWordFrequency, getReadingTimeline, getVocabularyRichness } from "@/lib/analytics";
import { saveVersion, getVersions, type Version } from "@/lib/version-history";
import { recordGeneration, resetWeeklyIfNeeded, getProgress } from "@/lib/goals";
import { downloadFile } from "@/lib/batch-export";
import AnimatedText from "@/components/AnimatedText";
import MobileNav from "@/components/MobileNav";
import InlineEditor from "@/components/InlineEditor";
import DragReorder from "@/components/DragReorder";
import CustomPrompt from "@/components/CustomPrompt";
import ProviderPicker from "@/components/ProviderPicker";
import TemplatePreview from "@/components/TemplatePreview";
import WordDiff from "@/components/WordDiff";
import ReadingTime from "@/components/ReadingTime";
import SentimentTimeline from "@/components/SentimentTimeline";
import VocabSuggest from "@/components/VocabSuggest";
import DifficultyScore from "@/components/DifficultyScore";
import AnalyticsReport from "@/components/AnalyticsReport";
import RateLimitDashboard from "@/components/RateLimitDashboard";
import QuoteInsert from "@/components/QuoteInsert";
import CollabIndicator from "@/components/CollabIndicator";
import { startAutoSave } from "@/lib/auto-save";
import { cacheNaskah, isOnline } from "@/lib/offline";
import { sendToTelegram, sendToWhatsApp, sendToEmail } from "@/lib/webhook";

// ─── Data ────────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS = [
  "Khutbah Jumat",
  "Kultum Subuh",
  "Ceramah Peringatan Hari Besar Islam",
  "Sambutan Acara Sekolah",
  "Pidato Perpisahan",
];

const TEMA_SUGGESTIONS: Record<string, string[]> = {
  "Khutbah Jumat": ["Sabar", "Ikhlas", "Syukur", "Birrul Walidain", "Taqwa", "Kejujuran", "Taubat", "Ukhuwah", "Jihad", "Ilmu"],
  "Kultum Subuh": ["Sholat tepat waktu", "Dzikir pagi", "Bersedekah", "Husnuzan", "Istiqomah", "Tahajud", "Puasa sunnah"],
  "Ceramah Peringatan Hari Besar Islam": ["Hikmah Isra Mi'raj", "Semangat Maulid Nabi", "Makna Idul Fitri", "Makna Idul Adha", "Keutamaan Ramadhan"],
  "Sambutan Acara Sekolah": ["Semangat belajar", "Akhlak siswa", "Disiplin dan tanggung jawab", "Meraih prestasi", "Gotong royong"],
  "Pidato Perpisahan": ["Kenangan indah bersama", "Doa untuk masa depan", "Terima kasih guru", "Semangat melanjutkan perjuangan"],
};

const GAYA_OPTIONS: { value: GayaBahasa; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "formal", label: "Formal", desc: "Bahasa baku resmi", icon: <BookOpen className="w-3 h-3" /> },
  { value: "semi-formal", label: "Semi-formal", desc: "Santai & sopan", icon: <MessageCircle className="w-3 h-3" /> },
  { value: "modern-pesantren", label: "Pesantren Modern", desc: "Khas santri, akrab", icon: <Landmark className="w-3 h-3" /> },
];

const TARGET_AUDIENS = [
  { value: "umum", label: "Umum" },
  { value: "pelajar-sd", label: "Pelajar SD" },
  { value: "pelajar-smp", label: "Pelajar SMP" },
  { value: "pelajar-sma", label: "Pelajar SMA" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "dewasa", label: "Dewasa" },
  { value: "lansia", label: "Lansia" },
];

const TUJUAN_PIDATO = [
  { value: "edukasi", label: "Edukasi", icon: <GraduationCap className="w-3 h-3" /> },
  { value: "motivasi", label: "Motivasi", icon: <Flame className="w-3 h-3" /> },
  { value: "informasi", label: "Informasi", icon: <Megaphone className="w-3 h-3" /> },
  { value: "peringatan", label: "Peringatan", icon: <AlertTriangle className="w-3 h-3" /> },
  { value: "hiburan", label: "Hiburan", icon: <Smile className="w-3 h-3" /> },
];

const NADA_EMOSI = [
  { value: 1, label: "Tenang", color: "#22c55e" },
  { value: 2, label: "Lembut", color: "#84cc16" },
  { value: 3, label: "Normal", color: "var(--color-accent)" },
  { value: 4, label: "Semangat", color: "#f59e0b" },
  { value: 5, label: "Penuh Api", color: "var(--color-danger)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.replace(/\*\*/g, "").trim().split(/\s+/).filter(Boolean).length;
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

function generateShareUrl(token: string): string {
  if (typeof window === "undefined") return `/naskah/${token}`;
  return `${window.location.origin}/naskah/${token}`;
}

// ─── Table of Contents ───────────────────────────────────────────────────────

function TableOfContents({ text }: { text: string }) {
  const headings = useMemo(() => {
    return text.split("\n").filter((l) => /^\*\*[^*]+\*\*\s*$/.test(l)).map((l) => l.replace(/\*\*/g, "").trim());
  }, [text]);

  if (headings.length < 2) return null;

  return (
    <div className="brutal-card p-4 mb-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
        <List className="w-2 h-2" />
        Daftar Isi
      </h4>
      <ol className="list-decimal list-inside space-y-1">
        {headings.map((h, i) => (
          <li key={i} className="text-xs font-medium text-black/70 hover:text-black cursor-pointer">
            {h}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Keyboard Shortcuts Panel ────────────────────────────────────────────────

function ShortcutsPanel({ onClose }: { onClose: () => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, typeof SHORTCUTS> = {};
    for (const s of SHORTCUTS) {
      if (!g[s.category]) g[s.category] = [];
      g[s.category].push(s);
    }
    return g;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="brutal-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold uppercase">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="font-bold text-black/40 hover:text-black cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        {Object.entries(grouped).map(([category, shortcuts]) => (
          <div key={category} className="mb-3">
            <h4 className="text-[0.65rem] font-bold uppercase text-black/40 mb-1.5">{category}</h4>
            <div className="space-y-1">
              {shortcuts.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs py-1">
                  <span className="font-medium">{s.label}</span>
                  <kbd className="px-2 py-0.5 border border-black/20 bg-black/5 font-mono text-[0.65rem] font-bold">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomePage() {
  // ── Form State ──
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0]);
  const [tema, setTema] = useState("");
  const [durasi, setDurasi] = useState(10);
  const [gayaBahasa, setGayaBahasa] = useState<GayaBahasa>("formal");

  // ── Advanced Settings ──
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [namaPenceramah, setNamaPenceramah] = useState("");
  const [namaLokasi, setNamaLokasi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [targetAudiens, setTargetAudiens] = useState("umum");
  const [tujuanPidato, setTujuanPidato] = useState("edukasi");
  const [nadaEmosi, setNadaEmosi] = useState(3);
  const [kutipanHadits, setKutipanHadits] = useState(true);
  const [kutipanQuran, setKutipanQuran] = useState(true);
  const [ceritaPengantar, setCeritaPengantar] = useState(true);
  const [targetKata, setTargetKata] = useState<number | null>(null);

  // ── Generate State ──
  const [loading, setLoading] = useState(false);
  const [genStatus, setGenStatus] = useState<"generating" | "refining">("generating");
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [hasil, setHasil] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refinementInfo, setRefinementInfo] = useState<{ refined: boolean; originalWords?: number; finalWords?: number } | null>(null);

  // ── Editor State ──
  const [editMode, setEditMode] = useState(false);
  const [editedHasil, setEditedHasil] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Find & Replace ──
  const [findVisible, setFindVisible] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  // ── Export State ──
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Salin Teks");
  const [linkCopied, setLinkCopied] = useState(false);

  // ── UI State ──
  const [showDrafts, setShowDrafts] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTOC, setShowTOC] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "stats" | "keywords" | "analisis">("preview");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  // ── New Feature States ──
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showCompareMode, setShowCompareMode] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toneValue, setToneValue] = useState(3);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showGoalTracker, setShowGoalTracker] = useState(false);
  const [showWordChart, setShowWordChart] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showShareTemplate, setShowShareTemplate] = useState(false);
  const [originalHasil, setOriginalHasil] = useState<string | null>(null);

  // ── 20 New Features ──
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiProvider, setAiProvider] = useState<"auto" | "groq" | "gemini">("auto");
  const [showQuoteInsert, setShowQuoteInsert] = useState(false);
  const [showAnalyticsReport, setShowAnalyticsReport] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState<any>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [mobileTab, setMobileTab] = useState("buat");
  const [naskahSections, setNaskahSections] = useState<{ id: string; title: string; content: string }[]>([]);
  const [isOffline, setIsOffline] = useState(true);
  const [showDiff, setShowDiff] = useState(false);

  // ── Persistent State ──
  const [settings, setSettings] = useState<AppSettings>(getSettings);
  const [stats, setStats] = useState<UserStats>(getStats);
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>([]);
  const [recentThemes, setRecentThemes] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // ── Refs ──
  const themeInputRef = useRef<HTMLInputElement>(null);
  const hasilRef = useRef<HTMLDivElement>(null);

  // ── Computed ──
  const activeHasil = editMode ? editedHasil : (hasil ?? "");
  const wordCount = countWords(activeHasil);
  const charCount = activeHasil.length;
  const suggestions = TEMA_SUGGESTIONS[kategori] ?? [];
  const readingTime = getReadingTime(wordCount);
  const fontSizeClass = fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";

  // ── Effects ──
  useEffect(() => {
    if (hasil !== null) setEditedHasil(hasil);
  }, [hasil]);

  useEffect(() => {
    if (editMode && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [editMode, editedHasil]);

  useEffect(() => {
    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    setTanggal(today);
    setFavoriteThemes(getFavoriteThemes());
    setRecentThemes(getRecentThemes());
    setDrafts(getDrafts());
    resetWeeklyIfNeeded();
    setVersions(getVersions());
  }, []);

  // Save version when generation completes
  useEffect(() => {
    if (hasil && !loading && hasil.length > 100) {
      saveVersion(hasil, `Generate: ${tema}`);
      setVersions(getVersions());
    }
  }, [hasil, loading]);

  // ── Find & Replace Logic ──
  useEffect(() => {
    if (!findText || !editMode) {
      setMatchCount(0);
      return;
    }
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = editedHasil.match(regex);
    setMatchCount(matches?.length ?? 0);
  }, [findText, editedHasil, editMode]);

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const shortcut = findMatchingShortcut(e);
      if (!shortcut) return;
      e.preventDefault();

      switch (shortcut.id) {
        case "generate":
          if (!loading && tema.trim()) {
            const form = document.getElementById("btn-generate") as HTMLButtonElement;
            form?.click();
          }
          break;
        case "save-draft":
          handleSaveDraft();
          break;
        case "export-txt":
          handleDownloadTxt();
          break;
        case "export-pdf":
          handleDownloadPdf();
          break;
        case "export-docx":
          handleDownloadDocx();
          break;
        case "copy-text":
          handleCopyText();
          break;
        case "toggle-edit":
          if (hasil) setEditMode((e) => !e);
          break;
        case "find-replace":
          if (editMode) setFindVisible((v) => !v);
          break;
        case "print":
          window.print();
          break;
        case "focus-theme":
          themeInputRef.current?.focus();
          break;
        case "toggle-dark":
          setSettings((s) => updateSettings({ darkMode: !s.darkMode }));
          break;
        case "font-up":
          setFontSize((f) => (f === "sm" ? "md" : f === "md" ? "lg" : "lg"));
          break;
        case "font-down":
          setFontSize((f) => (f === "lg" ? "md" : f === "md" ? "sm" : "sm"));
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, tema, hasil, editMode, editedHasil, findText]);

  // ── Draft Management ──
  function handleSaveDraft() {
    const d = saveDraft({
      kategori, tema, durasi, gayaBahasa,
      namaPenceramah, namaLokasi, tanggal,
      targetAudiens, tujuanPidato, nadaEmosi,
      kutipanHadits, kutipanQuran, ceritaPengantar,
    });
    setDrafts(getDrafts());
    return d;
  }

  function handleLoadDraft(d: Draft) {
    setKategori(d.kategori);
    setTema(d.tema);
    setDurasi(d.durasi);
    setGayaBahasa(d.gayaBahasa as GayaBahasa);
    setNamaPenceramah(d.namaPenceramah ?? "");
    setNamaLokasi(d.namaLokasi ?? "");
    setTanggal(d.tanggal ?? "");
    if (d.targetAudiens) setTargetAudiens(d.targetAudiens);
    if (d.tujuanPidato) setTujuanPidato(d.tujuanPidato);
    if (d.nadaEmosi) setNadaEmosi(d.nadaEmosi);
    if (d.kutipanHadits !== undefined) setKutipanHadits(d.kutipanHadits);
    if (d.kutipanQuran !== undefined) setKutipanQuran(d.kutipanQuran);
    if (d.ceritaPengantar !== undefined) setCeritaPengantar(d.ceritaPengantar);
    setShowDrafts(false);
  }

  function handleDeleteDraft(id: string) {
    deleteDraft(id);
    setDrafts(getDrafts());
  }

  // ── Theme Favorites ──
  function handleToggleFavorite(theme: string) {
    setFavoriteThemes(toggleFavoriteTheme(theme));
  }

  function handleSelectTheme(theme: string) {
    setTema(theme);
    setRecentThemes(addRecentTheme(theme));
  }

  // ── Generate ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tema.trim()) { setError("Isi dulu tema pidatonya ya."); return; }

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    setGenStatus("generating");
    setError(null);
    setHasil("");
    setEditMode(false);
    setShareToken(null);
    setCopyLabel("Salin Teks");
    setActiveTab("preview");
    setRefinementInfo(null);

    // Auto-save draft
    if (settings.autoSave) handleSaveDraft();

    // Add to recent themes
    setRecentThemes(addRecentTheme(tema.trim()));

    try {
      const res = await fetch("/api/generate-pidato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kategori, tema, durasi, gayaBahasa,
          targetKata: targetKata ?? Math.round(durasi * 130),
          deviceId: getDeviceId(),
          namaPenceramah: namaPenceramah.trim() || undefined,
          namaLokasi: namaLokasi.trim() || undefined,
          tanggal: tanggal.trim() || undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Naskah gagal dibuat. Coba lagi.");
        setHasil(null);
        return;
      }

      // Read metadata from headers
      const streamProvider = res.headers.get("X-Provider") ?? "unknown";
      const streamRemaining = res.headers.get("X-Remaining");
      const streamShareToken = res.headers.get("X-Share-Token");

      // Stream the response body
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setHasil(fullText);
        setEditedHasil(fullText);
      }

      // Stream finished — set metadata
      setProvider(streamProvider);
      setRemaining(streamRemaining ? Number(streamRemaining) : null);
      setShareToken(streamShareToken);
      setOriginalHasil(fullText);

      // Auto-save
      startAutoSave("draft_current", () => fullText);
      // Cache for offline
      cacheNaskah(Date.now().toString(), { tema, kategori, text: fullText, timestamp: Date.now() });

      // Client-side refinement: check word count
      const target = targetKata ?? Math.round(durasi * 130);
      const streamedWords = fullText.trim().split(/\s+/).filter(Boolean).length;
      const ratio = Math.abs(streamedWords - target) / target;

      if (ratio > 0.15) {
        // Off-target — call refine endpoint
        setGenStatus("refining");
        setHasil(fullText); // keep showing streamed text

        try {
          const refineRes = await fetch("/api/refine-naskah", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: fullText,
              targetKata: target,
              kategori,
              tema,
            }),
            signal: controller.signal,
          });

          if (refineRes.ok) {
            const refineData = await refineRes.json();
            if (refineData.refined) {
              setHasil(refineData.text);
              setEditedHasil(refineData.text);
              setOriginalHasil(refineData.text);
              setRefinementInfo({
                refined: true,
                originalWords: streamedWords,
                finalWords: refineData.wordCount,
              });

              // Update stats with refined text
              setStats(updateStats({
                words: refineData.text.trim().split(/\s+/).filter(Boolean).length,
                chars: refineData.text.length,
                category: kategori,
                style: gayaBahasa,
              }));
              recordGeneration();
            } else {
              setRefinementInfo({ refined: false });
              // Update stats with original text
              setStats(updateStats({
                words: streamedWords,
                chars: fullText.length,
                category: kategori,
                style: gayaBahasa,
              }));
              recordGeneration();
            }
          } else {
            // Refinement failed — keep original streamed text
            setRefinementInfo({ refined: false });
            setStats(updateStats({
              words: streamedWords,
              chars: fullText.length,
              category: kategori,
              style: gayaBahasa,
            }));
            recordGeneration();
          }
        } catch {
          // Refinement request failed — keep original
          setRefinementInfo({ refined: false });
          setStats(updateStats({
            words: streamedWords,
            chars: fullText.length,
            category: kategori,
            style: gayaBahasa,
          }));
          recordGeneration();
        }
      } else {
        // Within tolerance — no refinement needed
        setRefinementInfo({ refined: false });
        setStats(updateStats({
          words: streamedWords,
          chars: fullText.length,
          category: kategori,
          style: gayaBahasa,
        }));
        recordGeneration();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Koneksi bermasalah. Cek internet lalu coba lagi.");
      setHasil(null);
    } finally {
      setLoading(false);
      setGenStatus("generating");
      setAbortController(null);
    }
  }

  function handleCancelGenerate() {
    abortController?.abort();
    setLoading(false);
    setAbortController(null);
  }

  // ── Find & Replace ──
  function handleFindReplace() {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    setEditedHasil((prev) => prev.replace(regex, replaceText));
  }

  function handleFindReplaceAll() {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    setEditedHasil((prev) => prev.replace(regex, replaceText));
  }

  // ── Editor Toolbar Actions ──
  function handleEditorAction(action: string) {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = editedHasil.substring(start, end);

    let before = "";
    let after = "";
    let replacement = selected;

    switch (action) {
      case "bold":
        before = "**";
        after = "**";
        break;
      case "heading1":
        before = "\n**";
        after = "**\n";
        break;
      case "heading2":
        before = "\n**";
        after = "**\n";
        break;
      case "list":
        before = "\n• ";
        replacement = selected || "Item";
        break;
      case "quote":
        before = "\n> ";
        replacement = selected || "Kutipan";
        break;
      case "divider":
        before = "\n---\n";
        replacement = "";
        break;
    }

    const newText = editedHasil.substring(0, start) + before + replacement + after + editedHasil.substring(end);
    setEditedHasil(newText);
  }

  // ── Copy ──
  function handleCopyText() {
    navigator.clipboard.writeText(activeHasil).then(() => {
      setCopyLabel("Tersalin ✓");
      setTimeout(() => setCopyLabel("Salin Teks"), 2000);
    });
  }

  function handleCopyLink() {
    if (!shareToken) return;
    navigator.clipboard.writeText(generateShareUrl(shareToken)).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }

  // ── Share on Social ──
  function handleShareSocial(platform: "twitter" | "whatsapp" | "telegram") {
    if (!shareToken) return;
    const url = generateShareUrl(shareToken);
    const text = `Naskah pidato "${tema}" dari Pidatomu`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  }

  // ── Export ──
  function handleDownloadTxt() {
    const blob = new Blob([activeHasil], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pidato-${tema.toLowerCase().replace(/\s+/g, "-")}.txt`;
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
          konten: activeHasil, tema, kategori, provider,
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

  function handlePrint() { window.print(); }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <main className={`min-h-screen px-4 pt-6 pb-16 ${fontSizeClass}`}>

      {/* ── Quick Stats Bar ── */}
      {stats.totalGenerated > 0 && (
        <div className="max-w-6xl mx-auto mb-4 no-print">
          <div className="flex items-center gap-3 text-[0.65rem] font-bold text-black/30 uppercase tracking-wide flex-wrap">
            <span className="inline-flex items-center gap-1"><BarChart3 className="w-3 h-3 shrink-0" /> {stats.totalGenerated} naskah dibuat</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3 shrink-0" /> {stats.totalWords.toLocaleString("id")} kata ditulis</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 shrink-0" /> {Math.round(stats.totalWords / 130)} menit waktu dihemat</span>
          </div>
        </div>
      )}

      {/* ── Hero Section ── */}
      <section className="max-w-6xl mx-auto mb-8 text-center no-print">
        <div className="brutal-card p-8 sm:p-10 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--color-accent)] rotate-12 opacity-30" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[var(--color-accent-2)] -rotate-12 opacity-30" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 border-2 border-[var(--color-ink)] bg-[var(--color-accent-2)]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[0.65rem] font-bold uppercase tracking-wider">AI-Powered</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight mb-3">
              Buat Naskah
              <br />
              <span className="text-[var(--color-accent)] relative">
                Pidato Islami
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5C40 2 80 2 100 4C120 6 160 6 199 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-sm text-black/60 font-medium max-w-md mx-auto mb-6">
              Khutbah, kultum, ceramah, dan pidato islami berkualitas tinggi dalam hitungan detik. Didukung AI Groq & Gemini.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-[0.65rem] font-bold text-black/40 uppercase flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-3 h-3 shrink-0 text-[var(--color-accent)]" />
                Streaming Real-time
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-3 h-3 shrink-0 text-[var(--color-accent-2)]" />
                Export DOCX / PDF
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Share2 className="w-3 h-3 shrink-0 text-[var(--color-danger)]" />
                Share & QR Code
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2-Column Layout ── */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_280px] gap-6">

        {/* ── Left Column: Form + Results ── */}
        <div className="space-y-6 min-w-0">

          {/* ── Form ── */}
          <section className="no-print">
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
              <div className="flex gap-1.5">
                {GAYA_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGayaBahasa(g.value)}
                    title={g.desc}
                    className={`gaya-chip flex-1 text-center inline-flex items-center justify-center gap-1 ${gayaBahasa === g.value ? "gaya-chip--active" : ""}`}
                  >
                    {g.icon}
                    <span className="text-xs">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tema */}
          <div>
            <label htmlFor="tema" className="form-label flex items-center gap-2">
              Tema Pidato
              {tema && (
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(tema)}
                  className="inline-flex items-center gap-1 text-xs normal-case tracking-normal font-medium text-black/40 hover:text-[var(--color-danger)] transition-colors"
                  title={favoriteThemes.includes(tema) ? "Hapus dari favorit" : "Tambah ke favorit"}
                >
                  <Star className="w-3 h-3 shrink-0" /> Favorit
                </button>
              )}
            </label>
            <input
              ref={themeInputRef}
              id="tema"
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Contoh: pentingnya menuntut ilmu"
              className="brutal-input w-full px-3 py-2.5 text-sm font-medium placeholder:text-black/40"
            />
            {tema && (
              <p className="text-[0.65rem] text-black/30 mt-1 font-medium">
                {tema.length} karakter · {tema.split(/\s+/).filter(Boolean).length} kata
              </p>
            )}

            {/* Favorite Themes */}
            {favoriteThemes.length > 0 && (
              <div className="mt-2">
                <p className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase text-black/30 mb-1"><Star className="w-3 h-3 shrink-0" /> Favorit</p>
                <div className="flex flex-wrap gap-1.5">
                  {favoriteThemes.map((s) => (
                    <button
                      key={s} type="button" onClick={() => handleSelectTheme(s)}
                      className="suggestion-chip suggestion-chip--active flex items-center gap-1"
                    >
                      <span>{s}</span>
                      <span
                        className="text-[0.6rem] opacity-50 hover:opacity-100"
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(s); }}
                      >
                        ×
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Themes */}
            {recentThemes.length > 0 && (
              <div className="mt-2">
                <p className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase text-black/30 mb-1"><Clock className="w-3 h-3 shrink-0" /> Terakhir</p>
                <div className="flex flex-wrap gap-1.5">
                  {recentThemes.slice(0, 5).map((s) => (
                    <button
                      key={s} type="button" onClick={() => handleSelectTheme(s)}
                      className="suggestion-chip"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestions.map((s) => (
                  <button
                    key={s} type="button" onClick={() => handleSelectTheme(s)}
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
            <div className="relative">
              <input
                id="durasi" type="range" min={3} max={30} step={1}
                value={durasi}
                onChange={(e) => setDurasi(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
              <div className="absolute -top-5 left-0 right-0 flex justify-between pointer-events-none">
                {NADA_EMOSI.filter((_, i) => i % 3 === 0 || i === NADA_EMOSI.length - 1).map((n) => (
                  <span key={n.value} className="text-[0.55rem] text-black/20">{n.value * 10}mnt</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-black/40 mt-1 font-medium">
              <span>3 mnt</span><span>30 mnt</span>
            </div>
            <p className="text-[0.65rem] text-black/40 mt-1 font-medium">
              ≈ {targetKata ?? Math.round(durasi * 130)} kata
            </p>
            {/* Duration Preset Buttons */}
            <div className="flex gap-1.5 mt-2">
              {[5, 10, 15, 20].map((d) => (
                <button
                  key={d} type="button" onClick={() => setDurasi(d)}
                  className={`text-[0.65rem] font-bold px-2 py-1 border border-black/20 hover:bg-[var(--color-accent)] transition-colors ${
                    durasi === d ? "bg-[var(--color-accent)] border-[var(--color-ink)]" : ""
                  }`}
                >
                  {d}mnt
                </button>
              ))}
            </div>
          </div>

          {/* Target Kata (Optional) */}
          <div className="flex items-center gap-3">
            <label className="form-label mb-0">
              Target Kata:
              <span className="text-black/30 normal-case tracking-normal font-medium ml-1">
                {targetKata ? `${targetKata} kata` : `≈ ${Math.round(durasi * 130)} kata (auto)`}
              </span>
            </label>
            <div className="flex gap-1.5">
              {[null, 500, 1000, 2000].map((t) => (
                <button
                  key={String(t)} type="button"
                  onClick={() => setTargetKata(t)}
                  className={`text-[0.65rem] font-bold px-2 py-1 border border-black/20 transition-colors ${
                    targetKata === t ? "bg-[var(--color-accent)] border-[var(--color-ink)]" : "hover:bg-black/5"
                  }`}
                >
                  {t === null ? "Auto" : `${t} kata`}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings (Collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((p) => !p)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
            >
              <span className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
              Pengaturan Lanjutan {showAdvanced ? "" : "(opsional)"}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-4">
                {/* Personalisasi Dasar */}
                <div className="grid sm:grid-cols-2 gap-3">
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
                  <div>
                    <label htmlFor="tanggal" className="form-label">Tanggal Acara</label>
                    <input
                      id="tanggal" type="text"
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="brutal-input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="form-label">Target Audiens</label>
                    <select
                      value={targetAudiens}
                      onChange={(e) => setTargetAudiens(e.target.value)}
                      className="brutal-input w-full px-3 py-2 text-sm"
                    >
                      {TARGET_AUDIENS.map((a) => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tujuan Pidato */}
                <div>
                  <label className="form-label">Tujuan Pidato</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {TUJUAN_PIDATO.map((t) => (
                      <button
                        key={t.value} type="button"
                        onClick={() => setTujuanPidato(t.value)}
                        className={`gaya-chip ${tujuanPidato === t.value ? "gaya-chip--active" : ""}`}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nada Emosi */}
                <div>
                  <label className="form-label">
                    Nada Emosi: <span className="text-[var(--color-ink)]">{NADA_EMOSI.find((n) => n.value === nadaEmosi)?.label}</span>
                  </label>
                  <div className="flex gap-1">
                    {NADA_EMOSI.map((n) => (
                      <button
                        key={n.value} type="button"
                        onClick={() => setNadaEmosi(n.value)}
                        className={`flex-1 py-2 text-[0.65rem] font-bold border-2 border-black/20 transition-all ${
                          nadaEmosi === n.value
                            ? "border-[var(--color-ink)] shadow-[2px_2px_0_var(--color-ink)]"
                            : "hover:border-black/40"
                        }`}
                        style={{ backgroundColor: nadaEmosi === n.value ? n.color : "transparent" }}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="grid sm:grid-cols-3 gap-2">
                  <ToggleOption
                    label="Kutipan Hadits"
                    value={kutipanHadits}
                    onChange={setKutipanHadits}
                  />
                  <ToggleOption
                    label="Kutipan Al-Quran"
                    value={kutipanQuran}
                    onChange={setKutipanQuran}
                  />
                  <ToggleOption
                    label="Cerita Pengantar"
                    value={ceritaPengantar}
                    onChange={setCeritaPengantar}
                  />
                </div>

                {/* Font Size */}
                <div className="flex items-center gap-3">
                  <label className="form-label mb-0">Ukuran Font:</label>
                  <div className="flex gap-1.5">
                    {(["sm", "md", "lg"] as const).map((fs) => (
                      <button
                        key={fs} type="button"
                        onClick={() => setFontSize(fs)}
                        className={`text-[0.65rem] font-bold px-3 py-1 border border-black/20 transition-colors ${
                          fontSize === fs ? "bg-[var(--color-accent)] border-[var(--color-ink)]" : "hover:bg-black/5"
                        }`}
                      >
                        {fs === "sm" ? "Kecil" : fs === "md" ? "Normal" : "Besar"}
                      </button>
                    ))}
                  </div>
                </div>

                <CustomPrompt value={customPrompt} onChange={setCustomPrompt} />
                <ProviderPicker value={aiProvider} onChange={setAiProvider} />
              </div>
            )}
          </div>

          {/* Template & Tone Row */}
          <div className="grid grid-cols-[auto_1fr] items-stretch gap-3">
            <button
              type="button"
              onClick={() => setShowTemplateLibrary(true)}
              className="brutal-btn inline-flex items-center gap-1.5 px-4 h-full"
            >
              <LayoutTemplate className="w-3.5 h-3.5 shrink-0" /> Buat dari Template
            </button>
            <ToneSlider value={toneValue} onChange={setToneValue} />
          </div>

          {/* Submit Row */}
          <div className="flex items-center gap-3">
            <button
              type="submit" id="btn-generate"
              disabled={loading || !tema.trim()}
              className="brutal-btn flex-1 py-3 text-sm"
            >
              {loading
                ? <span className="loading-dots">Menyusun naskah</span>
                : "Buat Naskah →"}
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleCancelGenerate}
                className="brutal-btn bg-[var(--color-danger)]/20 border-[var(--color-danger)] px-4 py-3 text-xs"
              >
                <X className="w-3 h-3 inline" /> Batal
              </button>
            )}
          </div>

          {error && (
            <div className="text-sm font-medium border-[3px] border-[var(--color-ink)] bg-[var(--color-danger)]/20 px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="text-xs font-bold cursor-pointer">×</button>
            </div>
          )}

          {/* Drafts & Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { handleSaveDraft(); }}
              className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-black/30 hover:text-black/60 transition-colors cursor-pointer"
            >
              <Save className="w-3 h-3 shrink-0" /> Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => setShowDrafts(!showDrafts)}
              className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-black/30 hover:text-black/60 transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3 shrink-0" /> Draft ({drafts.length})
            </button>
            <button
              type="button"
              onClick={() => setShowQuoteInsert(true)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <BookOpen className="w-3 h-3 shrink-0" /> Sisipkan Dalil
            </button>
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-black/30 hover:text-black/60 transition-colors ml-auto cursor-pointer"
            >
              <Keyboard className="w-3 h-3 shrink-0" /> Shortcuts
            </button>
          </div>

          {/* Drafts Panel */}
          {showDrafts && drafts.length > 0 && (
            <div className="border-t-2 border-black/10 pt-3 space-y-2">
              <p className="text-[0.65rem] font-bold uppercase text-black/40"><FileText className="w-3 h-3 inline" /> Draft Tersimpan</p>
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center gap-2 p-2 border border-black/10 hover:bg-black/[0.02] transition-colors">
                  <button
                    type="button"
                    onClick={() => handleLoadDraft(d)}
                    className="flex-1 text-left"
                  >
                    <span className="text-xs font-bold">{d.tema || "(tanpa tema)"}</span>
                    <span className="text-[0.6rem] text-black/40 ml-2">{d.kategori} · {d.durasi}mnt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(d.id)}
                    className="text-[0.65rem] text-black/30 hover:text-[var(--color-danger)] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </section>

      {/* ── Loading Spinner ── */}
      {loading && (
        <section className="mt-6 no-print">
          <GeneratingSpinner status={genStatus} />
        </section>
      )}

      {/* ── Hasil ── */}
      {hasil !== null && hasil !== "" && (
        <FullscreenMode isFullscreen={isFullscreen} onToggle={() => setIsFullscreen(!isFullscreen)}>
        <section className="mt-6" id="hasil-naskah">

          {/* Enhanced Stats */}
          <SpeechStats
            text={hasil}
            provider={provider}
            remaining={remaining}
            showReadingLevel={settings.showReadingLevel}
            showKeywordDensity={settings.showKeywordDensity}
            showSentiment={settings.showSentiment}
            showAdvanced={showStats}
            expanded={showStats}
          />

          {/* Refinement Info */}
          {refinementInfo?.refined && refinementInfo.originalWords && refinementInfo.finalWords && (
            <div className="no-print mt-2 text-[0.65rem] font-bold text-[var(--color-accent)]">
              ✓ {refinementInfo.finalWords} kata (refined from {refinementInfo.originalWords} kata)
            </div>
          )}

          {/* Toggle Stats Detail */}
          <div className="no-print mb-3 flex items-center gap-2">
            <button
              onClick={() => setShowStats((s) => !s)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <BarChart3 className="w-3 h-3 shrink-0" /> {showStats ? "Sembunyikan" : "Tampilkan"} Statistik
            </button>
            <button
              onClick={() => setShowTOC((t) => !t)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <List className="w-3 h-3 shrink-0" /> {showTOC ? "Sembunyikan" : "Tampilkan"} Daftar Isi
            </button>
            <button
              onClick={() => setShowVersionHistory((v) => !v)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <History className="w-3 h-3 shrink-0" /> Riwayat ({versions.length})
            </button>
            <button
              onClick={() => setShowGoalTracker(true)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <Sparkles className="w-3 h-3 shrink-0" /> Target
            </button>
            <button
              onClick={() => setShowShareTemplate(true)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <CopyIcon className="w-3 h-3 shrink-0" /> Share Template
            </button>
            <button
              onClick={() => setShowAnalyticsReport(true)}
              className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
            >
              <BarChart className="w-3 h-3 shrink-0" /> Laporan
            </button>
            <span className="ml-auto text-[0.6rem] text-black/30 font-bold">
              {getReadingTime(wordCount)} · {stats.totalWords.toLocaleString("id")} kata ditulis
            </span>
          </div>

          {/* Version History Panel */}
          {showVersionHistory && versions.length > 0 && (
            <div className="brutal-card p-4 mt-3">
              <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Riwayat Versi
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 p-2 border border-black/10 hover:bg-black/[0.02]">
                    <span className="text-[0.65rem] font-bold">{v.label}</span>
                    <span className="text-[0.6rem] text-black/40 flex-1">{new Date(v.timestamp).toLocaleString("id-ID")}</span>
                    <button
                      onClick={() => { setHasil(v.content); setEditedHasil(v.content); }}
                      className="brutal-btn px-2 py-0.5 text-[0.6rem]"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="no-print brutal-card px-4 py-3 mb-4 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              <button
                id="btn-toggle-edit"
                onClick={() => setEditMode((e) => !e)}
                className={`brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs ${editMode ? "bg-[var(--color-accent)]" : ""}`}
              >
                {editMode ? <><Eye className="w-3 h-3 shrink-0" /> Preview</> : <><Pencil className="w-3 h-3 shrink-0" /> Edit</>}
              </button>
              <button onClick={handleCopyText} className="brutal-btn bg-[var(--color-accent-2)] px-3 py-1.5 text-xs" id="btn-copy">
                {copyLabel}
              </button>
              {originalHasil && hasil !== originalHasil && (
                <button onClick={() => setShowDiff(!showDiff)} className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs">
                  <GitCompareArrows className="w-3 h-3 shrink-0" /> Diff
                </button>
              )}
            </div>

            {/* Export */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={handleDownloadDocx}
                disabled={!!downloading}
                className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                id="btn-export-docx"
              >
                {downloading === "docx" ? "..." : <><FileText className="w-3 h-3 shrink-0" /> DOCX</>}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={!!downloading}
                className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                id="btn-export-pdf"
              >
                {downloading === "pdf" ? "..." : <><FileDown className="w-3 h-3 shrink-0" /> PDF</>}
              </button>
              <button onClick={handleDownloadTxt} className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs" id="btn-export-txt">
                <File className="w-3 h-3 shrink-0" /> TXT
              </button>
              <button onClick={handlePrint} className="brutal-btn bg-[var(--color-accent-2)] inline-flex items-center gap-1 px-3 py-1.5 text-xs" id="btn-print">
                <Printer className="w-3 h-3 shrink-0" /> Cetak
              </button>
              <button
                onClick={() => setShowPrintPreview(true)}
                className="brutal-btn bg-[var(--color-accent-2)] inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                <Volume2 className="w-3 h-3 shrink-0" /> Dengarkan
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="brutal-btn inline-flex items-center gap-1 px-3 py-1.5 text-xs"
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3 shrink-0" /> : <Maximize2 className="w-3 h-3 shrink-0" />}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>

          {/* Editor / Preview with Tabs */}
          <div className="brutal-card overflow-hidden">
            {/* Tab Bar */}
            <div className="no-print flex border-b-[3px] border-[var(--color-ink)]">
              {(["preview", "stats", "keywords", "analisis"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase transition-colors ${
                    activeTab === tab
                      ? "bg-[var(--color-accent)] text-[var(--color-ink)]"
                      : "text-black/40 hover:bg-black/5"
                  }`}
                >
                  {tab === "preview" ? <><Eye className="w-3 h-3 shrink-0" /> Preview</> 
                   : tab === "stats" ? <><BarChart3 className="w-3 h-3 shrink-0" /> Statistik</> 
                   : tab === "keywords" ? <><Key className="w-3 h-3 shrink-0" /> Kata Kunci</>
                   : <><BarChart className="w-3 h-3 shrink-0" /> Analisis</>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "preview" && (
              editMode ? (
                <div>
                  <EditorToolbar
                    onAction={handleEditorAction}
                    wordCount={countWords(editedHasil)}
                    charCount={editedHasil.length}
                    findVisible={findVisible}
                    onToggleFind={() => setFindVisible((v) => !v)}
                  />
                  <FindReplaceBar
                    visible={findVisible}
                    findText={findText}
                    replaceText={replaceText}
                    onFindChange={setFindText}
                    onReplaceChange={setReplaceText}
                    onReplace={handleFindReplace}
                    onReplaceAll={handleFindReplaceAll}
                    onClear={() => { setFindVisible(false); setFindText(""); setReplaceText(""); }}
                    matchCount={matchCount}
                  />
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
                <div className="p-6 sm:p-8 print-area">
                  {namaPenceramah && (
                    <p className="text-xs font-bold text-black/50 mb-4 uppercase tracking-wide">
                      {kategori} · {namaPenceramah}{namaLokasi ? ` · ${namaLokasi}` : ""}{tanggal ? ` · ${tanggal}` : ""}
                    </p>
                  )}
                  {showTOC && <TableOfContents text={hasil} />}
                  <div className="naskah-content">
                    <AnimatedText text={activeHasil} speed={30} />
                  </div>
                </div>
              )
            )}

            {activeTab === "stats" && (
              <div className="p-6">
                <SpeechStats
                  text={hasil}
                  provider={provider}
                  remaining={remaining}
                  showReadingLevel={true}
                  showKeywordDensity={false}
                  showSentiment={true}
                  showAdvanced={true}
                  expanded={true}
                />
              </div>
            )}

            {activeTab === "keywords" && (
              <div className="p-6">
                <KeywordAnalysis text={hasil} />
              </div>
            )}

            {activeTab === "analisis" && (
              <div className="p-6 space-y-6">
                <ReadingTime text={hasil} />
                <DifficultyScore text={hasil} />
                <SentimentTimeline sections={[
                  { label: "Pembuka", text: hasil.split("**ISI**")[0] || "" },
                  { label: "Isi", text: (hasil.split("**ISI**")[1] || "").split("**PENUTUP**")[0] || "" },
                  { label: "Penutup", text: hasil.split("**PENUTUP**")[1] || "" },
                ]} />
                <VocabSuggest text={hasil} onReplace={(old, nw) => setHasil((h) => h?.replace(old, nw) ?? h)} />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide mb-3">Timeline Membaca</h4>
                  <div className="space-y-2">
                    {(() => {
                      const timeline = getReadingTimeline(hasil);
                      const maxWords = Math.max(...timeline.map(s => s.wordCount), 1);
                      return timeline.map((section, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-20 text-[0.65rem] font-bold uppercase text-black/50">{section.label}</span>
                          <div className="flex-1 h-4 bg-black/5 border border-black/10 overflow-hidden">
                            <div className="h-full bg-[var(--color-accent)] transition-all" style={{ width: `${Math.round((section.wordCount / maxWords) * 100)}%` }} />
                          </div>
                          <span className="text-[0.65rem] font-bold">{section.estimatedMinutes} mnt</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="brutal-card p-3 text-center">
                    <div className="text-lg font-bold">{getVocabularyRichness(hasil).toFixed(2)}</div>
                    <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Kekayaan Vokabuler</div>
                  </div>
                  <div className="brutal-card p-3 text-center">
                    <div className="text-lg font-bold">{getReadingTimeline(hasil).length}</div>
                    <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Bagian Naskah</div>
                  </div>
                </div>
                <WordChart data={getWordFrequency(hasil, 15)} />
                <ThemeHeatmap data={[]} />
              </div>
            )}
          </div>

          {showDiff && originalHasil && (
            <div className="mt-4">
              <WordDiff oldText={originalHasil} newText={hasil} />
            </div>
          )}

          {/* Share Bar */}
          {shareToken && !loading && (
            <div className="no-print mt-4 brutal-card px-4 py-3 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wide">Bagikan:</span>
                <code className="text-xs bg-black/5 border border-black/20 px-2 py-1 flex-1 min-w-0 truncate">
                  {generateShareUrl(shareToken)}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="brutal-btn bg-[var(--color-accent-2)] px-3 py-1.5 text-xs shrink-0"
                  id="btn-copy-link"
                >
                  {linkCopied ? "Tersalin ✓" : <><Link2 className="w-3 h-3 shrink-0" /> Salin Link</>}
                </button>
              </div>
              {/* Social Share */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[0.6rem] font-bold text-black/30 uppercase">Share ke:</span>
                <button
                  onClick={() => handleShareSocial("whatsapp")}
                  className="brutal-btn inline-flex items-center gap-1 px-2.5 py-1 text-[0.65rem] bg-[#25D366] text-white border-[#25D366]"
                >
                  <MessageCircle className="w-3 h-3 shrink-0" /> WhatsApp
                </button>
                <button
                  onClick={() => handleShareSocial("telegram")}
                  className="brutal-btn inline-flex items-center gap-1 px-2.5 py-1 text-[0.65rem] bg-[#0088cc] text-white border-[#0088cc]"
                >
                  <Send className="w-3 h-3 shrink-0" /> Telegram
                </button>
                <button
                  onClick={() => handleShareSocial("twitter")}
                  className="brutal-btn inline-flex items-center gap-1 px-2.5 py-1 text-[0.65rem] bg-[#1DA1F2] text-white border-[#1DA1F2]"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" /> Twitter
                </button>
                <button
                  onClick={() => sendToWhatsApp(activeHasil, "")}
                  className="brutal-btn inline-flex items-center gap-1 px-2 py-1 text-[0.6rem]"
                >
                  <Share2 className="w-3 h-3 shrink-0" /> WhatsApp
                </button>
                <button
                  onClick={() => sendToTelegram(activeHasil, "", "")}
                  className="brutal-btn inline-flex items-center gap-1 px-2 py-1 text-[0.6rem]"
                >
                  <Share2 className="w-3 h-3 shrink-0" /> Telegram
                </button>
                <button
                  onClick={() => sendToEmail(activeHasil, "", "")}
                  className="brutal-btn inline-flex items-center gap-1 px-2 py-1 text-[0.6rem]"
                >
                  <Share2 className="w-3 h-3 shrink-0" /> Email
                </button>
              </div>
              {/* QR Code */}
              <div className="flex items-center gap-3 pt-2 border-t border-black/10">
                <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold text-black/30 uppercase"><QrCodeIcon className="w-3 h-3 shrink-0" /> QR Code:</span>
                <QrCode value={generateShareUrl(shareToken)} size={80} />
              </div>
              <CollabIndicator sessionId={shareToken || ""} collaborators={[]} />
            </div>
          )}
        </section>
        </FullscreenMode>
      )}

        </div>{/* end left column */}

        {/* ── Right Column: Sidebar ── */}
        <div className="hidden md:block">
          <div className="sticky top-6">
            <Sidebar />
            <RateLimitDashboard remaining={remaining} limit={15} />
          </div>
        </div>

      </div>{/* end 2-column grid */}

      {/* ── Keyboard Shortcuts Modal ── */}
      {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}

      {/* ── Feature Modals ── */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelect={(t) => {
            setShowTemplatePreview(t);
            setShowTemplateLibrary(false);
          }}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}

      {showTemplatePreview && (
        <TemplatePreview
          template={showTemplatePreview}
          onUse={() => {
            setKategori(showTemplatePreview.kategori);
            if (showTemplatePreview.defaultTema) setTema(showTemplatePreview.defaultTema);
            if (showTemplatePreview.defaultDurasi) setDurasi(showTemplatePreview.defaultDurasi);
            if (showTemplatePreview.defaultGaya) setGayaBahasa(showTemplatePreview.defaultGaya as GayaBahasa);
            setShowTemplatePreview(null);
          }}
          onClose={() => setShowTemplatePreview(null)}
        />
      )}

      {showCompareMode && originalHasil && hasil && (
        <CompareMode
          original={originalHasil}
          edited={hasil}
          onClose={() => setShowCompareMode(false)}
        />
      )}

      {showPrintPreview && (
        <PrintPreview
          konten={activeHasil}
          tema={tema}
          kategori={kategori}
          namaPenceramah={namaPenceramah || undefined}
          namaLokasi={namaLokasi || undefined}
          tanggal={tanggal || undefined}
          onClose={() => setShowPrintPreview(false)}
        />
      )}

      {showShareTemplate && (
        <ShareTemplate
          settings={{ kategori, tema, durasi, gayaBahasa, targetAudiens, tujuanPidato, nadaEmosi, toneValue }}
          onImport={(s) => {
            if (s.kategori) setKategori(s.kategori);
            if (s.tema) setTema(s.tema);
            if (s.durasi) setDurasi(s.durasi);
            if (s.gayaBahasa) setGayaBahasa(s.gayaBahasa);
            setShowShareTemplate(false);
          }}
        />
      )}

      {showGoalTracker && (
        <GoalTracker />
      )}

      {showQuoteInsert && (
        <QuoteInsert onInsert={(q) => { setCustomPrompt((p) => p + "\n" + q); setShowQuoteInsert(false); }} />
      )}

      {showAnalyticsReport && (
        <AnalyticsReport data={{
          tema, kategori, wordCount,
          readingTime: `${Math.ceil(wordCount / 130)} menit`,
          readability: "N/A",
          sentiment: "N/A",
          difficulty: Math.min(10, Math.round(wordCount / 150)),
          vocabulary: 0,
          sections: 3,
        }} onClose={() => setShowAnalyticsReport(false)} />
      )}

      <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />
    </main>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function ToggleOption({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 border-2 border-black/20 text-xs font-semibold transition-all ${
        value
          ? "bg-[var(--color-accent)] border-[var(--color-ink)] shadow-[2px_2px_0_var(--color-ink)]"
          : "hover:border-black/40"
      }`}
    >
      <span className={`w-3 h-3 border-2 border-current flex items-center justify-center text-[0.6rem] ${value ? "bg-[var(--color-ink)] text-white" : ""}`}>
        {value && "✓"}
      </span>
      {label}
    </button>
  );
}

function KeywordAnalysis({ text }: { text: string }) {
  const keywords = useMemo(() => getKeywordDensity(text, 20), [text]);
  const sentiment = useMemo(() => getSentiment(text), [text]);
  const complexity = useMemo(() => getSentenceComplexity(text), [text]);

  return (
    <div className="space-y-4">
      {/* Word Cloud */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[var(--color-accent)]" />
          Kata Kunci (Top 20)
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => {
            const maxCount = keywords[0]?.count || 1;
            const size = Math.max(0.65, (kw.count / maxCount) * 1.2);
            const hue = (i / keywords.length) * 60 + 40;
            return (
              <span
                key={kw.word}
                className="inline-flex items-center gap-1 px-2 py-1 border border-black/15 font-bold transition-all hover:scale-105 cursor-default"
                style={{
                  fontSize: `${size}rem`,
                  backgroundColor: `hsl(${hue}, 70%, 92%)`,
                  color: `hsl(${hue}, 70%, 30%)`,
                }}
              >
                {kw.word}
                <span className="opacity-50 text-[0.6em]">{kw.count}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Distribution */}
      <div className="grid grid-cols-2 gap-3">
        <div className="brutal-card p-3">
          <p className="text-[0.6rem] font-bold uppercase text-black/40 mb-1">Sentimen</p>
          <p className="text-sm font-bold">{sentiment.label}</p>
          <div className="flex gap-1 mt-2 h-2 overflow-hidden border border-black/10">
            <div className="bg-[#22c55e] transition-all" style={{ width: `${sentiment.positive}%` }} />
            <div className="bg-[var(--color-accent)] transition-all" style={{ width: `${sentiment.neutral}%` }} />
            <div className="bg-[var(--color-danger)] transition-all" style={{ width: `${sentiment.negative}%` }} />
          </div>
        </div>
        <div className="brutal-card p-3">
          <p className="text-[0.6rem] font-bold uppercase text-black/40 mb-1">Kompleksitas</p>
          <p className="text-sm font-bold">Sederhana {complexity.simple}% · Sedang {complexity.medium}%</p>
          <div className="flex gap-1 mt-2 h-2 overflow-hidden border border-black/10">
            <div className="bg-[#22c55e] transition-all" style={{ width: `${complexity.simple}%` }} />
            <div className="bg-[var(--color-accent)] transition-all" style={{ width: `${complexity.medium}%` }} />
            <div className="bg-[var(--color-danger)] transition-all" style={{ width: `${complexity.complex}%` }} />
          </div>
        </div>
      </div>

      {/* Top Words Table */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide mb-2">Kata Paling Sering</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {keywords.slice(0, 12).map((kw, i) => {
            const maxCount = keywords[0]?.count || 1;
            const pct = Math.round((kw.count / maxCount) * 100);
            return (
              <div key={kw.word} className="flex items-center gap-2 p-2 border border-black/10">
                <span className="text-[0.6rem] text-black/30 font-bold w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{kw.word}</p>
                  <div className="h-1 bg-black/5 mt-1 overflow-hidden">
                    <div className="h-full bg-[var(--color-accent)] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-[0.6rem] text-black/40 font-bold">{kw.count}×</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── QR Code Component ──────────────────────────────────────────────────────

function QrCode({ value, size = 80 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    // Generate simple QR-like pattern using SVG
    // In production, use a proper QR library
    const generatePattern = (url: string) => {
      const hash = Array.from(url).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const cells: string[] = [];
      const cellSize = size / 25;

      // Generate deterministic pattern from URL
      for (let row = 0; row < 25; row++) {
        for (let col = 0; col < 25; col++) {
          // Fixed corners (finder patterns)
          const isFinderCorner =
            (row < 7 && col < 7) ||
            (row < 7 && col > 17) ||
            (row > 17 && col < 7);

          if (isFinderCorner) {
            // Draw finder pattern
            const isInner = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
              (row >= 2 && row <= 4 && col >= 20 && col <= 22) ||
              (row >= 20 && row <= 22 && col >= 2 && col <= 4);
            const isBorder =
              (row === 0 || row === 6 || col === 0 || col === 6) && row < 7 && col < 7 ||
              (row === 0 || row === 6 || col === 18 || col === 24) && row < 7 && col > 17 ||
              (row === 18 || row === 24 || col === 0 || col === 6) && row > 17 && col < 7;
            const isFrame =
              (row >= 1 && row <= 5 && col >= 1 && col <= 5) && !(row >= 2 && row <= 4 && col >= 2 && col <= 4) && row < 7 && col < 7 ||
              (row >= 1 && row <= 5 && col >= 19 && col <= 23) && !(row >= 2 && row <= 4 && col >= 20 && col <= 22) && row < 7;

            if (isInner || isBorder) {
              cells.push(`<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0a0a0a"/>`);
            }
          } else {
            // Data area: deterministic pseudo-random
            const seed = (row * 31 + col * 17 + hash) % 100;
            if (seed < 45) {
              cells.push(`<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0a0a0a"/>`);
            }
          }
        }
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="white"/>
        ${cells.join("\n        ")}
      </svg>`;
    };

    setSvg(generatePattern(value));
  }, [value, size]);

  if (!svg) return <div style={{ width: size, height: size }} className="bg-black/5 border border-black/10" />;

  return (
    <div
      className="border border-black/10 p-1 bg-white"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
