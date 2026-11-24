import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { formatEventDate } from "@/lib/reports";
import { currentUser, supabaseService } from "@/lib/supabase/server";

export const metadata = { title: "Kotak Masuk — REUNITE" };

type Sighting = {
  id: string;
  sender_name: string | null;
  location: string;
  seen_at: string | null;
  message: string;
  contact: string | null;
  created_at: string;
  reports: { case_code: string; full_name: string | null };
};

async function Inbox({ searchParams }: PageProps<"/kotak-masuk">) {
  const selected = (await searchParams).id;
  const user = await currentUser();
  const { data } = await supabaseService()
    .from("sightings")
    .select("id, sender_name, location, seen_at, message, contact, created_at, reports!inner(case_code, full_name, reporter_id)")
    .eq("reports.reporter_id", user!.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Sighting[];
  const open = rows.find((r) => r.id === selected) ?? rows[0];

  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line p-[40px] text-center">
        <p className="font-display text-[20px]">Belum ada petunjuk masuk.</p>
        <p className="mt-[6px] text-[13px] text-muted">Petunjuk dari masyarakat untuk laporan Anda akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-card border border-line desk:grid-cols-[320px_1fr]">
      <ul className="max-h-[560px] overflow-y-auto border-b border-line bg-panel desk:border-b-0 desk:border-r">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/kotak-masuk?id=${r.id}`} aria-current={r.id === open.id ? "true" : undefined}
              className={`block border-b border-line px-[14px] py-[12px] ${r.id === open.id ? "bg-ink-raised" : "hover:bg-ink-raised"}`}>
              <span className="flex justify-between text-[12px] font-bold">
                {r.sender_name ?? "Anonim"}
                <span className="font-normal text-faint">{formatEventDate(r.created_at)}</span>
              </span>
              <span className="mt-[2px] block truncate text-[12px] text-muted">
                #{r.reports.case_code} · {r.message}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <article className="p-[20px]">
        <p className="eyebrow text-[10px]">Petunjuk untuk #{open.reports.case_code} · {open.reports.full_name ?? "Identitas belum diketahui"}</p>
        <h2 className="mt-[10px] font-display text-[22px]">{open.location}</h2>
        {open.seen_at && <p className="text-[12px] text-muted">Dilihat {formatEventDate(open.seen_at)}</p>}
        <p className="mt-[16px] whitespace-pre-line text-[14px] leading-[1.6]">{open.message}</p>
        <div className="mt-[20px] rounded-card border border-line bg-panel p-[14px] text-[12px]">
          <p className="text-muted">Pengirim: <span className="text-fg">{open.sender_name ?? "Anonim"}</span></p>
          <p className="mt-[4px] text-muted">Kontak: <span className="text-fg">{open.contact ?? "tidak dicantumkan"}</span></p>
        </div>
        <p className="mt-[14px] text-[11px] text-faint">Verifikasi petunjuk sebelum bertindak. Jika menyangkut keselamatan, hubungi polisi (110).</p>
      </article>
    </div>
  );
}

export default function InboxPage(props: PageProps<"/kotak-masuk">) {
  return (
    <div className="mx-auto max-w-[1100px] px-[14px] pb-[60px] pt-[32px] desk:px-[34px] desk:pt-[48px]">
      <header className="mb-[24px] border-b border-line pb-[24px]">
        <p className="eyebrow text-[10px]">Encrypted Sighting Inbox</p>
        <h1 className="mt-[10px] font-display text-[30px] tracking-[-0.03em] desk:text-[40px]">Kotak Masuk Petunjuk</h1>
        <p className="mt-[8px] text-[13px] text-muted">Petunjuk dari masyarakat untuk laporan yang Anda buat.</p>
      </header>
      <Suspense fallback={<PageLoading />}><Inbox {...props} /></Suspense>
    </div>
  );
}
