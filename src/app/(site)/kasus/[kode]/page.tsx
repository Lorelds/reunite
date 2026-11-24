import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { BlurredPhoto } from "@/components/blurred-photo";
import { LocationMap } from "@/components/location-map";
import { ShareCase } from "@/components/share-case";
import { StatusBadge } from "@/components/status-badge";
import { formatRupiah } from "@/lib/fees";
import { formatEventDate, formatLongDate, getActiveBounty, getPublicReport, type Report } from "@/lib/reports";
import { HoaxReport } from "./hoax-report";

function Facts({ items }: { items: [string, string | null][] }) {
  const shown = items.filter((i): i is [string, string] => Boolean(i[1]));
  return (
    <dl className="grid sm:grid-cols-2">
      {shown.map(([k, v], i) => (
        <div key={k} className={`border-t border-line p-[14px] ${i % 2 === 1 ? "sm:border-l" : ""}`}>
          <dt className="text-[11px] text-muted">{k}</dt>
          <dd className="mt-[4px] text-[13px] font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export async function generateMetadata({ params }: PageProps<"/kasus/[kode]">) {
  const report = await getPublicReport((await params).kode);
  return { title: report ? `${report.full_name ?? "Orang ditemukan"} · ${report.case_code} — REUNITE` : "Kasus tidak ditemukan" };
}

export default function CasePage({ params }: PageProps<"/kasus/[kode]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Case params={params} />
    </Suspense>
  );
}

async function Case({ params }: { params: PageProps<"/kasus/[kode]">["params"] }) {
  const report = await getPublicReport((await params).kode);
  if (!report) notFound();
  return report.kind === "missing" ? <MissingCase report={report} /> : <FoundCase report={report} />;
}

async function MissingCase({ report }: { report: Report }) {
  const bounty = await getActiveBounty(report.id);
  const name = report.full_name ?? "Tanpa nama";
  return (
    <div className="mx-auto max-w-[1200px] px-[14px] pb-[60px] pt-[28px] desk:px-[34px] desk:pt-[42px]">
      <Link href="/" className="text-[12px] text-muted hover:text-fg">← Kembali ke katalog</Link>
      <div className="mt-[24px] grid gap-[32px] desk:grid-cols-[490px_1fr] desk:gap-[42px]">
        <div className="grid h-fit gap-[16px]">
          <div className="relative aspect-[490/402] overflow-hidden rounded-card bg-ink-raised">
            {report.photo_url && <Image src={report.photo_url} unoptimized={report.photo_url.startsWith("http")} alt={`Foto ${name}`} fill priority sizes="(min-width: 1024px) 490px, 100vw" className="object-cover" />}
          </div>
          <LocationMap label="Lokasi terakhir" address={report.address} city={report.city} />
        </div>

        <div>
          <div className="flex items-center gap-[10px]">
            <StatusBadge kind="missing" />
            <span className="text-[11px] tracking-[0.12em] text-muted">KASUS #{report.case_code}</span>
          </div>
          <h1 className="mt-[18px] font-display text-[36px] leading-[1.1] tracking-[-0.03em] desk:text-[44px]">{name}</h1>
          <p className="mt-[8px] text-[13px] text-muted">
            {report.age !== null ? `${report.age} tahun · ` : ""}Terakhir terlihat {formatLongDate(report.event_at)}
          </p>

          {bounty && (
            <div className="mt-[18px] flex items-center justify-between rounded-card border border-amber-600/60 bg-amber-950/25 px-[16px] py-[14px]">
              <div>
                <p className="text-[11px] font-bold tracking-[0.08em] text-amber-400">BOUNTY TERVERIFIKASI</p>
                <p className="mt-[2px] text-[11px] text-muted">Dana dipegang payment gateway berizin hingga kasus selesai</p>
              </div>
              <p className="text-[17px] font-bold">{formatRupiah(bounty.amount_idr)}</p>
            </div>
          )}

          <section className="mt-[18px] overflow-hidden rounded-card border border-line bg-panel">
            <h2 className="eyebrow p-[14px] text-[10px]">Identitas & Ciri Fisik</h2>
            <Facts
              items={[
                ["Jenis kelamin", report.gender],
                ["Tinggi / berat", report.height_weight],
                ["Warna rambut", report.hair],
                ["Pakaian terakhir", report.clothing],
                ["Ciri khusus", report.features],
                ["Lokasi terakhir", report.address],
              ]}
            />
          </section>

          {report.chronology && (
            <section className="mt-[18px] rounded-card border-l-[3px] border-line-strong bg-panel p-[18px]">
              <h2 className="eyebrow text-[10px]">Kronologi Kejadian</h2>
              <p className="mt-[10px] whitespace-pre-line text-[13px] leading-[1.6] text-muted">{report.chronology}</p>
            </section>
          )}

          <section className="mt-[18px] rounded-card border border-line p-[16px]">
            <h2 className="eyebrow text-[10px]">Linimasa</h2>
            <ol className="mt-[10px] divide-y divide-line text-[12px]">
              {report.published_at && (
                <li className="flex gap-[16px] py-[10px]">
                  <span className="w-[150px] shrink-0 whitespace-nowrap text-muted">{formatEventDate(report.published_at)}</span>
                  <span className="font-semibold">Laporan diverifikasi dan dipublikasikan</span>
                </li>
              )}
              <li className="flex gap-[16px] py-[10px]">
                <span className="w-[150px] shrink-0 whitespace-nowrap text-muted">{formatEventDate(report.event_at)}</span>
                <span className="font-semibold">Terakhir terlihat di {report.city}</span>
              </li>
            </ol>
          </section>

          <section className="mt-[18px] flex items-center gap-[12px] rounded-card border border-line bg-panel p-[14px]">
            <span className="grid size-[38px] place-items-center rounded-full bg-fg text-[12px] font-bold text-ink">
              {report.reporter_name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-[0.08em] text-found">PELAPOR TERVERIFIKASI</p>
              <p className="text-[13px] font-bold">{report.reporter_name}</p>
              {report.reporter_relation && <p className="text-[11px] text-muted">{report.reporter_relation}</p>}
            </div>
          </section>

          <div className="mt-[18px] grid gap-[10px] sm:grid-cols-[1fr_auto]">
            <Link href={`/kasus/${report.case_code}/petunjuk`} className="btn btn-primary">
              Kirim Informasi Penampakan →
            </Link>
            <ShareCase text={`Bantu temukan ${name} (REUNITE kasus #${report.case_code}), terakhir terlihat di ${report.city}.`} />
          </div>
          <div className="mt-[20px]">
            <HoaxReport reportId={report.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FoundCase({ report }: { report: Report }) {
  const unknown = !report.full_name;
  return (
    <div className="mx-auto max-w-[1200px] px-[14px] pb-[60px] pt-[28px] desk:px-[48px] desk:pt-[52px]">
      <header className="border-b border-line pb-[28px]">
        <p className="eyebrow">Kasus Ditemukan{unknown ? " · Identitas Belum Diketahui" : ""}</p>
        <h1 className="mt-[14px] font-display text-[32px] leading-[1.1] tracking-[-0.03em] desk:text-[40px]">
          Bantu hubungkan kembali dengan keluarganya.
        </h1>
        {report.condition && <p className="mt-[10px] text-[13px] text-muted">Ditemukan dalam kondisi: {report.condition.toLowerCase()}.</p>}
      </header>

      <div className="mt-[32px] grid gap-[32px] desk:grid-cols-[470px_1fr] desk:gap-[48px]">
        <div>
          {report.photo_url &&
            (report.face_blur ? (
              <BlurredPhoto src={report.photo_url} alt={`Foto orang ditemukan, kasus ${report.case_code}`} />
            ) : (
              <div className="relative aspect-[490/600] overflow-hidden rounded-card bg-ink-raised">
                <Image src={report.photo_url} unoptimized={report.photo_url.startsWith("http")} alt={`Foto ${report.full_name}`} fill priority sizes="(min-width: 1024px) 470px, 100vw" className="object-cover" />
              </div>
            ))}
        </div>

        <div>
          <StatusBadge kind="found" />
          <h2 className="mt-[16px] font-display text-[30px] tracking-[-0.02em]">{report.full_name ?? "Identitas belum diketahui"}</h2>
          <p className="mt-[6px] text-[13px] text-muted">
            {unknown ? `Perkiraan ${report.gender?.toLowerCase() ?? ""}, ${report.age_range ?? "usia tidak diketahui"}` : `${report.age ?? report.age_range} tahun`}
          </p>

          <section className="mt-[18px] overflow-hidden rounded-card border border-line bg-panel [&>dl>div:nth-child(-n+2)]:border-t-0">
            <Facts
              items={[
                ["Ditemukan", formatEventDate(report.event_at)],
                ["Lokasi", report.address],
                ["Kondisi fisik", report.condition],
                ["Pakaian", report.clothing],
              ]}
            />
          </section>

          {report.shelter_name && (
            <section className="mt-[16px] rounded-card border border-line bg-panel p-[16px]">
              <p className="text-[10px] font-bold tracking-[0.08em] text-found">LOKASI PENAMPUNGAN SAAT INI</p>
              <p className="mt-[8px] font-display text-[16px]">{report.shelter_name}</p>
              {report.shelter_address && <p className="mt-[2px] text-[11px] text-muted">{report.shelter_address}</p>}
            </section>
          )}

          <div className="mt-[16px]">
            <LocationMap label="Lokasi ditemukan" address={report.address} city={report.city} />
          </div>

          <Link href={`/kasus/${report.case_code}/petunjuk`} className="btn btn-primary mt-[16px] w-full">
            Klaim Sebagai Keluarga / Kerabat →
          </Link>
          <div className="mt-[10px]">
            <ShareCase text={`Kenal orang ini? Ditemukan di ${report.city} (REUNITE kasus #${report.case_code}).`} />
          </div>
          <div className="mt-[20px]">
            <HoaxReport reportId={report.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
