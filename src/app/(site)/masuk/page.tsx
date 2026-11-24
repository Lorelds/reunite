import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk — REUNITE" };

async function Form({ searchParams }: { searchParams: PageProps<"/masuk">["searchParams"] }) {
  const { lanjut, mode } = await searchParams;
  return <LoginForm next={typeof lanjut === "string" ? lanjut : "/laporan-saya"} initialMode={mode === "daftar" ? "register" : "login"} />;
}

export default function LoginPage({ searchParams }: PageProps<"/masuk">) {
  return (
    <div className="mx-auto grid max-w-[1200px] desk:min-h-[calc(100vh-72px)] desk:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-line bg-ink-raised p-[40px] desk:flex">
        <Logo />
        <blockquote className="max-w-[460px] font-display text-[34px] leading-[1.2] tracking-[-0.02em]">
          “Setiap laporan terverifikasi membawa seseorang selangkah lebih dekat untuk pulang.”
        </blockquote>
        <div className="grid gap-[28px]">
          <ul className="grid gap-[12px] text-[12px] text-muted">
            {[
              "Masuk tanpa kata sandi, cukup kode sekali pakai lewat email",
              "Setiap laporan ditinjau moderator sebelum tayang",
              "KTP dan nomor telepon tidak pernah ditampilkan ke publik",
            ].map((t) => (
              <li key={t} className="flex items-start gap-[10px]">
                <span className="mt-[6px] size-[5px] shrink-0 rounded-full bg-found" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <p className="text-[10px] tracking-[0.14em] text-faint">REUNITE TRUST &amp; SAFETY NETWORK</p>
        </div>
      </aside>
      <section className="flex items-center px-[14px] py-[40px] desk:px-[100px]">
        <div className="mx-auto w-full max-w-[380px] desk:mx-0">
          <p className="eyebrow text-[10px]">Akses Aman</p>
          <div className="mt-[12px]">
            <Suspense fallback={<LoginForm next="/laporan-saya" />}>
              <Form searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
