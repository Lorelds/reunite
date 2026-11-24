import { notFound } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
import { PageLoading } from "@/components/page-loading";
import { formatRupiah } from "@/lib/fees";
import { currentUser, supabaseService } from "@/lib/supabase/server";
import { simulate } from "./actions";

export const metadata = { title: "Checkout (simulasi) — REUNITE" };

async function Checkout({ params, searchParams }: PageProps<"/bayar/[paymentId]">) {
  const { paymentId } = await params;
  const metode = (await searchParams).metode === "qris" ? "QRIS" : "Virtual Account";
  const user = await currentUser();
  if (!user || !z.string().uuid().safeParse(paymentId).success) notFound();
  const { data: p } = await supabaseService()
    .from("payments")
    .select("id, status, bounty_idr, commission_idr, post_fee_idr, total_idr, reports(case_code)")
    .eq("id", paymentId)
    .eq("payer_id", user.id)
    .maybeSingle();
  if (!p) notFound();
  const caseCode = (p.reports as unknown as { case_code: string } | null)?.case_code;

  return (
    <div className="rounded-card border border-line bg-panel p-[20px]">
      <p className="rounded-[6px] border border-amber-600/50 bg-amber-950/25 px-[12px] py-[8px] text-[12px] text-amber-300">
        Mode uji — tidak ada uang yang berpindah. Halaman ini menggantikan checkout payment gateway sampai kunci sandbox Midtrans dipasang.
      </p>
      <dl className="mt-[16px] grid grid-cols-[1fr_auto] gap-y-[8px] text-[13px]">
        <dt className="text-muted">Kasus</dt><dd className="text-right">#{caseCode}</dd>
        <dt className="text-muted">Metode</dt><dd className="text-right">{metode}</dd>
        {p.bounty_idr > 0 && (<><dt className="text-muted">Bounty</dt><dd className="text-right">{formatRupiah(p.bounty_idr)}</dd>
        <dt className="text-muted">Komisi platform</dt><dd className="text-right">{formatRupiah(p.commission_idr)}</dd></>)}
        {p.post_fee_idr > 0 && (<><dt className="text-muted">Biaya posting</dt><dd className="text-right">{formatRupiah(p.post_fee_idr)}</dd></>)}
        <dt className="border-t border-line pt-[8px] font-bold">Total</dt><dd className="border-t border-line pt-[8px] text-right font-bold">{formatRupiah(p.total_idr)}</dd>
      </dl>
      {p.status === "pending" ? (
        <div className="mt-[18px] grid gap-[10px] sm:grid-cols-2">
          <form action={simulate.bind(null, p.id, "paid")}><button className="btn btn-primary w-full">Simulasikan pembayaran berhasil</button></form>
          <form action={simulate.bind(null, p.id, "failed")}><button className="btn btn-ghost w-full">Simulasikan gagal</button></form>
        </div>
      ) : (
        <p className="mt-[18px] text-[13px]">Status pembayaran: <strong>{p.status === "paid" ? "Berhasil" : p.status}</strong></p>
      )}
    </div>
  );
}

export default function CheckoutPage(props: PageProps<"/bayar/[paymentId]">) {
  return (
    <div className="mx-auto max-w-[560px] px-[14px] pb-[60px] pt-[40px]">
      <p className="eyebrow text-[10px]">Payment Gateway · Simulator</p>
      <h1 className="mt-[10px] font-display text-[28px] tracking-[-0.02em]">Checkout</h1>
      <div className="mt-[20px]">
        <Suspense fallback={<PageLoading />}><Checkout {...props} /></Suspense>
      </div>
    </div>
  );
}
