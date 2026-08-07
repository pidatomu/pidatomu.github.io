import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkAndIncrementRateLimit } from "@/lib/rateLimit";
import { streamNaskahPidato } from "@/lib/ai/generate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      kategori,
      tema,
      durasi,
      deviceId,
      namaPenceramah,
      namaLokasi,
      tanggal,
      gayaBahasa,
      targetKata,
    } = body;

    if (!kategori || !tema || !durasi) {
      return Response.json(
        { error: "kategori, tema, dan durasi wajib diisi" },
        { status: 400 }
      );
    }

    // --- Tentukan owner
    const supabase = createServiceClient();
    const authHeader = req.headers.get("authorization");
    let owner: { type: "guest" | "user"; ref: string };

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length);
      const { data: { user } } = await supabase.auth.getUser(token);
      owner = user
        ? { type: "user", ref: user.id }
        : { type: "guest", ref: deviceId ?? "unknown" };
    } else {
      if (!deviceId) {
        return Response.json(
          { error: "deviceId wajib diisi untuk guest" },
          { status: 400 }
        );
      }
      owner = { type: "guest", ref: deviceId };
    }

    // --- Rate limit
    const rl = await checkAndIncrementRateLimit(owner);
    if (!rl.allowed) {
      return Response.json(
        {
          error: `Batas ${rl.limit} naskah/hari sudah tercapai. Coba lagi besok${
            owner.type === "guest" ? ", atau login untuk kuota lebih besar." : "."
          }`,
        },
        { status: 429 }
      );
    }

    // --- Generate with streaming
    const { stream, provider } = await streamNaskahPidato({
      kategori,
      tema,
      durasi,
      targetKata: targetKata ?? Math.round(durasi * 130),
      personalisasi: { namaPenceramah, namaLokasi, tanggal, gayaBahasa },
    });

    // --- Tee the stream: one for response, one for saving to DB
    const [clientStream, dbStream] = stream.tee();

    // --- Save to DB in background (read full stream, then insert)
    const shareToken = crypto.randomUUID();
    (async () => {
      try {
        const reader = dbStream.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }

        const { error: insertError } = await supabase.from("speeches").insert({
          owner_type: owner.type,
          owner_ref: owner.ref,
          kategori,
          tema,
          durasi,
          konten: fullText,
          ai_provider: provider,
          share_token: shareToken,
          nama_penceramah: namaPenceramah ?? null,
          nama_lokasi: namaLokasi ?? null,
          gaya_bahasa: gayaBahasa ?? "formal",
        });

        if (insertError) {
          console.error("[generate-pidato] gagal simpan:", insertError.message);
        }
      } catch (err) {
        console.error("[generate-pidato] background save error:", err);
      }
    })();

    // --- Return streaming response with metadata headers
    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Provider": provider,
        "X-Remaining": String(rl.limit - rl.currentCount),
        "X-Share-Token": shareToken,
      },
    });
  } catch (err) {
    console.error("[generate-pidato] error:", err);
    return Response.json(
      { error: "Terjadi kesalahan saat membuat naskah. Coba lagi." },
      { status: 500 }
    );
  }
}
