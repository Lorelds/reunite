import { describe, expect, it } from "vitest";
import { FOUND_REPORT, MISSING_REPORT } from "@/lib/report-schema";

const png = () => new File([new Uint8Array(10)], "a.png", { type: "image/png" });

const missing = {
  photo: png(),
  full_name: "Budi Santoso",
  age: "42",
  gender: "Laki-laki",
  event_at: "2026-11-12T16:30",
  city: "Surabaya",
  address: "Jl. Pemuda",
  features: "Tahi lalat di pipi kanan",
  reporter_name: "Rina",
  contact_phone: "0812 3456 7890",
  ktp: png(),
  consent: "on",
};

describe("MISSING_REPORT", () => {
  it("accepts a complete report and normalises the phone", () => {
    const r = MISSING_REPORT.parse(missing);
    expect(r.contact_phone).toBe("081234567890");
    expect(r.bounty_idr).toBe(0);
    expect(r.event_at.toISOString()).toBe("2026-11-12T09:30:00.000Z");
  });

  it("requires consent and a KTP", () => {
    const res = MISSING_REPORT.safeParse({ ...missing, consent: undefined, ktp: undefined });
    expect(res.success).toBe(false);
  });

  it("rejects a bounty under the minimum", () => {
    expect(MISSING_REPORT.safeParse({ ...missing, bounty_idr: "5000" }).success).toBe(false);
    expect(MISSING_REPORT.parse({ ...missing, bounty_idr: "5000000" }).bounty_idr).toBe(5_000_000);
  });

  it("rejects files of the wrong type", () => {
    const exe = new File([new Uint8Array(4)], "a.exe", { type: "application/x-msdownload" });
    expect(MISSING_REPORT.safeParse({ ...missing, photo: exe }).success).toBe(false);
  });
});

describe("FOUND_REPORT", () => {
  it("allows an unknown name and no KTP", () => {
    const r = FOUND_REPORT.parse({
      photo: png(),
      face_blur: "on",
      age_range: "30–35 tahun",
      gender: "Laki-laki",
      event_at: "2026-11-18T22:15",
      city: "Bogor",
      address: "Terminal Baranangsiang",
      features: "Tidak membawa identitas",
      condition: "Stabil",
      reporter_name: "Petugas",
      contact_phone: "+6281200000010",
      consent: "on",
    });
    expect(r.full_name).toBeNull();
    expect(r.face_blur).toBe(true);
    expect(r.ktp).toBeUndefined();
  });
});
