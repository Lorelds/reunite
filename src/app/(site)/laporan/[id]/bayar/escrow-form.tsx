"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { PRICING } from "@/config/pricing";
import { computeFees, formatRupiah } from "@/lib/fees";
import type { ReportKind } from "@/lib/reports";
import { startPayment } from "./actions";

type Props = {
  reportId: string;
  caseCode: string;
  name: string;
  kind: ReportKind;
  photoUrl: string | null;
  postFeePaid: boolean;
  initialBounty: number;
  allowBounty: boolean;
};

export function EscrowForm(p: Props) {
  const [bounty, setBounty] = useState(p.initialBounty);
  const [method, setMethod] = useState<"va" | "qris">("va");
  const [error, action, pending] = useActionState(startPayment, null);
  const fees = computeFees({ bountyIdr: bounty, postFeePaid: p.postFeePaid });
  const invalid = bounty !== 0 && (bounty < PRICING.BOUNTY_MIN_IDR || bounty > PRICING.BOUNTY_MAX_IDR);
  const nothingDue = fees.totalIdr === 0;

  return (
    <form action={action} className="grid gap-[16px] desk:grid-cols-[1fr_340px]">
      <input type="hidden" name="reportId" value={p.reportId} />
      <input type="hidden" name="bounty" value={bounty} />
      <input type="hidden" name="method" value={method} />

      <div className="rounded-card border border-line bg-panel p-[16px]">
        {p.allowBounty ? (
          <>
            <div className="rounded-[6px] border border-found/40 bg-found/10 p-[12px]">
              <p className="text-[12px] font-bold text-found">Dana dijamin payment gateway berizin</p>
              <p className="mt-[2px] text-[11px] text-muted">REUNITE tidak menyimpan dana. Bounty diteruskan ke penemu setelah kasus diverifikasi selesai.</p>
            </div>
            <label htmlFor="bounty-amount" className="eyebrow mt-[18px] block text-[10px]">Nominal imbalan</label>
            <div className="mt-[8px] flex items-center gap-[10px] rounded-[6px] border border-line bg-ink px-[14px] py-[12px]">
              <span className="text-[12px] text-muted">Rp</span>
              <input
                id="bounty-amount"
                inputMode="numeric"
                value={bounty ? bounty.toLocaleString("id-ID") : ""}
                placeholder="0"
                onChange={(e) => setBounty(Number(e.target.value.replace(/\D/g, "")) || 0)}
                className="w-full bg-transparent text-[26px] font-bold focus:outline-none"
              />
              <span className="text-[11px] text-muted">IDR</span>
            </div>
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {!p.postFeePaid && (
                <button type="button" onClick={() => setBounty(0)} aria-pressed={bounty === 0}
                  className={`rounded-[6px] border px-[10px] py-[7px] text-[11px] ${bounty === 0 ? "border-fg text-fg" : "border-line text-muted"}`}>
                  Tanpa bounty
                </button>
              )}
              {PRICING.BOUNTY_PRESETS_IDR.map((v) => (
                <button key={v} type="button" onClick={() => setBounty(v)} aria-pressed={bounty === v}
                  className={`rounded-[6px] border px-[10px] py-[7px] text-[11px] ${bounty === v ? "border-fg text-fg" : "border-line text-muted"}`}>
                  Rp {v >= 1_000_000 ? `${(v / 1_000_000).toLocaleString("id-ID")} jt` : v.toLocaleString("id-ID")}
                </button>
              ))}
            </div>
            {invalid && <p className="mt-[8px] text-[12px] text-wanted">Bounty antara {formatRupiah(PRICING.BOUNTY_MIN_IDR)} dan {formatRupiah(PRICING.BOUNTY_MAX_IDR)}.</p>}
          </>
        ) : (
          <p className="text-[13px] text-muted">Laporan penemuan hanya dikenai biaya posting. Bounty tersedia untuk laporan orang hilang.</p>
        )}

        <p className="eyebrow mt-[20px] text-[10px]">Metode pembayaran</p>
        <div className="mt-[8px] grid gap-[8px] sm:grid-cols-2" role="radiogroup">
          {([["va", "VA", "Virtual Account", "BCA, Mandiri, BNI"], ["qris", "QR", "QRIS", "Semua e-wallet"]] as const).map(([v, tag, title, sub]) => (
            <button key={v} type="button" role="radio" aria-checked={method === v} onClick={() => setMethod(v)}
              className={`flex items-center gap-[10px] rounded-[6px] border p-[12px] text-left ${method === v ? "border-muted" : "border-line"}`}>
              <span className="grid size-[30px] place-items-center rounded-[4px] bg-ink text-[10px] text-muted">{tag}</span>
              <span>
                <span className="block text-[12px] font-bold">{title}</span>
                <span className="block text-[11px] text-muted">{sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-card border border-line bg-panel p-[16px]">
        <p className="eyebrow text-[10px]">Ringkasan transaksi</p>
        <p className="mt-[10px] font-display text-[18px]">{bounty ? `Bounty untuk ${p.name}` : `Laporan ${p.name}`}</p>
        <div className="mt-[12px] flex items-center gap-[10px] rounded-[6px] border border-line p-[8px]">
          <span className="relative size-[52px] overflow-hidden rounded-[4px] bg-ink-raised">
            {p.photoUrl && <Image src={p.photoUrl} alt="" fill sizes="52px" className="object-cover" unoptimized={p.photoUrl.startsWith("http")} />}
          </span>
          <span>
            <StatusBadge kind={p.kind} />
            <span className="mt-[4px] block text-[11px] font-bold">Kasus #{p.caseCode}</span>
          </span>
        </div>
        <dl className="mt-[14px] grid grid-cols-[1fr_auto] gap-y-[10px] border-t border-line pt-[14px] text-[12px]">
          <dt className="text-muted">Nominal bounty</dt>
          <dd className="text-right">{formatRupiah(fees.bountyIdr)}</dd>
          <dt className="text-muted">Komisi platform ({PRICING.COMMISSION_RATE * 100}%)</dt>
          <dd className="text-right">{formatRupiah(fees.commissionIdr)}</dd>
          <dt className="text-muted">Biaya posting laporan</dt>
          <dd className="text-right">{p.postFeePaid ? <span className="text-found">Lunas</span> : formatRupiah(fees.postFeeIdr)}</dd>
          <dt className="border-t border-line pt-[10px] font-bold">Total pembayaran</dt>
          <dd className="border-t border-line pt-[10px] text-right text-[15px] font-bold">{formatRupiah(fees.totalIdr)}</dd>
        </dl>
        <button type="submit" disabled={pending || invalid || nothingDue} className="btn btn-primary mt-[16px] w-full">
          {pending ? "Memproses…" : bounty ? "Bayar & Aktifkan Bounty" : "Bayar Biaya Posting"}
        </button>
        {error && <p role="alert" className="mt-[10px] text-[12px] text-wanted">{error}</p>}
        <p className="mt-[10px] text-[11px] text-faint">
          Bounty dikembalikan jika laporan ditolak moderator. Biaya posting dan komisi tidak dikembalikan setelah laporan dipublikasikan.
        </p>
      </aside>
    </form>
  );
}
