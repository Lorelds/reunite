import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { Logo } from "@/components/logo";
import { MobileMenu, NavLinks } from "@/components/site-nav";
import { NAV } from "@/config/nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-[62px] max-w-[1200px] items-center justify-between px-[14px] desk:h-[72px] desk:px-[28px]">
        <Logo />
        <nav className="hidden items-center gap-[24px] desk:flex" aria-label="Utama">
          <Suspense
            fallback={NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-[13px] text-muted">
                {item.label}
              </Link>
            ))}
          >
            <NavLinks />
          </Suspense>
          <div className="ml-[22px]">
            <Suspense
              fallback={
                <Link href="/masuk" className="btn btn-ghost min-h-[40px] px-[14px]">
                  Login
                </Link>
              }
            >
              <AuthButton />
            </Suspense>
          </div>
          <Link href="/laporan/baru" className="btn btn-primary min-h-[40px] px-[15px]">
            + Buat Laporan
          </Link>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
