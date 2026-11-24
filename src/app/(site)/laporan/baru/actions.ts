"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { FOUND_REPORT, MISSING_REPORT, formToObject } from "@/lib/report-schema";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export type SubmitState = { error?: string; fields?: Record<string, string> } | null;

function ext(file: File) {
  return file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
}

async function upload(bucket: "report-photos" | "ktp", userId: string, file: File) {
  const path = `${userId}/${randomUUID()}.${ext(file)}`;
  const { error } = await supabaseService().storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function submitReport(kind: "missing" | "found", _prev: SubmitState, form: FormData): Promise<SubmitState> {
  const user = await currentUser();
  if (!user) redirect(`/masuk?lanjut=/laporan/baru/${kind === "missing" ? "hilang" : "ditemukan"}`);

  const raw = formToObject(form);
  const parsed = (kind === "missing" ? MISSING_REPORT : FOUND_REPORT).safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return { error: "Periksa kembali isian yang ditandai.", fields };
  }
  const d = parsed.data;
  const db = supabaseService();

  let reportId: string;
  try {
    const photoPath = await upload("report-photos", user.id, d.photo);
    const ktpPath = d.ktp ? await upload("ktp", user.id, d.ktp) : null;
    const photoUrl = db.storage.from("report-photos").getPublicUrl(photoPath).data.publicUrl;

    const common = {
      kind,
      reporter_id: user.id,
      gender: d.gender,
      event_at: d.event_at.toISOString(),
      city: d.city,
      address: d.address,
      features: d.features,
      clothing: d.clothing,
      reporter_name: d.reporter_name,
      reporter_relation: d.reporter_relation,
      contact_phone: d.contact_phone,
      photo_url: photoUrl,
      ktp_path: ktpPath,
      consent_at: new Date().toISOString(),
    };
    const row: Record<string, unknown> =
      "age" in d
        ? { ...common, full_name: d.full_name, age: d.age, nationality: d.nationality, height_weight: d.height_weight, hair: d.hair, chronology: d.chronology, face_blur: false }
        : { ...common, full_name: d.full_name, age_range: d.age_range, condition: d.condition, shelter_name: d.shelter_name, shelter_address: d.shelter_address, face_blur: d.face_blur };

    const { data, error } = await db.from("reports").insert(row).select("id").single();
    if (error) throw error;
    reportId = data.id;
  } catch (e) {
    console.error("submitReport failed", e);
    return { error: "Laporan gagal disimpan. Coba lagi beberapa saat lagi." };
  }

  const bounty = "bounty_idr" in d ? d.bounty_idr : 0;
  redirect(`/laporan/${reportId}/bayar${bounty ? `?bounty=${bounty}` : ""}`);
}
