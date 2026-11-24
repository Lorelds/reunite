import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

export const metadata = { title: "Buat Laporan — REUNITE" };

const OPTIONS = [
  {
    kind: "missing" as const,
    href: "/laporan/baru/hilang",
    photo: "/figma/budi.png",
    eyebrow: "Laporan Keluarga / Kerabat",
    title: "Laporkan Orang Hilang",
    body: "Buat laporan pencarian untuk anggota keluarga atau kerabat yang tidak diketahui keberadaannya.",
    points: ["Unggah foto terbaru dan ciri fisik", "Tandai lokasi terakhir terlihat", "Opsional: aktifkan bounty escrow"],
    cta: "Laporkan Orang Hilang",
    primary: true,
  },
  {
    kind: "found" as const,
    href: "/laporan/baru/ditemukan",
    photo: "/figma/rizky.png",
    eyebrow: "Laporan Penemu / Masyarakat",
    title: "Laporkan Menemukan Seseorang",
    body: "Laporkan seseorang yang ditemukan tersesat, tanpa identitas, atau sedang mencari keluarganya.",
    points: ["Ambil foto dengan privacy blur", "Bagikan lokasi ditemukan", "Informasikan kondisi dan lokasi aman"],
    cta: "Saya Menemukan Seseorang",
    primary: false,
  },
];

export default function ChooseReportPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-[14px] pb-[60px] pt-[36px] desk:pt-[52px]">
      <header className="text-center">
        <p className="eyebrow text-[10px]">Buat Laporan Baru</p>
        <h1 className="mt-[10px] font-display text-[30px] tracking-[-0.03em] desk:text-[40px]">Apa yang ingin Anda laporkan?</h1>
        <p className="mt-[8px] text-[13px] text-muted">Pilih jenis laporan yang sesuai. Tim REUNITE akan memverifikasi informasi sebelum ditampilkan ke publik.</p>
      </header>
      <div className="mt-[30px] grid gap-[14px] sm:grid-cols-2">
        {OPTIONS.map((o, i) => (
          <article key={o.kind} className="flex flex-col overflow-hidden rounded-card border border-line bg-panel">
            <div className="relative aspect-[350/180] bg-ink-raised">
              <Image src={o.photo} alt="" fill sizes="(min-width: 640px) 480px, 100vw" className="object-cover object-[center_30%]" />
              <div className="absolute left-[10px] top-[10px]"><StatusBadge kind={o.kind} floating /></div>
              <span className="absolute bottom-[10px] right-[14px] font-display text-[22px] text-fg/80">0{i + 1}</span>
            </div>
            <div className="flex flex-1 flex-col p-[16px]">
              <p className={`text-[10px] font-bold tracking-[0.08em] ${o.kind === "missing" ? "text-wanted" : "text-found"}`}>{o.eyebrow.toUpperCase()}</p>
              <h2 className="mt-[10px] font-display text-[20px]">{o.title}</h2>
              <p className="mt-[6px] text-[12px] text-muted">{o.body}</p>
              <ul className="mt-[16px] grid gap-[6px] border-t border-line pt-[14px] text-[12px] text-muted">
                {o.points.map((p) => <li key={p}><span className="text-found">✓</span> {p}</li>)}
              </ul>
              <Link href={o.href} className={`btn mt-[16px] ${o.primary ? "btn-primary" : "btn-ghost text-fg"}`}>{o.cta} →</Link>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-[14px] rounded-card border border-line p-[14px] text-[12px] text-muted">
        <strong className="text-fg">Privasi &amp; keamanan terjaga.</strong> Identitas pelapor dan data sensitif disimpan privat serta tidak ditampilkan kepada publik.
      </p>
    </div>
  );
}
