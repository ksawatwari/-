import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { authorized, db } from "@/lib/server";
import { parseScb } from "@/lib/scb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// มือถือ (MacroDroid ฯลฯ) ส่งข้อความแจ้งเตือนมาที่นี่
export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.text();
  let text = body;
  try {
    const j: unknown = JSON.parse(body);
    if (typeof j === "string") text = j;
    else if (j && typeof (j as { text?: unknown }).text === "string") {
      text = (j as { text: string }).text;
    }
  } catch {
    /* ไม่ใช่ JSON = ใช้ข้อความดิบ */
  }
  text = text.trim().slice(0, 2000);

  // ไม่ใช่ข้อความรายการเงิน (เช่น โปรโมชันจาก SCB Connect) ข้ามไป
  if (!text.includes("รายการเงิน")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const col = db().collection("inbox");
  const ev = parseScb(text);

  if (!ev) {
    await col.add({ status: "unparsed", raw: text, createdAt: Date.now() });
    return NextResponse.json({ ok: true, parsed: false });
  }

  // id จาก ทิศทาง+ยอด+วัน+เวลา => แจ้งเตือนซ้ำจะไม่ถูกบันทึกซ้ำ
  const id = createHash("sha1").update(`${ev.dir}|${ev.ref}`).digest("hex");
  try {
    await col.doc(id).create({ status: "new", ...ev, createdAt: Date.now() });
  } catch (e: unknown) {
    const c = (e as { code?: unknown }).code;
    if (c === 6 || c === "already-exists" || c === "6") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    throw e;
  }
  return NextResponse.json({ ok: true, parsed: true });
}
