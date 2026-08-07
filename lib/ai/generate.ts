import { streamWithGroq, GroqError } from "./groq";
import { streamWithGemini, GeminiError } from "./gemini";

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
PENTING: Jangan tambahkan kata "markdown" atau simbol lain selain **bold** untuk heading. Tulis naskah yang siap dibacakan, bukan template.`;
}

export async function streamNaskahPidato(params: {
  kategori: string;
  tema: string;
  durasi: number;
  personalisasi?: PersonalisasiParams;
}): Promise<{ stream: ReadableStream<Uint8Array>; provider: Provider }> {
  const { kategori, tema, durasi, personalisasi = {} } = params;
  const systemPrompt = buildSystemPrompt(personalisasi);
  const input = { kategori, tema, durasi, systemPrompt };

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
      throw new Error(
        "Kedua penyedia AI (Groq & Gemini) gagal merespons. Coba lagi sebentar lagi."
      );
    }
    throw err;
  }
}