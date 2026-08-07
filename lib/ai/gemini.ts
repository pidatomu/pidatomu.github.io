export class GeminiError extends Error {}

interface GenerateParams {
  kategori: string;
  tema: string;
  durasi: number;
  targetKata: number;
  maxTokens: number;
  systemPrompt: string;
  userPrompt: string;
}

export async function generateWithGemini({
  kategori,
  tema,
  durasi,
  targetKata,
  maxTokens,
  systemPrompt,
  userPrompt,
}: GenerateParams): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GeminiError(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

interface RefineParams {
  systemPrompt: string;
  refinePrompt: string;
  maxTokens: number;
}

export async function refineWithGemini({
  systemPrompt,
  refinePrompt,
  maxTokens,
}: RefineParams): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: refinePrompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GeminiError(`Gemini refine error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function streamWithGemini({
  kategori,
  tema,
  durasi,
  targetKata,
  maxTokens,
  systemPrompt,
  userPrompt,
}: GenerateParams): Promise<ReadableStream<Uint8Array>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GeminiError(`Gemini API error ${res.status}: ${body}`);
  }

  if (!res.body) throw new GeminiError("Gemini API tidak mengembalikan stream");

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Parse SSE dari Gemini → stream teks mentah chunk per chunk
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = res.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const token: string =
                json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              if (token) {
                controller.enqueue(encoder.encode(token));
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return readable;
}
