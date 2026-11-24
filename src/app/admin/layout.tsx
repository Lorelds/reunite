import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { isAdminEmail } from "@/config/env";
import { currentUser } from "@/lib/supabase/server";

async function AdminGate({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!isAdminEmail(user?.email)) notFound();
  return (
    <>
      {/* Figma 28:4317: the command center is desktop-only. */}
      <div className="grid min-h-screen place-items-center px-[20px] text-center desk:hidden">
        <div className="max-w-[320px]">
          <Logo />
          <p className="eyebrow mt-[24px] text-[10px]">Secure Workstation Policy</p>
          <h1 className="mt-[10px] font-display text-[26px]">Desktop Workstation Required</h1>
          <p className="mt-[8px] text-[13px] text-muted">Halaman Admin Command Center hanya dapat dibuka melalui layar minimal 1024px.</p>
          <Link href="/" className="btn btn-ghost mt-[18px]">Kembali ke Beranda</Link>
        </div>
      </div>
      <div className="hidden min-h-screen grid-cols-[230px_1fr] desk:grid">
        <aside className="flex flex-col border-r border-line bg-ink-raised p-[18px]">
          <div className="flex items-center gap-[8px]">
            <Logo />
            <span className="text-[10px] text-muted">ADMIN</span>
          </div>
          <nav className="mt-[28px] grid gap-[4px] text-[13px]">
            <Link href="/admin" className="rounded-[6px] bg-panel px-[10px] py-[8px]">1. Antrean Moderasi</Link>
            <Link href="/admin/anti-hoax" className="rounded-[6px] px-[10px] py-[8px] text-muted hover:text-fg">2. Anti Hoax &amp; Blacklist</Link>
          </nav>
          <Link href="/" className="mt-auto text-[12px] text-muted hover:text-fg">Keluar ke Web Publik</Link>
          <p className="mt-[14px] truncate text-[11px] text-faint">{user?.email}</p>
        </aside>
        <main className="p-[32px]">{children}</main>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={null}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
