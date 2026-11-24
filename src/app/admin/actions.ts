"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminEmail } from "@/config/env";
import { currentUser, supabaseService } from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await currentUser();
  if (!isAdminEmail(user?.email)) throw new Error("forbidden");
}

export async function publishReport(reportId: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(reportId).success) return;
  await supabaseService()
    .from("reports")
    .update({ status: "published", published_at: new Date().toISOString(), reject_reason: null })
    .eq("id", reportId)
    .eq("status", "pending_review");
  revalidatePath("/admin");
}

export async function rejectReport(reportId: string, form: FormData) {
  await requireAdmin();
  const reason = z.string().trim().min(5).max(300).safeParse(form.get("reason"));
  if (!z.string().uuid().safeParse(reportId).success || !reason.success) return;
  const db = supabaseService();
  await db.from("reports").update({ status: "rejected", reject_reason: reason.data }).eq("id", reportId).eq("status", "pending_review");
  // The bounty goes back to the poster; with a real gateway this is where the refund is issued.
  await db.from("bounties").update({ status: "refunded" }).eq("report_id", reportId).in("status", ["active", "pending"]);
  revalidatePath("/admin");
}
