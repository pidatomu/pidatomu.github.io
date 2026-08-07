import { NextRequest } from "next/server";
import { generateWithGroq, refineWithGroq, GroqError } from "@/lib/ai/groq";
import { generateWithGemini, refineWithGemini, GeminiError } from "@/lib/ai/gemini";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, targetKata, kategori, tema } = body;

    if (!text || !targetKata || !kategori || !tema) {
      return Response.json(
        { error: "text, targetKata, kategori, dan tema wajib diisi" },
        { status: 400 }
      );
    }

    const currentWords = countWords(text);
    const ratio = Math.abs(currentWords - targetKata) / targetKata;

    // Within ±15% tolerance — no refinement needed
    if (ratio <= 0.15) {
      return Response.json({ text, refined: false, wordCount: currentWords });
    }

    // Off-target — refine with AI
    const diff = targetKata - currentWords;
    const direction = diff > 0 ? "kurang" : "lebih";
    const needed = Math.abs(diff);
    const action = diff > 0 ? "TAMBAH" : "KURANGI";

    const systemPrompt = `Kamu adalah penulis naskah pidato/ceramah/khutbah berbahasa Indonesia yang islami, natural, dan enak dibaca saat disampaikan lisan.

Gunakan format berikut (gunakan heading markdown **bold** untuk setiap bagian):

**PEMBUKA**
(salam pembuka, muqaddimah, puji syukur kepada Allah, sholawat kepada Nabi)

**ISI**
(penjelasan tema secara runtut, sertakan dalil/hadits bila relevan, contoh nyata yang relatable)

**PENUTUP**
(kesimpulan, doa penutup, salam penutup)

PENTING: Pertahankan format **bold** heading. Kirim SELURUH naskah yang sudah diperbaiki.`;

    const refinePrompt = `Berikut naskah pidato yang sudah dibuat:

${text}

MASALAH: Naskah saat ini ${currentWords} kata, ${direction} dari target ${targetKata} kata.
Selisih: ${needed} kata (${direction}).

TOLONG ${action} naskah agar tepat ${targetKata} kata (±10%).
${diff > 0 ? "Tambahkan penjelasan, contoh, atau dalil yang relevan untuk menambah isi." : "Singkat bagian yang terlalu panjang tanpa menghilangkan inti pesan."}

Kirim SELURUH naskah yang sudah diperbaiki (jangan hanya bagian yang diubah). Pastikan format **bold** heading tetap ada.`;

    const maxTokens = Math.min(Math.max(Math.round(targetKata * 1.5), 1024), 8192);

    let refinedText: string | null = null;

    // Try Groq first
    try {
      refinedText = await refineWithGroq({ systemPrompt, refinePrompt, maxTokens });
    } catch (err) {
      if (!(err instanceof GroqError)) throw err;
      console.warn("[refine-naskah] Groq gagal, fallback ke Gemini:", err.message);
    }

    // Fallback to Gemini
    if (!refinedText) {
      try {
        refinedText = await refineWithGemini({ systemPrompt, refinePrompt, maxTokens });
      } catch (err) {
        if (err instanceof GeminiError) {
          throw new Error("Kedua penyedia AI (Groq & Gemini) gagal merespons.");
        }
        throw err;
      }
    }

    const refinedWords = countWords(refinedText);
    return Response.json({ text: refinedText, refined: true, wordCount: refinedWords });
  } catch (err) {
    console.error("[refine-naskah] error:", err);
    return Response.json(
      { error: "Gagal melakukan refinement. Coba lagi." },
      { status: 500 }
    );
  }
}
