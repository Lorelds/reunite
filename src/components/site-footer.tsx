import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-[1200px] gap-[12px] px-[14px] py-[28px] desk:min-h-[92px] desk:grid-cols-[1fr_auto_1fr] desk:items-center desk:px-[30px] desk:py-0">
        <Logo muted />
        <p className="text-[12px] text-muted">Platform informasi publik untuk membantu mereka kembali pulang.</p>
        <p className="text-[12px] font-bold text-fg desk:justify-self-end">REUNITE © 2026</p>
      </div>
    </footer>
  );
}
