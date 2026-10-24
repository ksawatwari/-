// แกะข้อความแจ้งเตือน SCB Connect (เงินเข้า / เงินออก)
// ตัวอย่างที่รองรับ:
//  "รายการเงินเข้า 10.18 บาท เข้าบัญชี X-918 วันที่ 24/10/2026 @21:22 ยอดเงินที่ใช้ได้ 2,139.31 บาท"
//  "รายการเงินออก -50.00 บาท จากบัญชี X-9128 เข้าบัญชี KITTIPHONG TH X-7058 ไทยพาณิชย์ วันที่/เวลา 24/10/2026 18:21 ยอดเงินที่ใช้ได้ 2,138.13 บาท"

export type ScbEvent = {
  dir: "in" | "out";
  amount: number;
  dateKey: string; // yyyy-mm-dd (เวลาไทย)
  time: string; // HH:MM
  counterparty: string;
  balance: number | null;
  ref: string; // `${amount}|${dateKey}|${time}` — รูปแบบเดียวกับ ref ของสลิปที่สแกน
};

const p2 = (n: number) => String(n).padStart(2, "0");
const num = (s: string) => parseFloat(s.replace(/,/g, ""));

function bkkNow() {
  const d = new Date(Date.now() + 7 * 3600 * 1000);
  return {
    dateKey: `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`,
    time: `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`,
  };
}

export function parseScb(raw: string): ScbEvent | null {
  const text = raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const dm = /รายการเงิน(เข้า|ออก)/.exec(text);
  if (!dm) return null;
  const dir: "in" | "out" = dm[1] === "เข้า" ? "in" : "out";
  const after = text.slice(dm.index + dm[0].length);

  // ยอดเงิน (ตัวเลขแรกหลังคำว่า รายการเงินเข้า/ออก)
  const am =
    /^\s*[:：]?\s*[+\-−–]?\s*([\d,]+(?:\.\d{1,2})?)\s*บาท/.exec(after) ??
    /([\d,]+\.\d{2})\s*บาท/.exec(after);
  if (!am) return null;
  const amount = num(am[1]);
  if (!(amount > 0)) return null;

  // วันที่/เวลา  dd/mm/yyyy [@|เวลา] hh:mm
  const now = bkkNow();
  let dateKey = now.dateKey;
  let time = now.time;
  const dt = /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*(?:@|เวลา)?\s*(\d{1,2}):(\d{2}))?/.exec(text);
  if (dt) {
    const day = Number(dt[1]);
    const mon = Number(dt[2]);
    let year = Number(dt[3]);
    if (year > 2400) year -= 543;
    if (mon >= 1 && mon <= 12 && day >= 1 && day <= 31) {
      dateKey = `${year}-${p2(mon)}-${p2(day)}`;
      if (dt[4] !== undefined && Number(dt[4]) < 24 && Number(dt[5]) < 60) {
        time = `${p2(Number(dt[4]))}:${dt[5]}`;
      }
    }
  }

  const bm = /ยอดเงินที่ใช้ได้\s*[:：]?\s*([\d,]+(?:\.\d{1,2})?)\s*บาท/.exec(text);
  const balance = bm ? num(bm[1]) : null;

  // ชื่อคู่รายการ: เงินออก = หลัง "เข้าบัญชี" / เงินเข้า = ระหว่าง "จากบัญชี" ถึง "เข้าบัญชี"
  let seg = "";
  if (dir === "out") {
    const m = /เข้าบัญชี\s*(.*?)\s*(?:วันที่|$)/.exec(text);
    seg = m?.[1] ?? "";
  } else {
    const m = /จากบัญชี\s*(.*?)\s*เข้าบัญชี/.exec(text);
    seg = m?.[1] ?? "";
  }
  const counterparty = seg.replace(/\bX-?\d+.*$/i, "").trim().slice(0, 40);

  return {
    dir,
    amount,
    dateKey,
    time,
    counterparty,
    balance,
    ref: `${amount}|${dateKey}|${time}`,
  };
}
