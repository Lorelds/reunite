"use client";

import Link from "next/link";
import { useActionState } from "react";
import { sendSighting } from "./actions";

export function SightingForm({ reportId, caseCode }: { reportId: string; caseCode: string }) {
  const [state, action, pending] = useActionState(sendSighting, null);
  if (state?.ok) {
    return (
      <div className="rounded-card border border-found/40 bg-found/10 p-[18px] text-[13px]">
        <p className="text-found">{state.message}</p>
        <Link href={`/kasus/${caseCode}`} className="btn btn-ghost mt-[14px]">Kembali ke kasus</Link>
      </div>
    );
  }
  return (
    <form action={action} className="grid gap-[14px] rounded-card border border-line bg-panel p-[18px]">
      <input type="hidden" name="reportId" value={reportId} />
      <p className="eyebrow text-[10px]">Form Informasi Penampakan</p>
      <label className="grid gap-[8px] text-[11px] font-bold tracking-[0.08em] text-muted">
        LOKASI MELIHAT (KOTA &amp; JALAN) *
        <input name="location" required minLength={3} maxLength={200} className="field font-normal tracking-normal" placeholder="Contoh: Jl. Sudirman, dekat halte Blok M" />
      </label>
      <label className="grid gap-[8px] text-[11px] font-bold tracking-[0.08em] text-muted">
        WAKTU MELIHAT
        <input name="seen_at" type="datetime-local" className="field font-normal tracking-normal" />
      </label>
      <label className="grid gap-[8px] text-[11px] font-bold tracking-[0.08em] text-muted">
        APA YANG ANDA LIHAT? *
        <textarea name="message" required minLength={10} maxLength={1500} className="field font-normal tracking-normal" placeholder="Pakaian, arah perjalanan, dengan siapa…" />
      </label>
      <div className="grid gap-[14px] sm:grid-cols-2">
        <label className="grid gap-[8px] text-[11px] font-bold tracking-[0.08em] text-muted">
          NAMA (OPSIONAL)
          <input name="sender_name" maxLength={80} className="field font-normal tracking-normal" placeholder="Boleh dikosongkan" />
        </label>
        <label className="grid gap-[8px] text-[11px] font-bold tracking-[0.08em] text-muted">
          KONTAK UNTUK DIHUBUNGI (OPSIONAL)
          <input name="contact" maxLength={80} className="field font-normal tracking-normal" placeholder="Nomor WhatsApp atau email" />
        </label>
      </div>
      {state && !state.ok && <p role="alert" className="text-[12px] text-wanted">{state.message}</p>}
      <button disabled={pending} className="btn btn-primary">{pending ? "Mengirim…" : "Kirim Informasi ke Pelapor"}</button>
      <p className="text-[11px] text-faint">Petunjuk hanya dapat dibaca pelapor dan tim REUNITE. Laporan palsu dapat dipidana (UU ITE).</p>
    </form>
  );
}
