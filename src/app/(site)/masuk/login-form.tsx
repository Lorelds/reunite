"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction, type AuthMode, type LoginState } from "./actions";

const RESEND_SECONDS = 60;

export function LoginForm({ next, initialMode = "login" }: { next: string; initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [attempt, setAttempt] = useState(0);

  function switchTo(m: AuthMode) {
    setMode(m);
    setAttempt((a) => a + 1);
  }

  return (
    <div>
      <h1 className="font-display text-[30px] tracking-[-0.02em]">{mode === "login" ? "Masuk ke akun Anda" : "Buat akun REUNITE"}</h1>
      <p className="mb-[28px] mt-[8px] text-[13px] text-muted">
        {mode === "login" ? "Kelola laporan, petunjuk, dan status verifikasi dalam satu tempat." : "Daftar untuk membuat laporan, menambah bounty, dan menerima petunjuk."}
      </p>
      <div role="tablist" aria-label="Pilih akses" className="grid grid-cols-2 border-b border-line">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => mode !== m && switchTo(m)}
            className={`-mb-px border-b-2 pb-[12px] text-[13px] transition-colors ${
              mode === m ? "border-fg font-semibold text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {m === "login" ? "Login" : "Registrasi"}
          </button>
        ))}
      </div>
      <AuthFlow key={`${mode}-${attempt}`} mode={mode} next={next} onSwitch={switchTo} onRestart={() => setAttempt((a) => a + 1)} />
    </div>
  );
}

function AuthFlow({ mode, next, onSwitch, onRestart }: { mode: AuthMode; next: string; onSwitch: (m: AuthMode) => void; onRestart: () => void }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { step: "email", mode });
  const digits = useRef<(HTMLInputElement | null)[]>([]);
  const form = useRef<HTMLFormElement>(null);
  const verify = useRef<HTMLButtonElement>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!state.sentAt) return;
    digits.current.forEach((el) => el && (el.value = ""));
    digits.current[0]?.focus();
    const tick = () => setWait(Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - state.sentAt!) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [state.sentAt]);

  function maybeSubmit() {
    if (digits.current.every((el) => el?.value) && !pending) form.current?.requestSubmit(verify.current);
  }

  function onDigit(i: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      clean.slice(0, 6).split("").forEach((d, j) => {
        const el = digits.current[j];
        if (el) el.value = d;
      });
      digits.current[Math.min(clean.length, 6) - 1]?.focus();
      maybeSubmit();
      return;
    }
    const el = digits.current[i];
    if (el) el.value = clean;
    if (clean && i < 5) digits.current[i + 1]?.focus();
    if (clean) maybeSubmit();
  }

  const register = mode === "register";
  const noAccount = state.error?.includes("belum terdaftar");

  return (
    <form ref={form} action={action} className="mt-[24px] grid gap-[16px]">
      <input type="hidden" name="lanjut" value={next} />
      <input type="hidden" name="mode" value={mode} />

      {state.step === "email" ? (
        <>
          {register && (
            <label className="grid gap-[8px]">
              <span className="eyebrow text-[10px]">Nama lengkap</span>
              <input name="name" required minLength={2} maxLength={80} autoComplete="name" defaultValue={state.name} placeholder="Sesuai KTP" className="field" />
            </label>
          )}
          <label className="grid gap-[8px]">
            <span className="eyebrow text-[10px]">Email</span>
            <input name="email" type="email" required autoComplete="email" defaultValue={state.email} placeholder="nama@email.com" className="field" autoFocus={!register} />
          </label>
          {register && (
            <label className="flex items-start gap-[10px] text-[12px] leading-[1.5] text-muted">
              <input name="terms" type="checkbox" required className="mt-[3px] size-[14px] shrink-0 accent-white" />
              <span>
                Saya setuju data saya diproses untuk verifikasi laporan sesuai UU Pelindungan Data Pribadi, dan tidak akan membuat laporan palsu.
              </span>
            </label>
          )}
          <button type="submit" name="intent" value="send" disabled={pending} className="btn btn-primary h-[46px]">
            {pending ? <Spinner label="Mengirim kode" /> : register ? "Buat Akun & Kirim Kode" : "Kirim Kode Verifikasi"}
          </button>
        </>
      ) : (
        <>
          <input type="hidden" name="email" value={state.email} />
          {register && state.name && <input type="hidden" name="name" value={state.name} />}
          <div className="flex items-center justify-between gap-[12px] rounded-card border border-line bg-panel px-[14px] py-[12px]">
            <div className="min-w-0">
              <p className="text-[11px] text-muted">Kode dikirim ke</p>
              <p className="truncate text-[13px] font-semibold">{state.email}</p>
            </div>
            <button type="button" onClick={onRestart} className="shrink-0 text-[12px] text-muted underline underline-offset-2 hover:text-fg">
              Ubah email
            </button>
          </div>

          <fieldset className="grid gap-[10px]">
            <legend className="eyebrow mb-[10px] text-[10px]">Masukkan 6 digit kode OTP</legend>
            <div className="grid grid-cols-6 gap-[8px]">
              {Array.from({ length: 6 }, (_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    digits.current[i] = el;
                  }}
                  name="digit"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={6}
                  required
                  aria-label={`Digit ${i + 1}`}
                  onChange={(e) => onDigit(i, e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !e.currentTarget.value && i > 0) digits.current[i - 1]?.focus();
                    if (e.key === "ArrowLeft" && i > 0) digits.current[i - 1]?.focus();
                    if (e.key === "ArrowRight" && i < 5) digits.current[i + 1]?.focus();
                  }}
                  className="h-[52px] w-full rounded-[6px] border border-line bg-panel text-center text-[18px] font-bold caret-transparent transition-colors focus:border-fg focus:outline-none"
                />
              ))}
            </div>
          </fieldset>

          <button ref={verify} type="submit" name="intent" value="verify" disabled={pending} className="btn btn-primary h-[46px]">
            {pending ? <Spinner label="Memeriksa kode" /> : "Verifikasi & Masuk"}
          </button>
          <p className="text-center text-[12px] text-muted">
            Tidak menerima kode?{" "}
            {wait > 0 ? (
              <span className="tabular-nums">Kirim ulang dalam {wait} detik</span>
            ) : (
              <button type="submit" name="intent" value="send" formNoValidate disabled={pending} className="text-fg underline underline-offset-2">
                Kirim ulang kode
              </button>
            )}
          </p>
        </>
      )}

      {state.error && (
        <p className="rounded-[6px] border border-wanted/40 bg-wanted/10 px-[12px] py-[10px] text-[12px] text-wanted" role="alert">
          {state.error}
          {noAccount && (
            <>
              {" "}
              <button type="button" onClick={() => onSwitch("register")} className="font-semibold text-fg underline underline-offset-2">
                Daftar sekarang
              </button>
            </>
          )}
        </p>
      )}
      {state.step === "code" && state.info && !state.error && (
        <p className="sr-only" role="status">
          {state.info}
        </p>
      )}

      <div className="flex items-center gap-[12px] rounded-card border border-line bg-panel p-[14px]">
        <svg className="size-[16px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        </svg>
        <div>
          <p className="text-[12px] font-bold">Identitas Anda terlindungi</p>
          <p className="text-[11px] text-muted">Email dan nomor pribadi tidak pernah ditampilkan ke publik.</p>
        </div>
      </div>

      {!register && state.step === "email" && (
        <p className="text-center text-[12px] text-muted">
          Belum punya akun?{" "}
          <button type="button" onClick={() => onSwitch("register")} className="text-fg underline underline-offset-2">
            Registrasi
          </button>
        </p>
      )}
      {register && state.step === "email" && (
        <p className="text-center text-[12px] text-muted">
          Dengan mendaftar Anda menyetujui <Link href="/panduan" className="text-fg underline underline-offset-2">panduan komunitas</Link> REUNITE.
        </p>
      )}
    </form>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-[8px]">
      <svg className="size-[14px] animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label}…
    </span>
  );
}
