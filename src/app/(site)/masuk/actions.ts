"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export type AuthMode = "login" | "register";
export type LoginState = { step: "email" | "code"; mode: AuthMode; email?: string; name?: string; error?: string; info?: string; sentAt?: number };

const EMAIL = z.string().trim().toLowerCase().email("Masukkan alamat email yang valid.");
const NAME = z.string().trim().min(2, "Masukkan nama lengkap Anda.").max(80, "Nama terlalu panjang.");
const CODE = z.string().regex(/^\d{6}$/, "Kode harus 6 digit angka.");

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/laporan-saya";
}

export async function loginAction(prev: LoginState, form: FormData): Promise<LoginState> {
  const supabase = await supabaseServer();

  const mode: AuthMode = form.get("mode") === "register" ? "register" : "login";
  const rawName = typeof form.get("name") === "string" ? String(form.get("name")) : undefined;

  if (form.get("intent") === "send") {
    const email = EMAIL.safeParse(form.get("email"));
    if (!email.success) return { step: "email", mode, name: rawName, error: email.error.issues[0].message };
    let name: string | undefined;
    if (mode === "register") {
      const parsed = NAME.safeParse(rawName);
      if (!parsed.success) return { step: "email", mode, email: email.data, name: rawName, error: parsed.error.issues[0].message };
      if (form.get("terms") !== "on") return { step: "email", mode, email: email.data, name: rawName, error: "Setujui ketentuan layanan untuk membuat akun." };
      name = parsed.data;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.data,
      options: mode === "register" ? { shouldCreateUser: true, data: { full_name: name } } : { shouldCreateUser: false },
    });
    if (error) {
      const noAccount = mode === "login" && /signups? not allowed|otp_disabled|not found/i.test(`${error.code ?? ""} ${error.message}`);
      return {
        step: "email",
        mode,
        email: email.data,
        name,
        error: noAccount ? "Email ini belum terdaftar. Buat akun lewat tab Registrasi." : "Kode gagal dikirim. Tunggu sebentar lalu coba lagi.",
      };
    }
    return { step: "code", mode, email: email.data, name, info: `Kode 6 digit dikirim ke ${email.data}.`, sentAt: Date.now() };
  }

  const email = EMAIL.safeParse(form.get("email"));
  const code = CODE.safeParse(form.getAll("digit").join(""));
  if (!email.success) return { step: "email", mode, error: email.error.issues[0].message };
  if (!code.success) return { step: "code", mode, email: email.data, error: code.error.issues[0].message };

  const { error } = await supabase.auth.verifyOtp({ email: email.data, token: code.data, type: "email" });
  if (error) return { step: "code", mode, email: email.data, error: "Kode salah atau sudah kedaluwarsa." };
  redirect(safeNext(form.get("lanjut")));
}

export async function logoutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
