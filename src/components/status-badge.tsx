import type { ReportKind } from "@/lib/reports";

export function StatusBadge({ kind, floating = false }: { kind: ReportKind; floating?: boolean }) {
  const wanted = kind === "missing";
  return (
    <span
      className={`inline-flex h-[24px] items-center gap-[6px] rounded-badge border px-[8px] text-[10px] font-bold tracking-[0.08em] ${
        wanted ? "border-wanted text-wanted" : "border-found text-found"
      } ${floating ? "bg-ink/90 shadow-[0_3px_12px_rgba(15,23,42,0.13)]" : ""}`}
    >
      <span className={`size-[5px] rounded-[2px] ${wanted ? "bg-wanted" : "bg-found"}`} />
      {wanted ? "DICARI" : "DITEMUKAN"}
    </span>
  );
}
