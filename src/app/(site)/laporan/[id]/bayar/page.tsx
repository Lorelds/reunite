import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { PRICING } from "@/config/pricing";
import { getOwnReport } from "@/lib/own-report";
import { supabaseService } from "@/lib/supabase/server";
import { EscrowForm } from "./escrow-form";

export const metadata = { title: "Pembayaran — REUNITE" };

async function Escrow({ params, searchParams }: PageProps<"/laporan/[id]/bayar">) {
  const own = await getOwnReport((await params).id);
  if (!own) notFound();
  const { report } = own;
  const requested = Number((await searchParams).bounty ?? 0);
  const postFeePaid = report.status !== "awaiting_payment";
  const { data: bounty } = await supabaseService().from("bounties").select("status, amount_idr").eq("report_id", report.id).maybeSingle();
  const bountyActive = bounty?.status === "active";
  const allowBounty = report.kind === "missing" && !bountyActive;

  if (postFeePaid && !allowBounty) {
    return (
      <div className="rounded-card border border-line bg-panel p-[20px] text-[13px]">
        <p>Tidak ada tagihan untuk laporan ini.</p>
        <Link href="/laporan-saya" className="btn btn-ghost mt-[14px]">Ke Laporan Saya</Link>
      </div>
    );
  }

  const initial = Number.isSafeInteger(requested) && requested >= PRICING.BOUNTY_MIN_IDR ? requested : postFeePaid ? PRICING.BOUNTY_PRESETS_IDR[2] : 0;
  return (
    <EscrowForm
      key={`${report.status}-${initial}`}
      reportId={report.id}
      caseCode={report.case_code}
      name={report.full_name ?? "orang ditemukan"}
      kind={report.kind}
      photoUrl={report.photo_url}
      postFeePaid={postFeePaid}
      initialBounty={allowBounty ? initial : 0}
      allowBounty={allowBounty}
    />
  );
}

export default function PayPage(props: PageProps<"/laporan/[id]/bayar">) {
  return (
    <div className="mx-auto max-w-[1100px] px-[14px] pb-[60px] pt-[32px] desk:px-[34px] desk:pt-[48px]">
      <header className="border-b border-line pb-[24px]">
        <p className="eyebrow text-[10px]">Secure Bounty Escrow</p>
        <h1 className="mt-[10px] font-display text-[30px] tracking-[-0.03em] desk:text-[40px]">Selesaikan pembayaran laporan.</h1>
        <p className="mt-[8px] text-[13px] text-muted">Laporan masuk antrean verifikasi setelah biaya posting dibayar.</p>
      </header>
      <div className="mt-[24px]">
        <Suspense fallback={<PageLoading />}>
          <Escrow {...props} />
        </Suspense>
      </div>
    </div>
  );
}
