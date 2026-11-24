"use server";

import { revalidatePath } from "next/cache";
import { getOwnReport } from "@/lib/own-report";
import { supabaseService } from "@/lib/supabase/server";

// The person is home: take the report out of the public directory and keep it archived.
export async function archiveReport(reportId: string) {
  const own = await getOwnReport(reportId);
  if (!own) return;
  await supabaseService()
    .from("reports")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", own.report.id);
  revalidatePath("/laporan-saya");
}
