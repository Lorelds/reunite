"use server";

import { z } from "zod";
import { currentUser, supabaseService } from "@/lib/supabase/server";

const HOAX = z.object({
  reportId: z.string().uuid(),
  reason: z.string().trim().min(10, "Jelaskan alasannya minimal 10 karakter.").max(500),
});

export type HoaxState = { ok: boolean; message: string } | null;

export async function flagHoax(_prev: HoaxState, form: FormData): Promise<HoaxState> {
  const parsed = HOAX.safeParse({ reportId: form.get("reportId"), reason: form.get("reason") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const user = await currentUser();
  const { error } = await supabaseService()
    .from("hoax_flags")
    .insert({ report_id: parsed.data.reportId, reason: parsed.data.reason, flagged_by: user?.id ?? null });
  if (error) return { ok: false, message: "Laporan gagal dikirim. Coba lagi." };
  return { ok: true, message: "Terima kasih. Moderator akan meninjau laporan ini." };
}
