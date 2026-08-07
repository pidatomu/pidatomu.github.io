// ─── Indonesian Readability Analysis ─────────────────────────────────────────

export interface ReadabilityResult {
  fleschKincaid: number;
  gunningFog: number;
  colemanLiau: number;
  smog: number;
  ari: number;
  readingEase: number;
  gradeLevel: string;
  readingLevel: string;
  estimatedGrade: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  complexWords: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  paragraphCount: number;
  avgSentencesPerParagraph: number;
}

function countSyllablesIndonesian(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;
  let count = 0;
  const vowels = "aeiou";
  let prevVowel = false;
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (word.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
}

function isComplexWord(word: string): boolean {
  return countSyllablesIndonesian(word) >= 4;
}

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\*\*[^*]+\*\*\s*/g, "")
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
}

function splitIntoWords(text: string): string[] {
  return text
    .replace(/\*\*[^*]+\*\*\s*/g, "")
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function analyzeReadability(text: string): ReadabilityResult {
  const cleanText = text.replace(/\*\*[^*]+\*\*\s*/g, "").trim();
  const words = splitIntoWords(cleanText);
  const sentences = splitIntoSentences(cleanText);
  const paragraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const paragraphCount = Math.max(1, paragraphs.length);

  let syllableCount = 0;
  let complexWords = 0;
  for (const word of words) {
    const s = countSyllablesIndonesian(word);
    syllableCount += s;
    if (isComplexWord(word)) complexWords++;
  }

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const avgSentencesPerParagraph = sentenceCount / paragraphCount;

  // Flesch Reading Ease (adapted for Indonesian)
  const readingEase = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord)
  );

  // Flesch-Kincaid Grade Level
  const fleschKincaid = Math.max(
    0,
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  );

  // Gunning Fog Index
  const complexWordPct = (complexWords / wordCount) * 100;
  const gunningFog = Math.max(0, 0.4 * (avgWordsPerSentence + complexWordPct));

  // Coleman-Liau Index
  const letters = cleanText.replace(/[^a-zA-Z]/g, "").length;
  const L = (letters / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  const colemanLiau = Math.max(0, 0.0588 * L - 0.296 * S - 15.8);

  // SMOG Index
  const smog = Math.max(0, 1.043 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291);

  // Automated Readability Index
  const ari = Math.max(0, 4.71 * (letters / wordCount) + 0.5 * avgWordsPerSentence - 21.43);

  // Determine grade level
  const avgGrade = (fleschKincaid + gunningFog + colemanLiau + ari) / 4;
  let gradeLevel = "SD";
  if (avgGrade >= 16) gradeLevel = "S3+";
  else if (avgGrade >= 14) gradeLevel = "S2";
  else if (avgGrade >= 12) gradeLevel = "S1";
  else if (avgGrade >= 10) gradeLevel = "SMA";
  else if (avgGrade >= 8) gradeLevel = "SMP";
  else if (avgGrade >= 5) gradeLevel = "SD (Lanjut)";

  // Reading level
  let readingLevel = "Sangat Mudah";
  if (readingEase < 30) readingLevel = "Sangat Sulit";
  else if (readingEase < 50) readingLevel = "Sulit";
  else if (readingEase < 60) readingLevel = "Cukup Sulit";
  else if (readingEase < 70) readingLevel = "Normal";
  else if (readingEase < 80) readingLevel = "Cukup Mudah";
  else if (readingEase < 90) readingLevel = "Mudah";
  else readingLevel = "Sangat Mudah";

  return {
    fleschKincaid: round1(fleschKincaid),
    gunningFog: round1(gunningFog),
    colemanLiau: round1(colemanLiau),
    smog: round1(smog),
    ari: round1(ari),
    readingEase: round1(readingEase),
    gradeLevel,
    readingLevel,
    estimatedGrade: Math.round(avgGrade),
    wordCount,
    sentenceCount,
    syllableCount,
    complexWords,
    avgWordsPerSentence: round1(avgWordsPerSentence),
    avgSyllablesPerWord: round2(avgSyllablesPerWord),
    paragraphCount,
    avgSentencesPerParagraph: round1(avgSentencesPerParagraph),
  };
}

export function getSentiment(text: string): { positive: number; negative: number; neutral: number; label: string } {
  const positiveWords = [
    "baik", "indah", "cinta", "kasih", "sayang", "bahagia", "suka", "senang",
    "berkah", "rahmat", "surga", "pahala", "amal", "sholeh", "sholehah", "taqwa",
    "ikhlas", "sabar", "syukur", "jannah", "ridho", "barokah", "sakinah", "mawaddah",
    "rahmah", "aman", "damai", "sejahtera", "sukses", "berhasil", "menang", "jaya",
    "mulia", "tinggi", "hebat", "luar biasa", "sempurna", "lengkap", "utuh", "selamat",
    "sembuh", "puas", "cukup", "lega", "tenang", "tentram", "santai", "ringan",
    "mudah", "gampang", "cepat", "kilat", "instan", "praktis", "efisien", "optimal",
  ];
  const negativeWords = [
    "buruk", "jelek", "benci", "marah", "sedih", "takut", "khawatir", "cemas",
    "dosa", "azab", "neraka", "siksa", "adzab", "murka", "dhalim", "zalim",
    "jahat", "kejam", "keras", "berat", "susah", "sulit", "masalah", "problem",
    "gagal", "kalah", "hancur", "rusak", "hilang", "mati", "miskin", "sakit",
    "lemah", "lemah", "lemah", "takut", "malu", "hina", "rendah", "dangkal",
    "sempit", "gelap", "dingin", "kering", "kosong", "hampa", "sunyi", "senyap",
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positive = 0;
  let negative = 0;

  for (const word of words) {
    if (positiveWords.some((pw) => word.includes(pw))) positive++;
    if (negativeWords.some((nw) => word.includes(nw))) negative++;
  }

  const total = positive + negative || 1;
  const posPct = Math.round((positive / total) * 100);
  const negPct = Math.round((negative / total) * 100);
  const neuPct = 100 - posPct - negPct;

  let label = "Netral";
  if (posPct > 60) label = "Positif";
  else if (negPct > 60) label = "Negatif";
  else if (posPct > negPct) label = "Cenderung Positif";
  else if (negPct > posPct) label = "Cenderung Negatif";

  return { positive: posPct, negative: negPct, neutral: neuPct, label };
}

export function getKeywordDensity(text: string, topN = 10): { word: string; count: number; percentage: number }[] {
  const stopWords = new Set([
    "yang", "dan", "di", "ini", "itu", "dengan", "untuk", "pada", "dari", "adalah",
    "akan", "juga", "tidak", "bisa", "ada", "atau", "serta", "dalam", "oleh", "karena",
    "telah", "sudah", "masih", "lebih", "sangat", "bagi", "hal", "ketika", "jika", "maka",
    "sebagai", "dapat", "harus", "kita", "mereka", "kami", "anda", "ia", "dia", "ia",
    "belum", "hanya", "setiap", "mereka", "semua", "tentang", "seperti", "bahwa", "mereka",
    "kembali", "lagi", "mau", "perlu", "buat", "bila", "sehingga", "hingga", "sampai",
    "antara", "lain", "lalu", "bahkan", "sebab", "maka", "walau", "meski", "walaupun",
    "agar", "supaya", "biar", "sambil", "setelah", "sebelum", "sedang", "sedangkan",
    "tetapi", "namun", "tapi", "lain", "lainnya", "serta", "pun", "lah", "kah", "takah",
    "manakah", "siapakah", "bagaimanakah", "kapanakah", "dimanakah", "mengapakah",
  ]);

  const words = text
    .replace(/\*\*[^*]+\*\*/g, "")
    .replace(/[^\w\s]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  const total = words.length || 1;
  return Array.from(freq.entries())
    .map(([word, count]) => ({ word, count, percentage: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export function getReadingTime(wordCount: number, wpm = 130): string {
  const minutes = Math.round(wordCount / wpm);
  if (minutes < 1) return "< 1 menit";
  if (minutes === 1) return "1 menit";
  return `${minutes} menit`;
}

export function getSentenceComplexity(text: string): { simple: number; medium: number; complex: number } {
  const sentences = splitIntoSentences(text);
  let simple = 0;
  let medium = 0;
  let complex = 0;

  for (const s of sentences) {
    const words = s.split(/\s+/).filter(Boolean).length;
    if (words <= 10) simple++;
    else if (words <= 20) medium++;
    else complex++;
  }

  const total = sentences.length || 1;
  return {
    simple: Math.round((simple / total) * 100),
    medium: Math.round((medium / total) * 100),
    complex: Math.round((complex / total) * 100),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
