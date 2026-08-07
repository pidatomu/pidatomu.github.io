// ─── Analytics Helpers ───────────────────────────────────────────────────────

export interface WordFrequencyItem {
  word: string;
  count: number;
  percentage: number;
}

export interface ReadingTimelineSection {
  label: string;
  content: string;
  wordCount: number;
  estimatedMinutes: number;
}

export interface ParagraphStatsResult {
  count: number;
  avgLength: number;
  shortest: number;
  longest: number;
}

const STOP_WORDS = new Set([
  "yang", "dan", "di", "ini", "itu", "dengan", "untuk", "pada", "dari", "adalah",
  "akan", "juga", "tidak", "bisa", "ada", "atau", "serta", "dalam", "oleh", "karena",
  "telah", "sudah", "masih", "lebih", "sangat", "bagi", "hal", "ketika", "jika", "maka",
  "sebagai", "dapat", "harus", "kita", "mereka", "kami", "anda", "ia", "dia",
  "belum", "hanya", "setiap", "semua", "tentang", "seperti", "bahwa",
  "kembali", "lagi", "mau", "perlu", "buat", "bila", "sehingga", "hingga", "sampai",
  "antara", "lain", "lalu", "bahkan", "sebab", "walau", "meski", "walaupun",
  "agar", "supaya", "biar", "sambil", "setelah", "sebelum", "sedang", "sedangkan",
  "tetapi", "namun", "tapi", "pun", "lah", "kah",
]);

function splitIntoWords(text: string): string[] {
  return text
    .replace(/\*\*[^*]+\*\*/g, "")
    .replace(/[^\w\s]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\*\*[^*]+\*\*\s*/g, "")
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
}

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
}

export function getWordFrequency(text: string, topN = 20): WordFrequencyItem[] {
  const words = splitIntoWords(text).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  const total = words.length || 1;
  return Array.from(freq.entries())
    .map(([word, count]) => ({
      word,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function getReadingTimeline(text: string): ReadingTimelineSection[] {
  const sections: ReadingTimelineSection[] = [];
  const wpm = 130;

  const markers = [
    { label: "Pembuka", pattern: /\*\*pembuka\*\*|\*\*pembukaan\*\*|PENDAHULUAN/i },
    { label: "Isi", pattern: /\*\*isi\*\*|\*\*badan\*\*|\*\*body\*\*|ISI/i },
    { label: "Penutup", pattern: /\*\*penutup\*\*|\*\*penutupan\*\*|\*\*kesimpulan\*\*|PENUTUP/i },
  ];

  const paragraphs = splitIntoParagraphs(text);

  if (paragraphs.length <= 1) {
    const wc = splitIntoWords(text).length;
    sections.push({
      label: "Full",
      content: text,
      wordCount: wc,
      estimatedMinutes: Math.round(wc / wpm),
    });
    return sections;
  }

  let currentLabel = "Pembuka";
  let currentContent = "";

  for (const para of paragraphs) {
    let foundMarker = false;
    for (const marker of markers) {
      if (marker.pattern.test(para)) {
        if (currentContent.trim()) {
          const wc = splitIntoWords(currentContent).length;
          sections.push({
            label: currentLabel,
            content: currentContent.trim(),
            wordCount: wc,
            estimatedMinutes: Math.round(wc / wpm),
          });
        }
        currentLabel = marker.label;
        currentContent = para;
        foundMarker = true;
        break;
      }
    }
    if (!foundMarker) {
      currentContent += "\n\n" + para;
    }
  }

  if (currentContent.trim()) {
    const wc = splitIntoWords(currentContent).length;
    sections.push({
      label: currentLabel,
      content: currentContent.trim(),
      wordCount: wc,
      estimatedMinutes: Math.round(wc / wpm),
    });
  }

  if (sections.length === 0) {
    const wc = splitIntoWords(text).length;
    sections.push({
      label: "Full",
      content: text,
      wordCount: wc,
      estimatedMinutes: Math.round(wc / wpm),
    });
  }

  return sections;
}

const FORMAL_WORDS = new Set([
  "oleh", "karena", "sehingga", "terhadap", "dalam", "merupakan", "bagian",
  "tersebut", "adalah", "telah", "dapat", "juga", "akan", "harus", "perlu",
  "penting", "menjadi", "merupakan", "diperlukan", "masyarakat", "pembangunan",
  "pelaksanaan", "pertama", "kedua", "ketiga", "selanjutnya", "akhirnya",
  "bagaimanapun", "meskipun", "walaupun", "disamping", "selain", "diantara",
  "masing", "perlu", "disampaikan", "dijelaskan", "ditegaskan", "diharapkan",
]);

export function getFormalityScore(text: string): number {
  const words = splitIntoWords(text);
  if (words.length === 0) return 0;

  let formalCount = 0;
  for (const word of words) {
    if (FORMAL_WORDS.has(word)) formalCount++;
  }

  const score = Math.min(100, Math.round((formalCount / words.length) * 200));
  return Math.max(0, score);
}

export function getVocabularyRichness(text: string): number {
  const words = splitIntoWords(text).filter((w) => w.length > 1);
  if (words.length === 0) return 0;

  const unique = new Set(words);
  return Math.round((unique.size / words.length) * 100) / 100;
}

export function getAverageSentenceLength(text: string): number {
  const words = splitIntoWords(text);
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return 0;
  return Math.round((words.length / sentences.length) * 10) / 10;
}

export function getParagraphStats(text: string): ParagraphStatsResult {
  const paragraphs = splitIntoParagraphs(text);
  if (paragraphs.length === 0) {
    return { count: 0, avgLength: 0, shortest: 0, longest: 0 };
  }

  const lengths = paragraphs.map((p) => splitIntoWords(p).length);
  const total = lengths.reduce((sum, l) => sum + l, 0);

  return {
    count: paragraphs.length,
    avgLength: Math.round(total / paragraphs.length),
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
  };
}
