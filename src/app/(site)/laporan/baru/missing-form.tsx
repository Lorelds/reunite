"use client";

import { useState } from "react";
import { PRICING } from "@/config/pricing";
import { computeFees, formatRupiah } from "@/lib/fees";
import { CITIES } from "@/lib/report-schema";
import { submitReport } from "./actions";
import { Consent, DocInput, Field, PhotoInput, Wizard } from "./wizard";

const grid = "grid gap-[16px] sm:grid-cols-2";

export function MissingForm() {
  const [withBounty, setWithBounty] = useState(false);
  const [bounty, setBounty] = useState<number>(PRICING.BOUNTY_PRESETS_IDR[2]);
  const fees = computeFees({ bountyIdr: withBounty ? bounty : 0 });

  return (
    <Wizard
      action={submitReport.bind(null, "missing")}
      submitLabel="Kirim Laporan untuk Verifikasi"
      steps={[
        {
          label: "Foto",
          title: "Foto Orang",
          hint: "Gunakan foto terbaru dengan wajah terlihat jelas.",
          fields: ["photo"],
          body: <PhotoInput name="photo" label="Unggah foto terbaru" hint="JPG, PNG · Maks. 10 MB" accept="image/jpeg,image/png" />,
        },
        {
          label: "Data Diri",
          title: "Informasi Dasar",
          hint: "Masukkan informasi yang diketahui sejelas mungkin.",
          fields: ["full_name", "age", "gender", "nationality"],
          body: (
            <div className={grid}>
              <Field label="Nama lengkap" name="full_name" required>
                <input id="full_name" name="full_name" required maxLength={120} className="field" placeholder="Budi Santoso" />
              </Field>
              <Field label="Usia" name="age" required>
                <input id="age" name="age" type="number" min={0} max={120} required className="field" placeholder="42" />
              </Field>
              <Field label="Jenis kelamin" name="gender" required>
                <select id="gender" name="gender" required defaultValue="" className="field">
                  <option value="" disabled>Pilih</option>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </Field>
              <Field label="Kewarganegaraan" name="nationality">
                <input id="nationality" name="nationality" defaultValue="Indonesia" maxLength={60} className="field" />
              </Field>
            </div>
          ),
        },
        {
          label: "Lokasi",
          title: "Lokasi & Waktu Terakhir Terlihat",
          hint: "Tandai lokasi yang tepat untuk membantu proses pencarian.",
          fields: ["event_at", "city", "address"],
          body: (
            <div className={grid}>
              <Field label="Waktu terakhir terlihat" name="event_at" required>
                <input id="event_at" name="event_at" type="datetime-local" required className="field" />
              </Field>
              <Field label="Kota" name="city" required>
                <select id="city" name="city" required defaultValue="" className="field">
                  <option value="" disabled>Pilih kota</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Alamat / patokan lokasi" name="address" required wide>
                <input id="address" name="address" required maxLength={200} className="field" placeholder="Jl. Melati Raya, dekat halte utama" />
              </Field>
            </div>
          ),
        },
        {
          label: "Ciri Fisik",
          title: "Ciri Khusus & Pakaian Terakhir",
          hint: "Detail visual membantu masyarakat mengenali orang yang dicari.",
          fields: ["features", "height_weight", "hair", "clothing", "chronology"],
          body: (
            <div className={grid}>
              <Field label="Ciri khusus" name="features" required wide>
                <textarea id="features" name="features" required maxLength={500} className="field" placeholder="Tahi lalat di pipi kanan, tinggi sekitar 170 cm…" />
              </Field>
              <Field label="Tinggi / berat" name="height_weight">
                <input id="height_weight" name="height_weight" maxLength={60} className="field" placeholder="170 cm / ± 68 kg" />
              </Field>
              <Field label="Warna & model rambut" name="hair">
                <input id="hair" name="hair" maxLength={60} className="field" placeholder="Hitam, pendek" />
              </Field>
              <Field label="Pakaian terakhir" name="clothing" wide>
                <textarea id="clothing" name="clothing" maxLength={300} className="field" placeholder="Kemeja kotak-kotak biru dan celana panjang gelap" />
              </Field>
              <Field label="Kronologi singkat" name="chronology" wide>
                <textarea id="chronology" name="chronology" maxLength={1500} className="field" placeholder="Terakhir terlihat meninggalkan tempat kerja menuju halte bus…" />
              </Field>
            </div>
          ),
        },
        {
          label: "Verifikasi",
          title: "Kontak Darurat, Bounty & Verifikasi Pelapor",
          hint: "Verifikasi identitas mencegah laporan palsu dan melindungi keluarga.",
          fields: ["reporter_name", "reporter_relation", "contact_phone", "ktp", "bounty_idr", "consent"],
          body: (
            <>
              <div className={grid}>
                <Field label="Nama pelapor" name="reporter_name" required>
                  <input id="reporter_name" name="reporter_name" required maxLength={120} autoComplete="name" className="field" />
                </Field>
                <Field label="Hubungan" name="reporter_relation">
                  <input id="reporter_relation" name="reporter_relation" maxLength={60} className="field" placeholder="Orang tua / kakak / kerabat" />
                </Field>
                <Field label="Nomor kontak darurat" name="contact_phone" required>
                  <input id="contact_phone" name="contact_phone" type="tel" required autoComplete="tel" className="field" placeholder="0812 3456 7890" />
                </Field>
              </div>
              <div className="mt-[16px]"><DocInput name="ktp" required /></div>

              <div className="mt-[16px] rounded-card border border-line bg-panel p-[14px]">
                <label className="flex cursor-pointer items-center justify-between gap-[12px]">
                  <span>
                    <span className="block text-[13px] font-bold">Sertakan Imbalan (Bounty)</span>
                    <span className="block text-[11px] text-muted">Dana dipegang payment gateway hingga kasus selesai. Komisi platform {PRICING.COMMISSION_RATE * 100}%.</span>
                  </span>
                  <input type="checkbox" role="switch" checked={withBounty} onChange={(e) => setWithBounty(e.target.checked)} className="size-[18px] accent-fg" />
                </label>
                {withBounty && (
                  <div className="mt-[14px] flex flex-wrap gap-[8px]">
                    {PRICING.BOUNTY_PRESETS_IDR.map((v) => (
                      <button key={v} type="button" onClick={() => setBounty(v)} aria-pressed={bounty === v}
                        className={`rounded-[6px] border px-[12px] py-[8px] text-[12px] ${bounty === v ? "border-fg text-fg" : "border-line text-muted"}`}>
                        {formatRupiah(v)}
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" name="bounty_idr" value={withBounty ? bounty : 0} />
              </div>

              <div className="mt-[16px] rounded-card border border-amber-600/50 bg-amber-950/20 p-[14px] text-[12px]">
                <p className="font-bold tracking-[0.08em] text-amber-400">YANG AKAN DIBAYAR SETELAH KIRIM</p>
                <dl className="mt-[8px] grid grid-cols-[1fr_auto] gap-y-[4px] text-muted">
                  <dt>Biaya posting laporan</dt><dd className="text-right text-fg">{formatRupiah(fees.postFeeIdr)}</dd>
                  {withBounty && (<><dt>Bounty</dt><dd className="text-right text-fg">{formatRupiah(fees.bountyIdr)}</dd>
                  <dt>Komisi platform</dt><dd className="text-right text-fg">{formatRupiah(fees.commissionIdr)}</dd></>)}
                  <dt className="font-bold text-fg">Total</dt><dd className="text-right font-bold text-fg">{formatRupiah(fees.totalIdr)}</dd>
                </dl>
              </div>
              <Consent />
            </>
          ),
        },
      ]}
    />
  );
}
