export class GroqError extends Error {}

interface GenerateParams {
  kategori: string;
  tema: string;
  durasi: number;
  systemPrompt: string;
}

export async function streamWithGroq({
  kategori,
  tema,
  durasi,
  systemPrompt,
}: GenerateParams): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Buatkan naskah untuk kategori "${kategori}" dengan tema "${tema}", durasi sekitar ${durasi} menit.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GroqError(`Groq API error ${res.status}: ${body}`);
  }

  if (!res.body) throw new GroqError("Groq API tidak mengembalikan stream");

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Parse SSE dari Groq → stream teks mentah chunk per chunk
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
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const json = JSON.parse(trimmed.slice(6));
              const token: string =
                json?.choices?.[0]?.delta?.content ?? "";
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
