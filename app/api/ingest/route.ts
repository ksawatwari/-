import { NextResponse } from "next/server";
import { authorized, db } from "@/lib/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InboxEvent = {
  id: string;
  dir: "in" | "out";
  amount: number;
  dateKey: string;
  time: string;
  counterparty: string;
  ref: string;
  createdAt: number;
};

// หน้าเว็บดึงรายการใหม่ (status = new)
export async function GET(req: Request) {
  if (!authorized(req, "APP_KEY")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const snap = await db().collection("inbox").where("status", "==", "new").limit(50).get();
  const events: InboxEvent[] = snap.docs
    .map((d) => {
      const x = d.data();
      return {
        id: d.id,
        dir: x.dir === "in" ? ("in" as const) : ("out" as const),
        amount: Number(x.amount) || 0,
        dateKey: String(x.dateKey ?? ""),
        time: String(x.time ?? "00:00"),
        counterparty: String(x.counterparty ?? ""),
        ref: String(x.ref ?? ""),
        createdAt: Number(x.createdAt) || 0,
      };
    })
    .filter((e) => e.amount > 0 && /^\d{4}-\d{2}-\d{2}$/.test(e.dateKey))
    .sort((a, b) => a.createdAt - b.createdAt);
  return NextResponse.json({ events });
}

// หน้าเว็บบันทึกรายการแล้ว -> ปิดงาน (status = done)
export async function POST(req: Request) {
  if (!authorized(req, "APP_KEY")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let ids: unknown = [];
  try {
    ids = ((await req.json()) as { ids?: unknown }).ids;
  } catch {
    /* ignore */
  }
  const list = (Array.isArray(ids) ? ids : [])
    .filter((x): x is string => typeof x === "string" && /^[a-f0-9]{40}$/.test(x))
    .slice(0, 50);
  if (list.length === 0) return NextResponse.json({ ok: true, updated: 0 });

  const d = db();
  const batch = d.batch();
  for (const id of list) {
    batch.set(d.collection("inbox").doc(id), { status: "done" }, { merge: true });
  }
  await batch.commit();
  return NextResponse.json({ ok: true, updated: list.length });
}
