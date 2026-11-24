"use client";

import { useActionState, useState } from "react";
import { flagHoax } from "./actions";

export function HoaxReport({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(flagHoax, null);

  if (state?.ok) return <p className="text-[12px] text-found">{state.message}</p>;

  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-[12px] text-muted underline hover:text-fg" aria-expanded={open}>
        Laporkan sebagai hoaks / data salah
      </button>
      {open && (
        <form action={action} className="mt-[10px] grid gap-[8px]">
          <input type="hidden" name="reportId" value={reportId} />
          <label className="text-[12px] text-muted" htmlFor="hoax-reason">Apa yang salah dari laporan ini?</label>
          <textarea id="hoax-reason" name="reason" required minLength={10} maxLength={500} className="field text-[13px]" />
          {state && !state.ok && <p className="text-[12px] text-wanted">{state.message}</p>}
          <button type="submit" disabled={pending} className="btn btn-ghost w-fit">
            {pending ? "Mengirim…" : "Kirim ke moderator"}
          </button>
        </form>
      )}
    </div>
  );
}
