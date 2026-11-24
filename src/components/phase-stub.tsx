import Link from "next/link";

export function PhaseStub({ eyebrow, title, figma, note }: { eyebrow: string; title: string; figma: string; note: string }) {
  return (
    <div className="mx-auto max-w-[640px] px-[14px] py-[80px] text-center">
      <p className="eyebrow text-[10px]">{eyebrow}</p>
      <h1 className="mt-[10px] font-display text-[30px] tracking-[-0.02em]">{title}</h1>
      <p className="mt-[10px] text-[13px] text-muted">{note}</p>
      <p className="mt-[16px] inline-block rounded-badge border border-line px-[10px] py-[4px] text-[11px] text-faint">
        Belum tersedia · fase berikutnya · Figma {figma}
      </p>
      <div className="mt-[20px]">
        <Link href="/" className="btn btn-ghost">Kembali ke direktori</Link>
      </div>
    </div>
  );
}
