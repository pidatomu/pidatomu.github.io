"use client";

import { useState, useMemo } from "react";
import { BookOpen, Search, X, Copy, Check } from "lucide-react";

interface QuoteInsertProps {
  onInsert: (quote: string) => void;
}

interface QuranVerse {
  arabic: string;
  translation: string;
  source: string;
}

interface Hadith {
  text: string;
  source: string;
}

const QURAN_VERSES: QuranVerse[] = [
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Sesungguhnya setelah kesulitan itu ada kemudahan.",
    source: "QS. Al-Insyirah: 6",
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "Dan barangsiapa yang bertawakal kepada Allah, niscaya Allah akan mencukupkan kebutuhannya.",
    source: "QS. Ath-Thalaq: 3",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Sesungguhnya Allah beserta orang-orang yang sabar.",
    source: "QS. Al-Baqarah: 153",
  },
  {
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    translation: "Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami dari siksa neraka.",
    source: "QS. Al-Baqarah: 201",
  },
  {
    arabic: "وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ ۖ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ",
    translation: "Dan Tuhanmu adalah Tuhan Yang Maha Esa. Tidak ada Tuhan selain Dia, Yang Maha Pemurah lagi Maha Penyayang.",
    source: "QS. Al-Baqarah: 163",
  },
  {
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    translation: "Dan sungguh, Tuhanmu akan memberikan karunia-Nya kepadamu, maka kamu akan puas.",
    source: "QS. Ad-Duha: 5",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation: "Maka ingatlah Aku, niscaya Aku ingat pula kepadamu, dan bersyukurlah kepada-Ku, dan janganlah kamu mengingkari nikmat-Ku.",
    source: "QS. Al-Baqarah: 152",
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
    translation: "Sesungguhnya Allah menyukai orang-orang yang bertaubat dan menyukai orang-orang yang menyucikan diri.",
    source: "QS. Al-Baqarah: 222",
  },
];

const HADITHS: Hadith[] = [
  {
    text: "Islam itu dibangun di atas lima perkara: syahadat bahwa tidak ada Tuhan selain Allah dan Muhammad adalah utusan Allah, mendirikan shalat, menunaikan zakat, berpuasa di bulan Ramadhan, dan haji bagi yang mampu.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Sesungguhnya amal-amal itu tergantung pada niatnya, dan sesungguhnya setiap orang akan mendapatkan sesuai dengan apa yang dia niatkan.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Seorang muslim adalah orang yang lisan dan tangannya aman dari (gangguan) manusia, dan seorang muhajir adalah orang yang meninggalkan apa-apa yang dilarang oleh Allah.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Bukanlah orang yang kuat karena pandai bergulat, akan tetapi orang yang kuat adalah orang yang mampu menahan dirinya ketika marah.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Barangsiapa tidak menyayangi maka tidak akan disayangi, dan barangsiapa tidak menyayangi manusia maka Allah tidak akan menyayanginya.",
    source: "HR. Bukhari",
  },
  {
    text: "Janganlah kalian saling membenci, janganlah saling mendengki, janganlah saling membelakangi, dan janganlah saling menghina. Dan hendaklah kalian menjadi hamba-hamba Allah yang bersaudara.",
    source: "HR. Muslim",
  },
  {
    text: "Takutlah kamu akan perbuatan dosa di saat sendirian, karena saksinya pada saat itu adalah Allah.",
    source: "HR. Ahmad",
  },
  {
    text: "Siapa yang menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.",
    source: "HR. Muslim",
  },
];

type TabType = "quran" | "hadith";

export default function QuoteInsert({ onInsert }: QuoteInsertProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("quran");
  const [search, setSearch] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const filteredQuran = useMemo(() => {
    if (!search.trim()) return QURAN_VERSES;
    const q = search.toLowerCase();
    return QURAN_VERSES.filter(
      (v) =>
        v.translation.toLowerCase().includes(q) ||
        v.source.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredHadith = useMemo(() => {
    if (!search.trim()) return HADITHS;
    const q = search.toLowerCase();
    return HADITHS.filter(
      (h) =>
        h.text.toLowerCase().includes(q) ||
        h.source.toLowerCase().includes(q)
    );
  }, [search]);

  const formatQuranQuote = (v: QuranVerse) =>
    `${v.arabic}\n\n${v.translation}\n— ${v.source}`;

  const formatHadithQuote = (h: Hadith) =>
    `"${h.text}"\n— ${h.source}`;

  const handleInsert = (formatted: string) => {
    onInsert(formatted);
    setOpen(false);
    setSearch("");
  };

  const handleCopy = (formatted: string, idx: number) => {
    navigator.clipboard.writeText(formatted);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn px-3 py-2 text-xs font-bold flex items-center gap-2"
      >
        <BookOpen className="w-3 h-3" />
        Sisipkan Kutipan
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="brutal-card w-full max-w-lg max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b-3 border-[var(--color-ink)]">
          <h3 className="text-xs font-black uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            Sisipkan Kutipan
          </h3>
          <button onClick={() => { setOpen(false); setSearch(""); }} className="p-1 hover:bg-black/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-[var(--color-ink)]">
          <button
            onClick={() => { setTab("quran"); setSearch(""); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
              tab === "quran"
                ? "bg-[var(--color-accent)] border-b-2 border-[var(--color-ink)] -mb-[2px]"
                : "bg-transparent hover:bg-black/5"
            }`}
          >
            Al-Quran
          </button>
          <button
            onClick={() => { setTab("hadith"); setSearch(""); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
              tab === "hadith"
                ? "bg-[var(--color-accent)] border-b-2 border-[var(--color-ink)] -mb-[2px]"
                : "bg-transparent hover:bg-black/5"
            }`}
          >
            Hadits
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-black/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-black/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kutipan..."
              className="w-full brutal-input pl-8 pr-3 py-2 text-xs"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {tab === "quran" && filteredQuran.map((v, i) => {
            const formatted = formatQuranQuote(v);
            return (
              <div key={i} className="border-2 border-black/10 p-3 hover:border-[var(--color-ink)] transition-colors">
                <p className="text-right text-lg leading-relaxed mb-1">{v.arabic}</p>
                <p className="text-xs font-medium text-black/70 mb-1">{v.translation}</p>
                <p className="text-[0.6rem] font-bold uppercase text-black/40">{v.source}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleInsert(formatted)} className="brutal-btn px-2 py-1 text-[0.6rem] font-bold flex-1">
                    Sisipkan
                  </button>
                  <button onClick={() => handleCopy(formatted, i)} className="brutal-btn px-2 py-1 text-[0.6rem] font-bold bg-white">
                    {copiedIdx === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}

          {tab === "hadith" && filteredHadith.map((h, i) => {
            const formatted = formatHadithQuote(h);
            return (
              <div key={i} className="border-2 border-black/10 p-3 hover:border-[var(--color-ink)] transition-colors">
                <p className="text-xs font-medium text-black/80 mb-1">&ldquo;{h.text}&rdquo;</p>
                <p className="text-[0.6rem] font-bold uppercase text-black/40">{h.source}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleInsert(formatted)} className="brutal-btn px-2 py-1 text-[0.6rem] font-bold flex-1">
                    Sisipkan
                  </button>
                  <button onClick={() => handleCopy(formatted, i + 100)} className="brutal-btn px-2 py-1 text-[0.6rem] font-bold bg-white">
                    {copiedIdx === i + 100 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}

          {tab === "quran" && filteredQuran.length === 0 && (
            <p className="text-xs font-semibold text-black/40 text-center py-6">Tidak ditemukan</p>
          )}
          {tab === "hadith" && filteredHadith.length === 0 && (
            <p className="text-xs font-semibold text-black/40 text-center py-6">Tidak ditemukan</p>
          )}
        </div>
      </div>
    </div>
  );
}
