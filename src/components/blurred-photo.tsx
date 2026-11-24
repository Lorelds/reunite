"use client";

import Image from "next/image";
import { useState } from "react";

export function BlurredPhoto({ src, alt }: { src: string; alt: string }) {
  const [blurred, setBlurred] = useState(true);
  return (
    <div className="relative aspect-[490/600] overflow-hidden rounded-card bg-ink-raised">
      <Image src={src} unoptimized={src.startsWith("http")} alt={blurred ? "" : alt} fill sizes="(min-width: 1024px) 490px, 100vw" className={`object-cover transition ${blurred ? "scale-110 blur-2xl" : ""}`} />
      {blurred && (
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <svg className="mx-auto size-[18px] text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            </svg>
            <p className="mt-[10px] text-[15px] font-bold">Privacy blur aktif</p>
            <p className="mt-[4px] text-[12px] text-muted">Wajah disamarkan untuk keamanan.</p>
            <button type="button" onClick={() => setBlurred(false)} className="btn btn-ghost mt-[14px] min-h-[36px] text-fg">
              Lihat foto dengan izin
            </button>
          </div>
        </div>
      )}
      <label className="absolute bottom-[14px] right-[14px] flex cursor-pointer items-center gap-[10px] rounded-[6px] border border-line bg-ink px-[12px] py-[8px] text-[12px]">
        Blur wajah
        <input type="checkbox" role="switch" checked={blurred} onChange={(e) => setBlurred(e.target.checked)} className="peer sr-only" />
        <span className="relative h-[16px] w-[30px] rounded-full bg-line-strong transition peer-checked:bg-fg peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-muted">
          <span className={`absolute top-[3px] size-[10px] rounded-full transition-all ${blurred ? "left-[17px] bg-ink" : "left-[3px] bg-fg"}`} />
        </span>
      </label>
    </div>
  );
}
