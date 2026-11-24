import { z } from "zod";
import { PRICING } from "@/config/pricing";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png"];
export const KTP_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const CITIES = [
  "Surabaya", "Sidoarjo", "Gresik", "Malang", "Kediri", "Jember", "Madiun",
  "Jakarta Selatan", "Jakarta Pusat", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "Bogor", "Depok", "Tangerang", "Bekasi", "Bandung", "Semarang", "Yogyakarta", "Solo",
] as const;

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max = 200) => text(max).min(1, `${label} wajib diisi.`);
const optional = (max = 300) =>
  text(max)
    .optional()
    .transform((v) => (v ? v : null));

const file = (types: string[], label: string) =>
  z
    .instanceof(File)
    .refine((f) => f.size > 0, `${label} wajib diunggah.`)
    .refine((f) => f.size <= MAX_UPLOAD_BYTES, `${label} maksimal 10 MB.`)
    .refine((f) => types.includes(f.type), `Format ${label.toLowerCase()} tidak didukung.`);

const optionalFile = (types: string[], label: string) =>
  z
    .instanceof(File)
    .optional()
    .transform((f) => (f && f.size > 0 ? f : undefined))
    .refine((f) => !f || f.size <= MAX_UPLOAD_BYTES, `${label} maksimal 10 MB.`)
    .refine((f) => !f || types.includes(f.type), `Format ${label.toLowerCase()} tidak didukung.`);

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+62|62|0)8\d{7,12}$/.test(v), "Nomor HP tidak valid. Contoh: 0812 3456 7890.");

const consent = z.literal("on", { message: "Anda harus menyetujui pernyataan data dan izin publikasi." });

const eventAt = z
  .string()
  .min(1, "Waktu wajib diisi.")
  .transform((v) => new Date(`${v}:00+07:00`))
  .refine((d) => !Number.isNaN(d.getTime()), "Waktu tidak valid.")
  .refine((d) => d.getTime() <= Date.now() + 60_000, "Waktu tidak boleh di masa depan.");

const bounty = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : 0))
  .refine((v) => v === 0 || (Number.isSafeInteger(v) && v >= PRICING.BOUNTY_MIN_IDR && v <= PRICING.BOUNTY_MAX_IDR), "Nominal bounty tidak valid.");

export const MISSING_REPORT = z.object({
  photo: file(PHOTO_TYPES, "Foto"),
  full_name: required("Nama lengkap", 120),
  age: z.coerce.number({ message: "Usia wajib diisi." }).int().min(0, "Usia tidak valid.").max(120, "Usia tidak valid."),
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Pilih jenis kelamin." }),
  nationality: text(60).default("Indonesia"),
  event_at: eventAt,
  city: required("Kota", 60),
  address: required("Alamat / patokan lokasi", 200),
  features: required("Ciri khusus", 500),
  height_weight: optional(60),
  hair: optional(60),
  clothing: optional(300),
  chronology: optional(1500),
  reporter_name: required("Nama pelapor", 120),
  reporter_relation: optional(60),
  contact_phone: phone,
  ktp: file(KTP_TYPES, "KTP / surat keterangan"),
  bounty_idr: bounty,
  consent,
});

export const FOUND_REPORT = z.object({
  photo: file(PHOTO_TYPES, "Foto"),
  face_blur: z.string().optional().transform((v) => v === "on"),
  full_name: optional(120),
  age_range: required("Perkiraan usia", 40),
  gender: z.enum(["Laki-laki", "Perempuan"], { message: "Pilih jenis kelamin." }),
  event_at: eventAt,
  city: required("Kota", 60),
  address: required("Lokasi ditemukan", 200),
  features: required("Ciri khusus", 500),
  clothing: optional(300),
  condition: required("Kondisi", 200),
  shelter_name: optional(120),
  shelter_address: optional(200),
  reporter_name: required("Nama pelapor", 120),
  reporter_relation: optional(60),
  contact_phone: phone,
  ktp: optionalFile(KTP_TYPES, "Kartu identitas"),
  consent,
});

export function formToObject(form: FormData) {
  const out: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of form.entries()) {
    if (v instanceof File && v.size === 0 && v.name === "") continue;
    out[k] = v;
  }
  return out;
}
