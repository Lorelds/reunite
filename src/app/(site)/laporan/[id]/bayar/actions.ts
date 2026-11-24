"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { PRICING } from "@/config/pricing";
import { getOwnReport } from "@/lib/own-report";
import { createPayment } from "@/lib/payments";
import { supabaseService } from "@/lib/supabase/server";

const INPUT = z.object({
  reportId: z.string().uuid(),
  bounty: z.coerce.number().int().refine((v) => v === 0 || (v >= PRICING.BOUNTY_MIN_IDR && v <= PRICING.BOUNTY_MAX_IDR), "Nominal bounty tidak valid."),
  method: z.enum(["va", "qris"]),
});

export async function startPayment(_prev: string | null, form: FormData): Promise<string | null> {
  const parsed = INPUT.safeParse({ reportId: form.get("reportId"), bounty: form.get("bounty") || 0, method: form.get("method") });
  if (!parsed.success) return parsed.error.issues[0].message;
  const own = await getOwnReport(parsed.data.reportId);
  if (!own) return "Laporan tidak ditemukan.";

  const postFeePaid = own.report.status !== "awaiting_payment";
  if (postFeePaid && parsed.data.bounty === 0) return "Pilih nominal bounty untuk melanjutkan.";
  if (["rejected", "resolved", "archived"].includes(own.report.status)) return "Laporan ini tidak bisa menerima pembayaran.";

  const { data: existing } = await supabaseService().from("bounties").select("status").eq("report_id", own.report.id).maybeSingle();
  if (parsed.data.bounty > 0 && existing?.status === "active") return "Laporan ini sudah memiliki bounty aktif.";

  const { checkoutUrl } = await createPayment({
    reportId: own.report.id,
    payerId: own.user.id,
    bountyIdr: parsed.data.bounty,
    postFeePaid,
  });
  redirect(`${checkoutUrl}?metode=${parsed.data.method}`);
}
