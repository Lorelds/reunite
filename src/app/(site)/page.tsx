import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { ProfileCard } from "@/components/profile-card";
import { DIRECTORY_FILTERS, directoryStats, listDirectory, type DirectoryFilters } from "@/lib/reports";

function withParam(filters: DirectoryFilters, key: keyof DirectoryFilters, value: string) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...filters, [key]: value })) {
    if (v !== undefined && v !== "" && v !== "semua" && !(k === "urut" && v === "terbaru")) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default function DirectoryPage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Directory searchParams={searchParams} />
    </Suspense>
  );
}

async function Directory({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const filters = DIRECTORY_FILTERS.parse(await searchParams);
  const [reports, stats] = await Promise.all([listDirectory(filters), directoryStats()]);

  const statusOptions = [
    { value: "semua", label: "Semua laporan", count: stats.total },
    { value: "dicari", label: "Dicari / Hilang", count: stats.missing },
    { value: "ditemukan", label: "Ditemukan", count: stats.found },
  ] as const;

  return (
    <div className="mx-auto max-w-[1200px] px-[14px] pb-[60px] pt-[32px] desk:px-[34px] desk:pt-[42px]">
      <header className="flex flex-col gap-[16px] border-b border-line pb-[28px] desk:flex-row desk:items-end desk:justify-between">
        <div>
          <p className="eyebrow">Direktori Publik Nasional</p>
          <h1 className="mt-[8px] font-display text-[32px] leading-[1.1] tracking-[-0.04em] desk:text-[44px]">
            Cari dan Laporkan Orang Hilang
          </h1>
          <p className="mt-[10px] text-[13px] text-muted">
            Telusuri laporan terverifikasi dan bantu mereka kembali kepada keluarga.
          </p>
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="font-display text-[44px] font-bold leading-none">{stats.total}</span>
          <span className="eyebrow max-w-[110px] leading-[1.4]">Laporan aktif di {stats.cities.length} kota</span>
        </div>
      </header>

      <form method="get" className="mt-[18px]">
        <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line desk:grid-cols-[1.75fr_1fr_1fr_1fr_auto]">
          <label className="flex min-h-[46px] items-center gap-[8px] bg-panel px-[12px]">
            <Image src="/figma/icon-search.svg" alt="" width={13} height={14} />
            <span className="sr-only">Cari nama atau ciri khusus</span>
            <input name="q" defaultValue={filters.q} placeholder="Nama atau ciri khusus..." className="w-full bg-transparent text-[13px] placeholder:text-faint focus:outline-none" />
          </label>
          <label className="flex min-h-[46px] items-center gap-[8px] bg-panel px-[12px]">
            <Image src="/figma/icon-pin.svg" alt="" width={13} height={14} />
            <span className="sr-only">Kota</span>
            <select name="kota" defaultValue={filters.kota ?? ""} className="w-full bg-transparent text-[13px] text-muted focus:outline-none">
              <option value="">Semua lokasi</option>
              {stats.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex min-h-[46px] items-center gap-[8px] bg-panel px-[12px]">
            <Image src="/figma/icon-calendar.svg" alt="" width={13} height={14} />
            <span className="sr-only">Waktu kejadian</span>
            <select name="waktu" defaultValue={filters.waktu} className="w-full bg-transparent text-[13px] text-muted focus:outline-none">
              <option value="semua">Semua waktu</option>
              <option value="7">7 hari terakhir</option>
              <option value="30">30 hari terakhir</option>
              <option value="90">90 hari terakhir</option>
            </select>
          </label>
          <label className="flex min-h-[46px] items-center bg-panel px-[12px]">
            <span className="sr-only">Status</span>
            <select name="status" defaultValue={filters.status} className="w-full bg-transparent text-[13px] text-muted focus:outline-none">
              <option value="semua">Status: Semua</option>
              <option value="dicari">Status: Dicari</option>
              <option value="ditemukan">Status: Ditemukan</option>
            </select>
          </label>
          <button type="submit" className="min-h-[46px] bg-fg px-[18px] text-[13px] font-semibold text-ink">
            Cari
          </button>
        </div>

        <div className="mt-[24px] grid gap-[24px] desk:grid-cols-[230px_1fr]">
          <aside className="h-fit rounded-card border border-line bg-panel p-[18px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-[8px] text-[13px] font-bold">
                <Image src="/figma/icon-filter.svg" alt="" width={15} height={15} />
                Filter Laporan
              </span>
              <Link href="/" className="text-[11px] text-muted underline">Atur ulang</Link>
            </div>

            <fieldset className="mt-[16px] border-b border-line pb-[16px]">
              <legend className="eyebrow mb-[10px] text-[10px]">Status</legend>
              {statusOptions.map((o) => (
                <Link
                  key={o.value}
                  href={withParam(filters, "status", o.value)}
                  aria-current={filters.status === o.value ? "true" : undefined}
                  className="flex items-center justify-between py-[5px] text-[12px] text-fg"
                >
                  <span>{filters.status === o.value ? "●" : "○"} {o.label}</span>
                  <span className="text-slate">{o.count}</span>
                </Link>
              ))}
            </fieldset>

            <fieldset className="mt-[16px] border-b border-line pb-[16px]">
              <legend className="eyebrow mb-[10px] text-[10px]">Rentang Usia</legend>
              <div className="flex items-center gap-[6px]">
                <input name="umin" type="number" min={0} max={120} defaultValue={filters.umin} placeholder="Min. usia" aria-label="Usia minimum" className="field h-[38px] text-[12px]" />
                <span className="text-slate">—</span>
                <input name="umax" type="number" min={0} max={120} defaultValue={filters.umax} placeholder="Maks. usia" aria-label="Usia maksimum" className="field h-[38px] text-[12px]" />
              </div>
            </fieldset>

            <fieldset className="mt-[16px]">
              <legend className="eyebrow mb-[10px] text-[10px]">Lokasi</legend>
              <input name="area" defaultValue={filters.area} placeholder="Nama jalan / area" aria-label="Nama jalan atau area" className="field h-[38px] text-[12px]" />
            </fieldset>

            <label className="mt-[16px] block">
              <span className="eyebrow mb-[10px] block text-[10px]">Urutkan</span>
              <select name="urut" defaultValue={filters.urut} className="field h-[38px] text-[12px]">
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
            </label>

            <button type="submit" className="btn btn-ghost mt-[16px] w-full">Terapkan filter</button>
          </aside>

          <section aria-label="Hasil pencarian">
            <p className="text-[12px] text-muted">
              Menampilkan <strong className="text-fg">{reports.length} dari {stats.total} laporan</strong>
            </p>
            {reports.length === 0 ? (
              <div className="mt-[14px] rounded-card border border-dashed border-line p-[40px] text-center">
                <p className="font-display text-[20px]">Tidak ada laporan yang cocok.</p>
                <p className="mt-[6px] text-[13px] text-muted">Coba ubah kata kunci atau atur ulang filter.</p>
                <Link href="/" className="btn btn-ghost mt-[16px]">Atur ulang filter</Link>
              </div>
            ) : (
              <div className="mt-[14px] grid gap-[14px] sm:grid-cols-2 desk:grid-cols-3">
                {reports.map((r) => (
                  <ProfileCard key={r.id} report={r} />
                ))}
              </div>
            )}
          </section>
        </div>
      </form>
    </div>
  );
}
