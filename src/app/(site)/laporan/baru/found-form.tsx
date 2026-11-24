"use client";

import { PRICING } from "@/config/pricing";
import { formatRupiah } from "@/lib/fees";
import { CITIES } from "@/lib/report-schema";
import { submitReport } from "./actions";
import { Consent, DocInput, Field, PhotoInput, Wizard } from "./wizard";

const grid = "grid gap-[16px] sm:grid-cols-2";

export function FoundForm() {
  return (
    <Wizard
      action={submitReport.bind(null, "found")}
      submitLabel="Kirim Laporan untuk Verifikasi"
      steps={[
        {
          label: "Foto",
          title: "Foto Orang",
          hint: "Gunakan foto yang jelas saat orang tersebut ditemukan.",
          fields: ["photo", "face_blur"],
          body: (
            <>
              <PhotoInput name="photo" label="Unggah foto saat ditemukan" hint="JPG, PNG · Maks. 10 MB" accept="image/jpeg,image/png" />
              <label className="mt-[14px] flex items-center justify-between gap-[12px] rounded-card border border-line bg-panel p-[14px]">
                <span>
                  <span className="block text-[13px] font-bold">Blur wajah untuk privasi</span>
                  <span className="block text-[11px] text-muted">Wajah disamarkan di halaman publik sampai pengunjung meminta melihatnya.</span>
                </span>
                <input type="checkbox" name="face_blur" defaultChecked className="size-[18px] accent-fg" />
              </label>
            </>
          ),
        },
        {
          label: "Identitas",
          title: "Perkiraan Identitas",
          hint: "Isi yang Anda ketahui. Kosongkan nama jika belum diketahui.",
          fields: ["full_name", "age_range", "gender", "features"],
          body: (
            <div className={grid}>
              <Field label="Nama (jika diketahui)" name="full_name">
                <input id="full_name" name="full_name" maxLength={120} className="field" />
              </Field>
              <Field label="Perkiraan usia" name="age_range" required>
                <input id="age_range" name="age_range" required maxLength={40} className="field" placeholder="30–35 tahun" />
              </Field>
              <Field label="Jenis kelamin" name="gender" required>
                <select id="gender" name="gender" required defaultValue="" className="field">
                  <option value="" disabled>Pilih</option>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </Field>
              <Field label="Ciri khusus" name="features" required wide>
                <textarea id="features" name="features" required maxLength={500} className="field" placeholder="Tidak membawa identitas, bekas luka di tangan kiri…" />
              </Field>
            </div>
          ),
        },
        {
          label: "Lokasi",
          title: "Lokasi & Waktu Ditemukan",
          hint: "Di mana dan kapan orang ini ditemukan.",
          fields: ["event_at", "city", "address"],
          body: (
            <div className={grid}>
              <Field label="Waktu ditemukan" name="event_at" required>
                <input id="event_at" name="event_at" type="datetime-local" required className="field" />
              </Field>
              <Field label="Kota" name="city" required>
                <select id="city" name="city" required defaultValue="" className="field">
                  <option value="" disabled>Pilih kota</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Lokasi ditemukan" name="address" required wide>
                <input id="address" name="address" required maxLength={200} className="field" placeholder="Terminal Baranangsiang, Bogor" />
              </Field>
            </div>
          ),
        },
        {
          label: "Kondisi & Kontak",
          title: "Kondisi & Kontak",
          hint: "Kondisi saat ini dan di mana orang tersebut berada sekarang.",
          fields: ["condition", "clothing", "shelter_name", "shelter_address", "reporter_name", "reporter_relation", "contact_phone", "ktp", "consent"],
          body: (
            <>
              <div className={grid}>
                <Field label="Kondisi fisik" name="condition" required>
                  <input id="condition" name="condition" required maxLength={200} className="field" placeholder="Stabil, tampak kebingungan" />
                </Field>
                <Field label="Pakaian" name="clothing">
                  <input id="clothing" name="clothing" maxLength={300} className="field" placeholder="Kemeja hitam, celana jeans" />
                </Field>
                <Field label="Lokasi penampungan saat ini" name="shelter_name">
                  <input id="shelter_name" name="shelter_name" maxLength={120} className="field" placeholder="Posko Dinas Sosial Kota Bogor" />
                </Field>
                <Field label="Alamat penampungan" name="shelter_address">
                  <input id="shelter_address" name="shelter_address" maxLength={200} className="field" />
                </Field>
                <Field label="Nama pelapor" name="reporter_name" required>
                  <input id="reporter_name" name="reporter_name" required maxLength={120} autoComplete="name" className="field" />
                </Field>
                <Field label="Instansi / hubungan" name="reporter_relation">
                  <input id="reporter_relation" name="reporter_relation" maxLength={60} className="field" placeholder="Warga / petugas" />
                </Field>
                <Field label="Nomor kontak" name="contact_phone" required>
                  <input id="contact_phone" name="contact_phone" type="tel" required autoComplete="tel" className="field" placeholder="0812 3456 7890" />
                </Field>
              </div>
              <div className="mt-[16px]"><DocInput name="ktp" /></div>
              <p className="mt-[16px] text-[12px] text-muted">
                Biaya posting laporan: <strong className="text-fg">{formatRupiah(PRICING.POST_FEE_IDR)}</strong>, dibayar setelah laporan dikirim.
              </p>
              <Consent />
            </>
          ),
        },
      ]}
    />
  );
}
