import "server-only";
import { z } from "zod";
import type { Report } from "@/lib/reports";
import { currentUser, supabaseService } from "@/lib/supabase/server";

// Loads a report only if the signed-in user filed it.
export async function getOwnReport(id: string) {
  if (!z.string().uuid().safeParse(id).success) return null;
  const user = await currentUser();
  if (!user) return null;
  const { data } = await supabaseService().from("reports").select("*").eq("id", id).eq("reporter_id", user.id).maybeSingle();
  return data ? { user, report: data as Report } : null;
}
