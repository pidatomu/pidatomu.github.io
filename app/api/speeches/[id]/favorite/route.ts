import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/speeches/[id]/favorite">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const { deviceId, isFavorited } = body;

    if (!deviceId) {
      return Response.json({ error: "deviceId wajib" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Pastikan speech milik device ini
    const { data: speech, error: fetchErr } = await supabase
      .from("speeches")
      .select("id, is_favorited")
      .eq("id", id)
      .eq("owner_ref", deviceId)
      .single();

    if (fetchErr || !speech) {
      return Response.json({ error: "Naskah tidak ditemukan" }, { status: 404 });
    }

    // Toggle atau set nilai eksplisit
    const newValue = typeof isFavorited === "boolean"
      ? isFavorited
      : !speech.is_favorited;

    const { error: updateErr } = await supabase
      .from("speeches")
      .update({ is_favorited: newValue })
      .eq("id", id);

    if (updateErr) {
      return Response.json({ error: "Gagal update favorit" }, { status: 500 });
    }

    return Response.json({ id, is_favorited: newValue });
  } catch (err) {
    console.error("[favorite] error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
