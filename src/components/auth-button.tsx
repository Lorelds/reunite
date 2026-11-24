import Link from "next/link";
import { logoutAction } from "@/app/(site)/masuk/actions";
import { currentUser } from "@/lib/supabase/server";

export async function AuthButton() {
  const user = await currentUser();
  if (!user) {
    return (
      <Link href="/masuk" className="btn btn-ghost min-h-[40px] px-[14px]">
        Login
      </Link>
    );
  }
  return (
    <form action={logoutAction}>
      <button type="submit" className="btn btn-ghost min-h-[40px] px-[14px]" title={user.email ?? undefined}>
        Keluar
      </button>
    </form>
  );
}
