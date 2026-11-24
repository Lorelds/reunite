import "server-only";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export type ReportKind = "missing" | "found";
export type ReportStatus = "awaiting_payment" | "pending_review" | "published" | "rejected" | "resolved" | "archived";

export type Report = {
  id: string;
  case_code: string;
  kind: ReportKind;
  status: ReportStatus;
  full_name: string | null;
  age: number | null;
  age_range: string | null;
  gender: string | null;
  event_at: string;
  city: string;
  address: string;
  features: string;
  height_weight: string | null;
  hair: string | null;
  clothing: string | null;
  chronology: string | null;
  condition: string | null;
  shelter_name: string | null;
  shelter_address: string | null;
  reporter_name: string;
  reporter_relation: string | null;
  photo_url: string | null;
  face_blur: boolean;
  created_at: string;
  published_at: string | null;
  reject_reason: string | null;
};

export const DIRECTORY_FILTERS = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  kota: z.string().trim().max(60).optional().catch(undefined),
  area: z.string().trim().max(80).optional().catch(undefined),
  status: z.enum(["semua", "dicari", "ditemukan"]).catch("semua"),
  umin: z.coerce.number().int().min(0).max(120).optional().catch(undefined),
  umax: z.coerce.number().int().min(0).max(120).optional().catch(undefined),
  waktu: z.enum(["semua", "7", "30", "90"]).catch("semua"),
  urut: z.enum(["terbaru", "terlama"]).catch("terbaru"),
});

export type DirectoryFilters = z.infer<typeof DIRECTORY_FILTERS>;

const PUBLIC_STATUSES: ReportStatus[] = ["published"];

function escapeLike(value: string) {
  return value.replace(/[%_,()]/g, " ");
}

export async function listDirectory(filters: DirectoryFilters) {
  const supabase = await supabaseServer();
  let query = supabase.from("reports").select("*").in("status", PUBLIC_STATUSES);

  if (filters.status === "dicari") query = query.eq("kind", "missing");
  if (filters.status === "ditemukan") query = query.eq("kind", "found");
  if (filters.kota) query = query.eq("city", filters.kota);
  if (filters.q) {
    const q = escapeLike(filters.q);
    query = query.or(`full_name.ilike.%${q}%,features.ilike.%${q}%,clothing.ilike.%${q}%`);
  }
  if (filters.area) query = query.ilike("address", `%${escapeLike(filters.area)}%`);
  if (filters.umin !== undefined) query = query.gte("age", filters.umin);
  if (filters.umax !== undefined) query = query.lte("age", filters.umax);
  if (filters.waktu !== "semua") {
    const since = new Date(Date.now() - Number(filters.waktu) * 86_400_000).toISOString();
    query = query.gte("event_at", since);
  }
  query = query.order("event_at", { ascending: filters.urut === "terlama" });

  const { data, error } = await query.limit(60);
  if (error) throw error;
  return (data ?? []) as Report[];
}

export async function directoryStats() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("reports").select("kind, city").in("status", PUBLIC_STATUSES);
  if (error) throw error;
  const rows = data ?? [];
  const cities = [...new Set(rows.map((r) => r.city as string))].sort();
  return {
    total: rows.length,
    missing: rows.filter((r) => r.kind === "missing").length,
    found: rows.filter((r) => r.kind === "found").length,
    cities,
  };
}

export async function getPublicReport(caseCode: string) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("reports").select("*").eq("case_code", caseCode).maybeSingle();
  if (error) throw error;
  return data as Report | null;
}

export async function getActiveBounty(reportId: string) {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("bounties")
    .select("amount_idr, status")
    .eq("report_id", reportId)
    .eq("status", "active")
    .maybeSingle();
  return data as { amount_idr: number; status: string } | null;
}

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});
const TIME_FMT = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

export function formatEventDate(iso: string) {
  const d = new Date(iso);
  return `${DATE_FMT.format(d)} · ${TIME_FMT.format(d)}`;
}

export function formatLongDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(
    new Date(iso),
  );
}
