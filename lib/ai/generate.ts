import { streamWithGroq, generateWithGroq, GroqError } from "./groq";
import { streamWithGemini, generateWithGemini, GeminiError } from "./gemini";

export type Provider = "groq" | "gemini";
export type GayaBahasa = "formal" | "semi-formal" | "modern-pesantren";

export interface PersonalisasiParams {
  namaPenceramah?: string;
  namaLokasi?: string;
  tanggal?: string;
  gayaBahasa?: GayaBahasa;
}

function buildSystemPrompt(personalisasi: PersonalisasiParams): string {
  const { namaPenceramah, namaLokasi, tanggal, gayaBahasa = "formal" } = personalisasi;

  const gayaMap: Record<GayaBahasa, string> = {
    "formal": "bahasa Indonesia baku dan formal, sesuai standar ceramah resmi",
    "semi-formal": "bahasa Indonesia yang santai namun tetap sopan, tidak terlalu kaku",
    "modern-pesantren": "bahasa khas pesantren modern: campuran Indonesia dan beberapa kata Arab umum, akrab, penuh semangat",
  };

  const personaLines = [
    namaPenceramah ? `Nama penceramah/khatib: ${namaPenceramah}. Sebutkan namanya di pembuka naskah dengan kalimat yang natural.` : "",
    namaLokasi ? `Lokasi acara: ${namaLokasi}. Sertakan di konteks pembuka bila sesuai.` : "",
    tanggal ? `Tanggal acara: ${tanggal}.` : "",
  ].filter(Boolean).join("\n");

  return `Kamu adalah penulis naskah pidato/ceramah/khutbah berbahasa Indonesia yang islami, natural, dan enak dibaca saat disampaikan lisan.

Gunakan format berikut (gunakan heading markdown **bold** untuk setiap bagian):

**PEMBUKA**
(salam pembuka, muqaddimah, puji syukur kepada Allah, sholawat kepada Nabi${namaPenceramah ? `, perkenalan singkat ${namaPenceramah}` : ""})

**ISI**
(penjelasan tema secara runtut, sertakan dalil/hadits bila relevan, contoh nyata yang relatable)

**PENUTUP**
(kesimpulan, doa penutup, salam penutup${namaPenceramah ? `, termasuk nama ${namaPenceramah} sebagai penutup` : ""})

${personaLines ? `\nINFORMASI TAMBAHAN:\n${personaLines}` : ""}

Gaya bahasa: ${gayaMap[gayaBahasa]}.
PENTING: Naskah harus memiliki panjang yang KONSISTEN dengan target kata yang diminta. Jangan terlalu pendek atau terlalu panjang. Tulis naskah yang siap dibacakan, bukan template. Jangan tambahkan kata "markdown" atau simbol lain selain **bold** untuk heading.`;
}

function buildGenerateUserPrompt(kategori: string, tema: string, durasi: number, targetKata: number): string {
  return `Buatkan naskah untuk kategori "${kategori}" dengan tema "${tema}".

DURASI: ${durasi} menit
TARGET KATA: sekitar ${targetKata} kata (±10%)

Naskah HARUS memiliki panjang yang KONSISTEN dengan target di atas. Jangan terlalu pendek atau terlalu panjang. Tulis naskah yang lengkap dari pembuka hingga penutup.`;
}

// ─── Streaming (primary) ─────────────────────────────────────────────────────

export async function streamNaskahPidato(params: {
  kategori: string;
  tema: string;
  durasi: number;
  targetKata: number;
  personalisasi?: PersonalisasiParams;
}): Promise<{ stream: ReadableStream<Uint8Array>; provider: Provider }> {
  const { kategori, tema, durasi, targetKata, personalisasi = {} } = params;
  const systemPrompt = buildSystemPrompt(personalisasi);
  const userPrompt = buildGenerateUserPrompt(kategori, tema, durasi, targetKata);
  const maxTokens = Math.min(Math.max(Math.round(targetKata * 1.5), 1024), 8192);
  const input = { kategori, tema, durasi, targetKata, maxTokens, systemPrompt, userPrompt };

  try {
    const stream = await streamWithGroq(input);
    return { stream, provider: "groq" };
  } catch (err) {
    if (!(err instanceof GroqError)) throw err;
    console.warn("[generate] Groq gagal, fallback ke Gemini:", err.message);
  }

  try {
    const stream = await streamWithGemini(input);
    return { stream, provider: "gemini" };
  } catch (err) {
    if (err instanceof GeminiError) {
      throw new Error("Kedua penyedia AI (Groq & Gemini) gagal merespons. Coba lagi sebentar lagi.");
    }
    throw err;
  }
}

// ─── Non-streaming (for refine endpoint internal use) ────────────────────────

export async function generateNaskahPidato(params: {
  kategori: string;
  tema: string;
  durasi: number;
  targetKata: number;
  personalisasi?: PersonalisasiParams;
}): Promise<{ text: string; provider: Provider; attempts: number }> {
  const { kategori, tema, durasi, targetKata, personalisasi = {} } = params;
  const systemPrompt = buildSystemPrompt(personalisasi);
  const userPrompt = buildGenerateUserPrompt(kategori, tema, durasi, targetKata);
  const maxTokens = Math.min(Math.max(Math.round(targetKata * 1.5), 1024), 8192);

  let text = "";
  let provider: Provider = "groq";

  try {
    text = await generateWithGroq({ kategori, tema, durasi, targetKata, maxTokens, systemPrompt, userPrompt });
    provider = "groq";
  } catch (err) {
    if (!(err instanceof GroqError)) throw err;
    console.warn("[generate] Groq gagal, fallback ke Gemini:", err.message);
    try {
      text = await generateWithGemini({ kategori, tema, durasi, targetKata, maxTokens, systemPrompt, userPrompt });
      provider = "gemini";
    } catch (err2) {
      if (err2 instanceof GeminiError) {
        throw new Error("Kedua penyedia AI (Groq & Gemini) gagal merespons. Coba lagi sebentar lagi.");
      }
      throw err2;
    }
  }

  return { text, provider, attempts: 1 };
}
