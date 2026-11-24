import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { StatusBadge } from "@/components/status-badge";
import { formatRupiah } from "@/lib/fees";
import { formatEventDate, type Report, type ReportStatus } from "@/lib/reports";
import { currentUser, supabaseService } from "@/lib/supabase/server";
import { archiveReport } from "./actions";

export const metadata = { title: "Laporan Saya — REUNITE" };

const STATUS_LABEL: Record<ReportStatus, [string, string]> = {
  awaiting_payment: ["MENUNGGU PEMBAYARAN", "text-amber-400"],
  pending_review: ["MENUNGGU VERIFIKASI ADMIN", "text-amber-400"],
  published: ["DIPUBLIKASIKAN", "text-found"],
  rejected: ["DITOLAK", "text-wanted"],
  resolved: ["SELESAI", "text-muted"],
  archived: ["DIARSIPKAN", "text-muted"],
};

type Row = Report & { bounties: { amount_idr: number; status: string } | null; sightings: { count: number }[] };

async function MyReports({ searchParams }: PageProps<"/laporan-saya">) {
  const paid = (await searchParams).bayar === "berhasil";
  const user = await currentUser();
  const { data } = await supabaseService()
    .from("reports")
    .select("*, bounties(amount_idr, status), sightings(count)")
    .eq("reporter_id", user!.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  const active = rows.filter((r) => ["pending_review", "published"].includes(r.status)).length;
  const tips = rows.reduce((n, r) => n + (r.sightings[0]?.count ?? 0), 0);
  const escrow = rows.reduce((n, r) => n + (r.bounties?.status === "active" ? r.bounties.amount_idr : 0), 0);

  return (
    <>
      {paid && (
        <p role="status" className="mb-[18px] rounded-card border border-found/40 bg-found/10 p-[12px] text-[13px] text-found">
          Pembayaran berhasil. Laporan Anda masuk antrean verifikasi admin.
        </p>
      )}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line desk:grid-cols-3">
        {[["Laporan aktif", String(active)], ["Petunjuk masuk", String(tips)], ["Dana bounty aktif", formatRupiah(escrow)]].map(([k, v]) => (
          <div key={k} className="bg-panel p-[16px]">
            <dt className="text-[11px] text-muted">{k}</dt>
            <dd className="mt-[6px] font-display text-[24px]">{v}</dd>
          </div>
        ))}
      </dl>

      {rows.length === 0 ? (
        <div className="mt-[18px] rounded-card border border-dashed border-line p-[40px] text-center">
          <p className="font-display text-[20px]">Belum ada laporan.</p>
          <Link href="/laporan/baru" className="btn btn-primary mt-[16px]">+ Buat Laporan</Link>
        </div>
      ) : (
        <ul className="mt-[18px] grid gap-[12px]">
          {rows.map((r) => {
            const [label, color] = STATUS_LABEL[r.status];
            const bounty = r.bounties;
            return (
              <li key={r.id} className="grid gap-[14px] rounded-card border border-line bg-panel p-[14px] sm:grid-cols-[90px_1fr_auto] sm:items-center">
                <span className="relative block size-[90px] overflow-hidden rounded-[6px] bg-ink-raised">
                  {r.photo_url && <Image src={r.photo_url} alt="" fill sizes="90px" className={`object-cover ${r.face_blur ? "blur-md" : ""}`} unoptimized={r.photo_url.startsWith("http")} />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-[8px]">
                    <StatusBadge kind={r.kind} />
                    <span className={`text-[10px] font-bold tracking-[0.08em] ${color}`}>{label}</span>
                  </div>
                  <p className="mt-[8px] font-display text-[18px]">{r.full_name ?? "Identitas belum diketahui"}</p>
                  <p className="text-[12px] text-muted">#{r.case_code} · {r.city} · {formatEventDate(r.event_at)}</p>
                  {bounty && (
                    <p className="mt-[4px] text-[12px] text-amber-400">
                      Bounty {formatRupiah(bounty.amount_idr)} · {bounty.status === "active" ? "aktif" : "menunggu pembayaran"}
                    </p>
                  )}
                  {r.status === "rejected" && r.reject_reason && <p className="mt-[4px] text-[12px] text-wanted">Alasan: {r.reject_reason}</p>}
                </div>
                <div className="flex flex-wrap gap-[8px] sm:flex-col">
                  {r.status === "awaiting_payment" && <Link href={`/laporan/${r.id}/bayar`} className="btn btn-primary min-h-[36px]">Bayar biaya posting</Link>}
                  {r.kind === "missing" && ["pending_review", "published"].includes(r.status) && bounty?.status !== "active" && (
                    <Link href={`/laporan/${r.id}/bayar`} className="btn btn-ghost min-h-[36px]">Tambah bounty</Link>
                  )}
                  {r.status === "published" && <Link href={`/kasus/${r.case_code}`} className="btn btn-ghost min-h-[36px]">Lihat publik</Link>}
                  {!["archived", "resolved", "awaiting_payment"].includes(r.status) && (
                    <form action={archiveReport.bind(null, r.id)}>
                      <button className="btn btn-ghost min-h-[36px] w-full">Sudah ditemukan · arsipkan</button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function MyReportsPage(props: PageProps<"/laporan-saya">) {
  return (
    <div className="mx-auto max-w-[1100px] px-[14px] pb-[60px] pt-[32px] desk:px-[34px] desk:pt-[48px]">
      <header className="mb-[24px] flex flex-col gap-[14px] border-b border-line pb-[24px] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[10px]">Akun Pelapor</p>
          <h1 className="mt-[10px] font-display text-[30px] tracking-[-0.03em] desk:text-[40px]">Laporan Saya</h1>
          <p className="mt-[8px] text-[13px] text-muted">Pantau status verifikasi, petunjuk, dan bounty laporan Anda.</p>
        </div>
        <Link href="/laporan/baru" className="btn btn-primary">+ Buat Laporan</Link>
      </header>
      <Suspense fallback={<PageLoading />}><MyReports {...props} /></Suspense>
    </div>
  );
}
