"use client";

import { useEffect, useRef, useState } from "react";

type Target = { name: string; href: (url: string, text: string) => string };

const TARGETS: Target[] = [
  { name: "WhatsApp", href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t}\n${u}`)}` },
  { name: "Telegram", href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { name: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { name: "X (Twitter)", href: (u, t) => `https://x.com/intent/post?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
  { name: "LINE", href: (u, t) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { name: "Email", href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${t}\n\n${u}`)}` },
];

export function ShareCase({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [canNative, setCanNative] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => {
          setUrl(window.location.href.split("#")[0]);
          setCanNative(typeof navigator.share === "function");
          setOpen((o) => !o);
        }} aria-expanded={open} aria-haspopup="menu" className="btn btn-ghost w-full text-fg">
        Bagikan Kasus
      </button>
      {open && (
        <div role="menu" className="absolute bottom-[calc(100%+8px)] right-0 z-20 w-[260px] rounded-card border border-line-strong bg-panel p-[8px] shadow-2xl">
          <p className="px-[8px] pb-[6px] pt-[4px] text-[10px] font-bold tracking-[0.1em] text-muted">BAGIKAN KE</p>
          <div className="grid grid-cols-2 gap-[4px]">
            {TARGETS.map((t) => (
              <a
                key={t.name}
                role="menuitem"
                href={t.href(url, text)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-[5px] px-[8px] py-[8px] text-[12px] font-semibold hover:bg-ink-raised"
              >
                {t.name}
              </a>
            ))}
          </div>
          <div className="mt-[6px] grid gap-[4px] border-t border-line pt-[6px]">
            <button type="button" role="menuitem" onClick={copy} className="rounded-[5px] px-[8px] py-[8px] text-left text-[12px] font-semibold hover:bg-ink-raised">
              {copied ? "✓ Tautan disalin" : "Salin tautan"}
            </button>
            {canNative && (
              <button
                type="button"
                role="menuitem"
                onClick={() => navigator.share({ title: "REUNITE", text, url }).catch(() => {})}
                className="rounded-[5px] px-[8px] py-[8px] text-left text-[12px] font-semibold hover:bg-ink-raised"
              >
                Aplikasi lain…
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
