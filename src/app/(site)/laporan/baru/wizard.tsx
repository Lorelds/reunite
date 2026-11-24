"use client";

import Image from "next/image";
import { useActionState, useRef, useState, type ReactNode } from "react";
import type { SubmitState } from "./actions";

export type Step = { title: string; label: string; hint: string; fields: string[]; body: ReactNode };

export function Wizard({
  action,
  steps,
  submitLabel,
}: {
  action: (prev: SubmitState, form: FormData) => Promise<SubmitState>;
  steps: Step[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [current, setCurrent] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.fields ?? {};
  const firstErrorStep = steps.findIndex((s) => s.fields.some((f) => errors[f]));

  function stepValid(i: number) {
    const form = formRef.current;
    if (!form) return true;
    const section = form.querySelector<HTMLElement>(`[data-step="${i}"]`);
    const inputs = section?.querySelectorAll<HTMLInputElement>("input, select, textarea") ?? [];
    for (const el of inputs) {
      if (!el.checkValidity()) {
        el.reportValidity();
        return false;
      }
    }
    return true;
  }

  function go(to: number) {
    if (to > current && !stepValid(current)) return;
    setCurrent(to);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const shown = state?.fields && firstErrorStep >= 0 && firstErrorStep !== current && !pending ? firstErrorStep : current;

  return (
    <form ref={formRef} action={formAction} noValidate={false} className="scroll-mt-[90px]">
      <ol className="grid grid-cols-5 gap-px overflow-hidden rounded-card border border-line bg-line" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((s, i) => (
          <li key={s.label} className="bg-panel">
            <button
              type="button"
              onClick={() => (i <= shown ? setCurrent(i) : go(i))}
              aria-current={i === shown ? "step" : undefined}
              className={`flex h-[46px] w-full items-center gap-[8px] px-[12px] text-left text-[12px] ${i === shown ? "border-b-2 border-fg text-fg" : "text-muted"}`}
            >
              <span className={`grid size-[20px] shrink-0 place-items-center rounded-full border text-[10px] ${i < shown ? "border-found text-found" : i === shown ? "border-fg bg-fg text-ink" : "border-line-strong"}`}>
                {i < shown ? "✓" : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      {steps.map((s, i) => (
        <section key={s.label} data-step={i} hidden={i !== shown} className="mt-[28px] grid gap-[20px] desk:grid-cols-[40px_1fr]">
          <p className="text-[12px] font-bold text-muted">{String(i + 1).padStart(2, "0")}</p>
          <div>
            <h2 className="font-display text-[22px] tracking-[-0.01em]">{s.title}</h2>
            <p className="mt-[4px] text-[13px] text-muted">{s.hint}</p>
            <div className="mt-[20px]">{s.body}</div>
            <ErrorList errors={errors} fields={s.fields} />
          </div>
        </section>
      ))}

      {state?.error && (
        <p role="alert" className="mt-[20px] rounded-card border border-wanted/50 bg-wanted/10 p-[12px] text-[13px] text-wanted">
          {state.error}
        </p>
      )}

      <div className="mt-[32px] flex flex-col-reverse gap-[12px] border-t border-line pt-[20px] sm:flex-row sm:items-center sm:justify-between">
        {shown > 0 ? (
          <button type="button" onClick={() => setCurrent(shown - 1)} className="btn btn-ghost">
            ← Kembali
          </button>
        ) : (
          <span />
        )}
        {shown < steps.length - 1 ? (
          <button type="button" onClick={() => go(shown + 1)} className="btn btn-primary">
            Lanjut →
          </button>
        ) : (
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Mengirim…" : submitLabel}
            {!pending && <Image src="/figma/icon-arrow.svg" alt="" width={14} height={14} className="invert" />}
          </button>
        )}
      </div>
    </form>
  );
}

function ErrorList({ errors, fields }: { errors: Record<string, string>; fields: string[] }) {
  const list = fields.map((f) => errors[f]).filter(Boolean);
  if (!list.length) return null;
  return (
    <ul role="alert" className="mt-[16px] list-disc pl-[18px] text-[12px] text-wanted">
      {list.map((m) => (
        <li key={m}>{m}</li>
      ))}
    </ul>
  );
}

export function Field({ label, name, required, children, wide }: { label: string; name: string; required?: boolean; children: ReactNode; wide?: boolean }) {
  return (
    <label htmlFor={name} className={`grid gap-[8px] ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-bold tracking-[0.08em] text-muted">
        {label.toUpperCase()}
        {required && " *"}
      </span>
      {children}
    </label>
  );
}

export function PhotoInput({ name, label, hint, accept }: { name: string; label: string; hint: string; accept: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <label className="flex cursor-pointer flex-col gap-[16px] rounded-card border border-dashed border-line-strong p-[14px] hover:border-muted sm:flex-row sm:items-center">
      <span className="relative grid h-[160px] w-full shrink-0 place-items-center overflow-hidden rounded-[6px] bg-ink-raised sm:w-[160px]">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Pratinjau foto" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="text-[24px] text-faint">↑</span>
        )}
      </span>
      <span>
        <span className="block text-[14px] font-bold">{fileName ?? label}</span>
        <span className="mt-[4px] block text-[12px] text-muted">Tarik foto ke sini atau pilih dari perangkat</span>
        <span className="mt-[4px] block text-[11px] text-faint">{hint}</span>
      </span>
      <input
        type="file"
        name={name}
        accept={accept}
        required
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          setFileName(f?.name ?? null);
          setPreview(f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
        }}
      />
    </label>
  );
}

export function DocInput({ name, required }: { name: string; required?: boolean }) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <label className="flex cursor-pointer items-center justify-between gap-[12px] rounded-card border border-dashed border-line-strong p-[14px]">
      <span>
        <span className="block text-[13px] font-bold">{fileName ?? `Unggah KTP / Surat Keterangan${required ? " *" : " (opsional)"}`}</span>
        <span className="mt-[2px] block text-[11px] text-muted">PDF, JPG, atau PNG · disimpan privat, hanya untuk tim verifikasi</span>
      </span>
      <span className="btn btn-ghost min-h-[34px] text-[12px]">Pilih dokumen</span>
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,application/pdf"
        required={required}
        className="sr-only"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </label>
  );
}

export function Consent() {
  return (
    <label className="mt-[20px] flex gap-[10px] text-[12px] leading-[1.5] text-muted">
      <input type="checkbox" name="consent" required className="mt-[3px] accent-fg" />
      <span>
        Saya menyatakan data ini benar dan saya berhak melaporkannya. Saya mengizinkan REUNITE menampilkan foto dan
        informasi kasus secara publik setelah diverifikasi, dan meminta laporan diarsipkan setelah orang tersebut
        ditemukan. Nomor kontak dan dokumen identitas tidak pernah ditampilkan ke publik (UU PDP No. 27/2022).
      </span>
    </label>
  );
}
