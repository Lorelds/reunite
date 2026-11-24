import Link from "next/link";
import { FoundForm } from "../found-form";

export const metadata = { title: "Laporkan Orang Ditemukan — REUNITE" };

export default function FoundReportPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-[14px] pb-[60px] pt-[28px] desk:pt-[42px]">
      <Link href="/laporan/baru" className="text-[12px] text-muted hover:text-fg">← Kembali</Link>
      <header className="mb-[28px] mt-[20px] text-center">
        <p className="eyebrow text-[10px]">Form Penemuan Orang</p>
        <h1 className="mt-[10px] font-display text-[30px] tracking-[-0.03em] desk:text-[40px]">Laporkan Orang yang Ditemukan</h1>
        <p className="mt-[8px] text-[13px] text-muted">Lengkapi informasi secara akurat. Data akan diverifikasi sebelum dipublikasikan.</p>
      </header>
      <FoundForm />
    </div>
  );
}
