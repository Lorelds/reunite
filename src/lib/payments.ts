import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/config/env";
import { computeFees } from "@/lib/fees";
import { supabaseService } from "@/lib/supabase/server";

// Payment provider seam. Only the SIMULATOR exists today; it mimics a gateway that
// hosts a checkout page and later posts a signed notification to /api/payments/webhook.
// A Midtrans sandbox provider replaces createCheckout + verifySignature here and nowhere else.

export type Notification = { paymentId: string; status: "paid" | "failed" };

export function signNotification(body: string) {
  return createHmac("sha256", serverEnv().PAYMENT_WEBHOOK_SECRET).update(body).digest("hex");
}

export function verifySignature(body: string, signature: string | null) {
  if (!signature) return false;
  const expected = Buffer.from(signNotification(body));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function createPayment(opts: { reportId: string; payerId: string; bountyIdr: number; postFeePaid: boolean }) {
  const fees = computeFees({ bountyIdr: opts.bountyIdr, postFeePaid: opts.postFeePaid });
  const db = supabaseService();
  const { data, error } = await db
    .from("payments")
    .insert({
      report_id: opts.reportId,
      payer_id: opts.payerId,
      kind: opts.bountyIdr > 0 ? "bounty" : "post_fee",
      bounty_idr: fees.bountyIdr,
      commission_idr: fees.commissionIdr,
      post_fee_idr: fees.postFeeDueIdr,
      total_idr: fees.totalIdr,
      provider: serverEnv().PAYMENT_PROVIDER,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (opts.bountyIdr > 0) {
    const { error: bErr } = await db
      .from("bounties")
      .upsert({ report_id: opts.reportId, amount_idr: opts.bountyIdr, status: "pending", payment_id: data.id });
    if (bErr) throw bErr;
  }
  return { paymentId: data.id as string, checkoutUrl: `/bayar/${data.id}` };
}

// Applied once per payment, from the signed notification only.
export async function applyNotification(n: Notification) {
  const db = supabaseService();
  const { data: payment, error } = await db
    .from("payments")
    .update({ status: n.status, paid_at: n.status === "paid" ? new Date().toISOString() : null })
    .eq("id", n.paymentId)
    .eq("status", "pending")
    .select("id, report_id, post_fee_idr, bounty_idr")
    .maybeSingle();
  if (error) throw error;
  if (!payment || n.status !== "paid") return payment;

  if (payment.post_fee_idr > 0) {
    await db.from("reports").update({ status: "pending_review" }).eq("id", payment.report_id).eq("status", "awaiting_payment");
  }
  if (payment.bounty_idr > 0) {
    await db
      .from("bounties")
      .update({ status: "active", activated_at: new Date().toISOString() })
      .eq("report_id", payment.report_id)
      .eq("payment_id", payment.id);
  }
  return payment;
}
