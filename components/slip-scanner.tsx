"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Check,
  AlertTriangle,
  ScanLine,
  Banknote,
  Receipt,
  Camera,
  ImagePlus,
} from "lucide-react";
import { Tx } from "@/lib/types";
import { useT, getLocale } from "@/lib/i18n";
import { pad, toKey, fromKey, diffDays, uid } from "@/lib/utils";

/* ================================================================
   Slip scanner (OCR ในเครื่อง — ไม่เสียค่า API / ไม่ส่งรูปออกนอกเครื่อง)
================================================================ */
export type Draft = {
  id: string;
  amount: string;
  note: string;
  dateKey: string;
  time: string; // HH:MM
  income: boolean;
  ref: string;
  dup: boolean;
  thumb: string;
};

export type OcrWorker = {
  recognize: (img: string) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<unknown>;
};

export const MONTH_PATS = [
  "ม\\.?\\s?ค\\.?|มกราคม|jan",
  "ก\\.?\\s?พ\\.?|กุมภาพันธ์|feb",
  "มี\\.?\\s?ค\\.?|มีนาคม|mar",
  "เม\\.?\\s?ย\\.?|เมษายน|apr",
  "พ\\.?\\s?ค\\.?|พฤษภาคม|may",
  "มิ\\.?\\s?ย\\.?|มิถุนายน|jun",
  "ก\\.?\\s?ค\\.?|กรกฎาคม|jul",
  "ส\\.?\\s?ค\\.?|สิงหาคม|aug",
  "ก\\.?\\s?ย\\.?|กันยายน|sep",
  "ต\\.?\\s?ค\\.?|ตุลาคม|oct",
  "พ\\.?\\s?ย\\.?|พฤศจิกายน|nov",
  "ธ\\.?\\s?ค\\.?|ธันวาคม|dec",
];

export function parseSlip(raw: string, now: Date) {
  // OCR ภาษาไทยชอบเว้นวรรคระหว่างตัวอักษร ตัดออกก่อน
  const text = raw.replace(/([\u0E00-\u0E7F])[ \t]+(?=[\u0E00-\u0E7F])/g, "$1");

  // --- ยอดเงิน: เลือกตัวเลขทศนิยม 2 ตำแหน่งที่อยู่หลังคำว่า "จำนวน/Amount" ก่อน ข้ามค่าธรรมเนียม
  const re = /\d{1,3}(?:,\d{3})+\.\d{2}|\d+\.\d{2}/g;
  let amount: number | null = null;
  let fallback: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const v = parseFloat(m[0].replace(/,/g, ""));
    if (!(v > 0)) continue;
    const before = text.slice(Math.max(0, m.index - 22), m.index);
    if (/ค่าธรรม|fee/i.test(before)) continue;
    if (/จ.{0,3}นวน|amount/i.test(before)) {
      amount = v;
      break;
    }
    if (fallback === null) fallback = v;
  }
  if (amount === null) amount = fallback;

  // --- วันที่
  let date: Date | null = null;
  let dateEnd = 0;
  for (let i = 0; i < 12 && !date; i++) {
    const mm = new RegExp(`(\\d{1,2})\\s*(?:${MONTH_PATS[i]})\\s*\\.?\\s*(\\d{2,4})`, "i").exec(text);
    if (!mm) continue;
    const day = Number(mm[1]);
    let y = Number(mm[2]);
    if (y < 100) y = y >= 50 ? 2500 + y : 2000 + y;
    if (y >= 2400) y -= 543;
    const cand = new Date(y, i, day);
    if (cand.getMonth() === i && cand.getDate() === day) {
      date = cand;
      dateEnd = mm.index + mm[0].length;
    }
  }
  if (date && (toKey(date) > toKey(now) || diffDays(date, now) > 400)) date = null;

  // --- เวลา
  let time = "";
  const tm = /(\d{1,2}):(\d{2})/.exec(text.slice(date ? dateEnd : 0)) ?? /(\d{1,2}):(\d{2})/.exec(text);
  if (tm && Number(tm[1]) < 24 && Number(tm[2]) < 60) time = `${pad(Number(tm[1]))}:${tm[2]}`;
  if (!time) time = date ? "12:00" : `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const dateKey = toKey(date ?? now);

  // --- รหัสอ้างอิง (กันบันทึกซ้ำ)
  const rm = /(?:รหัสอ้างอิง|เลขที่รายการ|เลขอ้างอิง|ref(?:erence)?\.?(?:\s*no\.?)?)\s*[:：]?\s*([A-Za-z0-9]{8,})/i.exec(text);
  const ref = rm ? rm[1] : `${amount ?? 0}|${dateKey}|${time}`;

  // --- ชื่อผู้รับ
  let note = "";
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const keyRe = /^(?:ไปยัง|ถึง|to\b|ผู้รับ)/i;
  const idx = lines.findIndex((l) => keyRe.test(l));
  if (idx >= 0) {
    let cand = lines[idx].replace(keyRe, "").replace(/^[:：\s]+/, "");
    if (cand.replace(/[^\u0E00-\u0E7FA-Za-z]/g, "").length < 2) cand = lines[idx + 1] ?? "";
    note = cand
      .replace(/[0-9xX*\-_|:]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
  }

  // สลิปที่สแกนถือเป็น "รายจ่าย" เสมอ (ไม่เดาเองว่าเป็นรายรับ เพราะคำว่า "ผู้รับ/รับเงิน" มีอยู่ในสลิปโอนออกด้วย)
  // ถ้าเป็นเงินเข้าจริง ผู้ใช้กดสลับเป็น "รายรับ" เองในหน้าตรวจสอบ
  return { amount, dateKey, time, ref, note };
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

// ย่อรูป + ทำขาวดำเพิ่มคอนทราสต์ให้ OCR อ่านเร็วและแม่นขึ้น
export async function prepImage(file: File): Promise<{ ocr: string; thumb: string }> {
  const img = await loadImage(file);
  const scale = Math.min(1, 1200 / img.width, 2600 / img.height);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.filter = "grayscale(1) contrast(1.25)";
  ctx.drawImage(img, 0, 0, w, h);
  const ocr = c.toDataURL("image/jpeg", 0.92);

  const tc = document.createElement("canvas");
  const tw = 72;
  const th = Math.min(128, Math.round((tw * img.height) / img.width));
  tc.width = tw;
  tc.height = th;
  tc.getContext("2d")?.drawImage(img, 0, 0, tw, th);
  const thumb = tc.toDataURL("image/jpeg", 0.7);

  return { ocr, thumb };
}

export function SlipScanner({
  existing,
  now,
  onSaveTxs,
}: {
  existing: Tx[];
  now: Date;
  onSaveTxs: (list: Tx[]) => void;
}) {
  const t = useT();
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<OcrWorker | null>(null);
  const [busy, setBusy] = useState<{ i: number; n: number } | null>(null);
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    return () => {
      workerRef.current?.terminate().catch(() => {});
      workerRef.current = null;
    };
  }, []);

  const getWorker = async (): Promise<OcrWorker> => {
    if (workerRef.current) return workerRef.current;
    const { createWorker } = await import("tesseract.js");
    const w = (await createWorker(["tha", "eng"])) as unknown as OcrWorker;
    workerRef.current = w;
    return w;
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0 || busy) return;
    const list = files.slice(0, 15);
    const out: Draft[] = [];
    setBusy({ i: 1, n: list.length });
    try {
      const worker = await getWorker();
      for (let k = 0; k < list.length; k++) {
        setBusy({ i: k + 1, n: list.length });
        try {
          const { ocr, thumb } = await prepImage(list[k]);
          const { data } = await worker.recognize(ocr);
          const p = parseSlip(data.text, now);
          out.push({
            id: uid(),
            amount: p.amount ? String(p.amount) : "",
            note: p.note || t("scan.slipNote"),
            dateKey: p.dateKey,
            time: p.time,
            income: false,
            ref: p.ref,
            dup: false,
            thumb,
          });
        } catch {
          /* ข้ามรูปที่อ่านไม่ได้ */
        }
      }
    } catch {
      setBusy(null);
      alert(t("scan.error"));
      return;
    }
    setBusy(null);
    if (out.length === 0) {
      alert(t("scan.error"));
      return;
    }
    const known = new Set(existing.map((x) => x.ref).filter((r): r is string => !!r));
    for (const d of out) {
      if (known.has(d.ref)) d.dup = true;
      known.add(d.ref);
    }
    setDrafts(out);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = Array.from(e.target.files ?? []);
    e.target.value = "";
    void handleFiles(arr);
  };

  const upd = (id: string, patch: Partial<Draft>) =>
    setDrafts((arr) => (arr ? arr.map((d) => (d.id === id ? { ...d, ...patch } : d)) : arr));

  const validCount = drafts ? drafts.filter((d) => Number(d.amount) > 0).length : 0;

  const saveAll = () => {
    if (!drafts) return;
    const list: Tx[] = [];
    for (const d of drafts) {
      const amt = Number(d.amount);
      if (!(amt > 0)) continue;
      const [hh, mi] = d.time.split(":").map(Number);
      const when = fromKey(d.dateKey);
      when.setHours(hh || 0, mi || 0, 0, 0);
      list.push({
        id: uid(),
        amount: amt,
        category: "other",
        note: d.note.trim(),
        dateKey: d.dateKey,
        ts: when.getTime(),
        icon: d.income ? "Banknote" : "Receipt",
        income: d.income || undefined,
        ref: d.ref,
      });
    }
    if (list.length === 0) return;
    onSaveTxs(list);
    setDrafts(null);
    setToast(t("scan.saved", { n: list.length }));
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <>
      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <ScanLine size={18} />
          </span>
          <h2 className="text-sm font-medium text-slate-600">{t("scan.title")}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => camRef.current?.click()}
            disabled={!!busy}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-semibold text-white active:bg-emerald-600 disabled:opacity-50"
          >
            <Camera size={20} /> {t("scan.camera")}
          </button>
          <button
            onClick={() => galRef.current?.click()}
            disabled={!!busy}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-100 font-semibold text-slate-700 active:bg-slate-200 disabled:opacity-50"
          >
            <ImagePlus size={20} /> {t("scan.gallery")}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{t("scan.hint")}</p>

        {busy && (
          <div className="mt-3 flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            <span className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-600" />
            <span>
              {t("scan.loading", { i: busy.i, n: busy.n })}
              {!workerRef.current && (
                <span className="mt-1 block text-xs text-emerald-600">{t("scan.firstTime")}</span>
              )}
            </span>
          </div>
        )}

        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />
        <input
          ref={galRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </section>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-800 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {drafts && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setDrafts(null)}
        >
          <div
            className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t("scan.review")}</h3>
              <button
                onClick={() => setDrafts(null)}
                className="p-2 text-slate-400"
                aria-label={t("common.close")}
              >
                <X size={20} />
              </button>
            </div>

            {drafts.map((d) => {
              const bad = !(Number(d.amount) > 0);
              return (
                <div
                  key={d.id}
                  className={`mb-3 rounded-2xl border p-3 ${
                    bad ? "border-rose-300 bg-rose-50" : "border-slate-200"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.thumb}
                      alt=""
                      className="h-16 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={d.amount}
                          onChange={(e) => upd(d.id, { amount: e.target.value })}
                          placeholder={t("quick.amountPh")}
                          className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg font-bold outline-none focus:border-emerald-500"
                        />
                        <input
                          value={d.note}
                          onChange={(e) => upd(d.id, { note: e.target.value })}
                          placeholder={t("quick.notePh")}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">
                          {fromKey(d.dateKey).toLocaleDateString(getLocale(), {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {d.time}
                        </span>
                        <div className="flex overflow-hidden rounded-full bg-slate-100 text-xs font-medium">
                          <button
                            onClick={() => upd(d.id, { income: false })}
                            className={`px-3 py-1.5 ${
                              !d.income ? "bg-rose-500 text-white" : "text-slate-500"
                            }`}
                          >
                            {t("scan.expense")}
                          </button>
                          <button
                            onClick={() => upd(d.id, { income: true })}
                            className={`px-3 py-1.5 ${
                              d.income ? "bg-emerald-500 text-white" : "text-slate-500"
                            }`}
                          >
                            {t("scan.income")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDrafts((arr) => {
                          const next = (arr ?? []).filter((x) => x.id !== d.id);
                          return next.length ? next : null;
                        })
                      }
                      className="h-8 w-8 shrink-0 text-slate-400"
                      aria-label={t("scan.remove")}
                    >
                      <X size={16} className="mx-auto" />
                    </button>
                  </div>
                  {bad && <p className="mt-2 text-xs text-rose-600">{t("scan.noAmount")}</p>}
                  {d.dup && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle size={12} /> {t("scan.dup")}
                    </p>
                  )}
                </div>
              );
            })}

            <button
              onClick={saveAll}
              disabled={validCount === 0}
              className="sticky bottom-0 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white shadow-lg active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Check size={18} /> {t("scan.saveAll", { n: validCount })}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
