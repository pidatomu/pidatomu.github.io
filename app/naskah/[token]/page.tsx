import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SharePageClient from "./SharePageClient";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("speeches")
    .select("tema, kategori, konten")
    .eq("share_token", token)
    .single();

  if (!data) return { title: "Naskah tidak ditemukan — Pidatomu" };

  const preview = data.konten?.replace(/\*\*/g, "").slice(0, 160) ?? "";
  return {
    title: `${data.tema} — ${data.kategori} | Pidatomu`,
    description: preview,
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: speech, error } = await supabase
    .from("speeches")
    .select(
      "id, tema, kategori, durasi, konten, ai_provider, created_at, nama_penceramah, nama_lokasi, tanggal, gaya_bahasa"
    )
    .eq("share_token", token)
    .single();

  if (error || !speech) notFound();

  return <SharePageClient speech={speech} token={token} />;
}
