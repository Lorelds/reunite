import { NextResponse } from "next/server";
import { z } from "zod";
import { applyNotification, verifySignature } from "@/lib/payments";

const BODY = z.object({ paymentId: z.string().uuid(), status: z.enum(["paid", "failed"]) });

// Receives the gateway's payment notification. Only signed notifications change state.
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-signature"))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  const parsed = BODY.safeParse(JSON.parse(raw));
  if (!parsed.success) return NextResponse.json({ error: "invalid body" }, { status: 400 });
  const payment = await applyNotification(parsed.data);
  return NextResponse.json({ ok: true, applied: Boolean(payment) });
}
