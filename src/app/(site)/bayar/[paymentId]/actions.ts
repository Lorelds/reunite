"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { serverEnv } from "@/config/env";
import { signNotification } from "@/lib/payments";
import { currentUser, supabaseService } from "@/lib/supabase/server";

// Stands in for the gateway's hosted checkout: it sends the same signed
// notification a real gateway would, through the public webhook.
export async function simulate(paymentId: string, outcome: "paid" | "failed") {
  if (!z.string().uuid().safeParse(paymentId).success) redirect("/laporan-saya");
  const user = await currentUser();
  if (!user) redirect("/masuk");
  const { data: payment } = await supabaseService()
    .from("payments")
    .select("id, report_id, status")
    .eq("id", paymentId)
    .eq("payer_id", user.id)
    .maybeSingle();
  if (!payment) redirect("/laporan-saya");

  const body = JSON.stringify({ paymentId, status: outcome });
  const res = await fetch(`${serverEnv().APP_URL}/api/payments/webhook`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-signature": signNotification(body) },
    body,
  });
  if (!res.ok) throw new Error(`webhook returned ${res.status}`);
  redirect(outcome === "paid" ? `/laporan-saya?bayar=berhasil` : `/laporan/${payment.report_id}/bayar`);
}
