"use server";

import { z } from "zod";
import { currentUser, supabaseService } from "@/lib/supabase/server";

const SIGHTING = z.object({
  reportId: z.string().uuid(),
  location: z.string().trim().min(3, "Lokasi wajib diisi.").max(200),
  seen_at: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(`${v}:00+07:00`).toISOString() : null)),
  message: z.string().trim().min(10, "Ceritakan minimal 10 karakter.").max(1500),
  sender_name: z.string().trim().max(80).optional().transform((v) => v || null),
  contact: z.string().trim().max(80).optional().transform((v) => v || null),
});

export type SightingState = { ok: boolean; message: string } | null;

export async function sendSighting(_prev: SightingState, form: FormData): Promise<SightingState> {
  const parsed = SIGHTING.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const db = supabaseService();
  const { data: report } = await db.from("reports").select("id").eq("id", parsed.data.reportId).eq("status", "published").maybeSingle();
  if (!report) return { ok: false, message: "Kasus tidak ditemukan." };
  const user = await currentUser();
  const { reportId, ...rest } = parsed.data;
  const { error } = await db.from("sightings").insert({ ...rest, report_id: reportId, sender_id: user?.id ?? null });
  if (error) return { ok: false, message: "Petunjuk gagal dikirim. Coba lagi." };
  return { ok: true, message: "Terima kasih. Petunjuk Anda sudah diteruskan ke pelapor." };
}
