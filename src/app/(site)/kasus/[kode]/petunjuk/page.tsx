import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { StatusBadge } from "@/components/status-badge";
import { formatEventDate, getPublicReport } from "@/lib/reports";
import { SightingForm } from "./sighting-form";

export const metadata = { title: "Bagikan Petunjuk — REUNITE" };

async function Content({ params }: PageProps<"/kasus/[kode]/petunjuk">) {
  const report = await getPublicReport((await params).kode);
  if (!report || report.status !== "published") notFound();
  const name = report.full_name ?? "orang ini";
  return (
    <>
      <Link href={`/kasus/${report.case_code}`} className="text-[12px] text-muted hover:text-fg">← Kembali ke detail profil</Link>
      <header className="mt-[20px] border-b border-line pb-[24px]">
        <p className="eyebrow text-[10px]">Bagikan Petunjuk</p>
        <h1 className="mt-[10px] font-display text-[28px] tracking-[-0.02em] desk:text-[36px]">Informasi Anda dapat membawa {name.split(" ")[0]} pulang.</h1>
        <p className="mt-[8px] text-[13px] text-muted">Setiap petunjuk diteruskan langsung ke pelapor secara privat.</p>
      </header>
      <div className="mt-[24px] grid gap-[20px] desk:grid-cols-[300px_1fr]">
        <aside className="h-fit rounded-card border border-line bg-panel p-[14px]">
          <div className="relative aspect-square overflow-hidden rounded-[6px] bg-ink-raised">
            {report.photo_url && <Image src={report.photo_url} alt="" fill sizes="300px" className={`object-cover ${report.face_blur ? "blur-xl" : ""}`} unoptimized={report.photo_url.startsWith("http")} />}
          </div>
          <div className="mt-[12px]"><StatusBadge kind={report.kind} /></div>
          <p className="mt-[8px] font-display text-[18px]">{report.full_name ?? "Identitas belum diketahui"}</p>
          <p className="text-[12px] text-muted">{report.age !== null ? `${report.age} tahun · ` : ""}{report.gender}</p>
          <p className="mt-[10px] text-[11px] tracking-[0.08em] text-muted">LOKASI TERAKHIR</p>
          <p className="text-[12px]">{report.city} · {report.address}</p>
          <p className="mt-[8px] text-[11px] tracking-[0.08em] text-muted">WAKTU KEJADIAN</p>
          <p className="text-[12px]">{formatEventDate(report.event_at)}</p>
        </aside>
        <SightingForm reportId={report.id} caseCode={report.case_code} />
      </div>
    </>
  );
}

export default function SightingPage(props: PageProps<"/kasus/[kode]/petunjuk">) {
  return (
    <div className="mx-auto max-w-[1100px] px-[14px] pb-[60px] pt-[28px] desk:px-[34px] desk:pt-[42px]">
      <Suspense fallback={<PageLoading />}><Content {...props} /></Suspense>
    </div>
  );
}
