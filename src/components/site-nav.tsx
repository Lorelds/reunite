"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/config/nav";


export function NavLinks() {
  const pathname = usePathname();
  return NAV.map((item) => {
    const active = item.href === "/" ? pathname === "/" || pathname.startsWith("/kasus") : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`text-[13px] ${active ? "text-fg" : "text-muted hover:text-fg"}`}
      >
        {item.label}
      </Link>
    );
  });
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="grid size-[38px] place-items-center rounded-[6px] border border-line desk:hidden"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <Image src="/figma/icon-menu.svg" alt="" width={18} height={18} />
      </button>
      {open && (
        <nav id="mobile-nav" className="absolute inset-x-0 top-full border-b border-line bg-ink px-[14px] pb-[16px] desk:hidden" aria-label="Utama (seluler)">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block border-b border-line py-[14px] text-[14px] text-muted">
              {item.label}
            </Link>
          ))}
          <div className="mt-[14px] grid grid-cols-2 gap-[10px]">
            <Link href="/masuk" onClick={() => setOpen(false)} className="btn btn-ghost">
              Login
            </Link>
            <Link href="/laporan/baru" onClick={() => setOpen(false)} className="btn btn-primary">
              + Buat Laporan
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
