import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatEventDate, type Report } from "@/lib/reports";

export function ProfileCard({ report }: { report: Report }) {
  const name = report.full_name ?? "Identitas belum diketahui";
  const age = report.age !== null ? `${report.age} th` : report.age_range;
  return (
    <Link
      href={`/kasus/${report.case_code}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-panel transition-colors hover:border-line-strong"
    >
      <div className="relative aspect-[289/265] overflow-hidden bg-ink-raised">
        {report.photo_url && (
          <Image
            src={report.photo_url}
            unoptimized={report.photo_url.startsWith("http")}
            alt={report.face_blur ? "" : `Foto ${name}`}
            fill
            sizes="(min-width: 1024px) 290px, 100vw"
            className={`object-cover ${report.face_blur ? "scale-110 blur-xl" : ""}`}
          />
        )}
        <div className="absolute left-[10px] top-[10px]">
          <StatusBadge kind={report.kind} floating />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-[14px]">
        <p className="text-[10px] tracking-[0.08em] text-slate">LAPORAN TERVERIFIKASI</p>
        <div className="mt-[4px] flex items-center justify-between gap-[8px]">
          <h3 className="truncate font-display text-[18px] text-fg">{name}</h3>
          {age && <span className="shrink-0 rounded-badge bg-ink px-[7px] py-[4px] text-[11px] font-bold">{age}</span>}
        </div>
        <div className="mt-[12px] flex gap-[8px] text-[12px]">
          <Image src="/figma/icon-location.svg" alt="" width={14} height={14} className="mt-[1px] size-[14px]" />
          <div>
            <p className="font-bold text-fg">{report.city}</p>
            <p className="text-muted">{report.address}</p>
          </div>
        </div>
        <div className="mt-[6px] flex items-center gap-[8px] text-[12px] text-muted">
          <Image src="/figma/icon-date.svg" alt="" width={14} height={14} className="size-[14px]" />
          {formatEventDate(report.event_at)}
        </div>
        <span className="flex-1" />
        <span className="mt-[12px] flex h-[38px] items-center justify-between rounded-field border border-line px-[10px] text-[12px] font-semibold text-fg group-hover:border-line-strong">
          Lihat Detail
          <Image src="/figma/icon-arrow.svg" alt="" width={14} height={14} className="size-[14px]" />
        </span>
      </div>
    </Link>
  );
}
