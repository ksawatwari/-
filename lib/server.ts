import { timingSafeEqual } from "crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function db() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getFirestore();
}

// ตรวจรหัสลับ (header x-key หรือ ?key=)
// INGEST_KEY = รหัสที่มือถือใช้ส่งแจ้งเตือนเข้ามา / APP_KEY = รหัสที่หน้าเว็บใช้ดึงรายการ
export function authorized(req: Request, envName: "INGEST_KEY" | "APP_KEY" = "INGEST_KEY"): boolean {
  const expected = process.env[envName];
  if (!expected) return false;
  const url = new URL(req.url);
  const given = req.headers.get("x-key") ?? url.searchParams.get("key") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
