import Image from "next/image";
import { Suspense } from "react";
import { StatusBadge } from "@/components/status-badge";
import { formatRupiah } from "@/lib/fees";
import { formatEventDate, type Report } from "@/lib/reports";
import { supabaseService } from "@/lib/supabase/server";
import { publishReport, rejectReport } from "./actions";

export const metadata = { title: "Antrean Moderasi — REUNITE Admin" };

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

type Row = Report & {
  contact_phone: string;
  ktp_path: string | null;
  bounties: { amount_idr: number; status: string } | null;
  hoax_flags: { count: number }[];
};

async function Queue() {
  const db = supabaseService();
  const { data } = await db
    .from("reports")
    .select("*, bounties(amount_idr, status), hoax_flags(count)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });
  const rows = (data ?? []) as Row[];
  const { count: today } = await db
    .from("reports")
    .select("id", { count: "exact", head: true })
    .gte("created_at", hoursAgoIso(24));

  const ktpUrls = await Promise.all(
    rows.map(async (r) => (r.ktp_path ? ((await db.storage.from("ktp").createSignedUrl(r.ktp_path, 300)).data?.signedUrl ?? null) : null)),
  );

  return (
    <>
      <dl className="mt-[20px] grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line">
        <div className="bg-panel p-[16px]">
          <dt className="text-[11px] text-muted">Laporan masuk 24 jam</dt>
          <dd className="font-display text-[28px]">{today ?? 0}</dd>
        </div>
        <div className="bg-panel p-[16px]">
          <dt className="text-[11px] text-muted">Menunggu verifikasi</dt>
          <dd className="font-display text-[28px]">{rows.length}</dd>
        </div>
      </dl>
      {rows.length === 0 ? (
        <p className="mt-[20px] rounded-card border border-dashed border-line p-[30px] text-center text-[13px] text-muted">
          Antrean kosong. Semua laporan sudah ditinjau.
        </p>
      ) : (
        <ul className="mt-[20px] grid gap-[12px]">
          {rows.map((r, i) => (
            <li key={r.id} className="grid grid-cols-[120px_1fr_260px] gap-[18px] rounded-card border border-line bg-panel p-[16px]">
              <span className="relative block size-[120px] overflow-hidden rounded-[6px] bg-ink-raised">
                {r.photo_url && <Image src={r.photo_url} alt="" fill sizes="120px" className="object-cover" unoptimized={r.photo_url.startsWith("http")} />}
              </span>
              <div className="text-[12px]">
                <div className="flex items-center gap-[8px]">
                  <StatusBadge kind={r.kind} />
                  <span className="text-muted">#{r.case_code}</span>
                  {r.hoax_flags[0]?.count ? <span className="text-wanted">{r.hoax_flags[0].count} laporan hoaks</span> : null}
                </div>
                <p className="mt-[8px] font-display text-[18px]">
                  {r.full_name ?? "Identitas belum diketahui"} {r.age !== null ? `· ${r.age} th` : r.age_range ? `· ${r.age_range}` : ""}
                </p>
                <p className="text-muted">{r.city} · {r.address} · {formatEventDate(r.event_at)}</p>
                <p className="mt-[6px]">{r.features}</p>
                <p className="mt-[6px] text-muted">
                  Pelapor: <span className="text-fg">{r.reporter_name}</span> {r.reporter_relation ? `(${r.reporter_relation})` : ""} · {r.contact_phone}
                </p>
                <p className="mt-[6px]">
                  {ktpUrls[i] ? (
                    <a href={ktpUrls[i]!} target="_blank" rel="noreferrer" className="underline">Buka KTP / surat (tautan 5 menit)</a>
                  ) : (
                    <span className="text-amber-400">Tanpa dokumen identitas</span>
                  )}
                  {r.bounties && <span className="ml-[10px] text-amber-400">Bounty {formatRupiah(r.bounties.amount_idr)} ({r.bounties.status})</span>}
                </p>
              </div>
              <div className="grid content-start gap-[8px]">
                <form action={publishReport.bind(null, r.id)}>
                  <button className="btn btn-primary w-full">Setujui &amp; publikasikan</button>
                </form>
                <form action={rejectReport.bind(null, r.id)} className="grid gap-[6px]">
                  <input name="reason" required minLength={5} maxLength={300} placeholder="Alasan penolakan" aria-label="Alasan penolakan" className="field h-[38px] text-[12px]" />
                  <button className="btn btn-ghost w-full">Tolak laporan</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function AdminQueuePage() {
  return (
    <div>
      <p className="eyebrow text-[10px]">REUNITE / Secure Admin</p>
      <h1 className="mt-[8px] font-display text-[30px]">Antrean Moderasi</h1>
      <p className="mt-[6px] text-[13px] text-muted">Tinjau identitas pelapor, cek dokumen, lalu publikasikan atau tolak laporan.</p>
      <Suspense fallback={<p className="mt-[20px] text-muted">Memuat…</p>}>
        <Queue />
      </Suspense>
    </div>
  );
}
