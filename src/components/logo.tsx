import Link from "next/link";

export function Logo({ muted = false }: { muted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-[9px]" aria-label="REUNITE beranda">
      <span className="grid size-[30px] place-items-center rounded-full bg-fg font-display text-[12px] text-ink">
        R
      </span>
      <span
        className={`font-display text-[12px] font-bold tracking-[0.14em] ${muted ? "text-muted" : "text-fg"}`}
      >
        REUNITE
      </span>
    </Link>
  );
}
