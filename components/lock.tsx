"use client";

import { useEffect, useRef, useState } from "react";
import {
  Settings,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lock,
  Copy,
  KeyRound,
  Delete as BackspaceIcon,
} from "lucide-react";
import { Profile, LockData } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { STORAGE_KEY } from "@/lib/constants";
import { AvatarView } from "@/components/profile";

/* ================================================================
   App lock (รหัสผ่านเข้าแอป + ลืมรหัสผ่าน)
================================================================ */
export const AUTOLOCK_MS = 30000; // ออกจากแอปเกินกี่ ms แล้วล็อกอัตโนมัติ
export const LOCK_FAIL_KEY = "survival-budget-lockfail";
export const REC_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ตัดตัวที่สับสน (I O 0 1)

export type LockFail = { n: number; until: number };
export const readFail = (): LockFail => {
  try {
    const j = JSON.parse(localStorage.getItem(LOCK_FAIL_KEY) || "");
    if (typeof j?.n === "number" && typeof j?.until === "number") return j;
  } catch {
    /* ignore */
  }
  return { n: 0, until: 0 };
};
export const writeFail = (f: LockFail) => {
  try {
    localStorage.setItem(LOCK_FAIL_KEY, JSON.stringify(f));
  } catch {
    /* ignore */
  }
};
export const clearFail = () => {
  try {
    localStorage.removeItem(LOCK_FAIL_KEY);
  } catch {
    /* ignore */
  }
};

export const toHex = (u8: Uint8Array) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("");
export const randHex = (bytes: number) => {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return toHex(a);
};

// เก็บเฉพาะค่า hash (PBKDF2) ไม่เก็บรหัสจริง — ถ้าเปิดบน http ที่ไม่มี crypto.subtle จะ fallback เป็น hash ง่ายๆ
export async function hashWith(secret: string, salt: string, algo: "p" | "f"): Promise<string> {
  if (algo === "p") {
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, [
      "deriveBits",
    ]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: enc.encode(salt), iterations: 150000, hash: "SHA-256" },
      base,
      256
    );
    return "p:" + toHex(new Uint8Array(bits));
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const s = `${salt}:${secret}`;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return "f:" + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}
export const hashSecret = (secret: string, salt: string) =>
  hashWith(secret, salt, typeof crypto !== "undefined" && crypto.subtle ? "p" : "f");
export async function verifySecret(secret: string, salt: string, stored: string): Promise<boolean> {
  try {
    return (await hashWith(secret, salt, stored.startsWith("f:") ? "f" : "p")) === stored;
  } catch {
    return false;
  }
}

export function makeRecoveryCode(): string {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  const c = Array.from(a, (b) => REC_ALPHABET[b % 32]).join("");
  return `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8, 12)}`;
}
export const normRec = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
export const fmtRec = (s: string) => normRec(s).slice(0, 12).match(/.{1,4}/g)?.join("-") ?? "";

export function LockShell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white">
      <style>{`
        @keyframes pin-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
        .pin-shake{animation:pin-shake .45s ease-in-out}
      `}</style>
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-sm flex-col items-center px-6 pb-8 pt-6">
        {onBack ? (
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="flex h-11 w-11 items-center justify-center self-start rounded-full bg-white/10 text-white/80 active:bg-white/20"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div className="h-11" />
        )}
        <div className="flex w-full flex-1 flex-col items-center justify-center pb-6">{children}</div>
      </div>
    </div>
  );
}

export function LockHeader({
  icon,
  title,
  subtitle,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-1 ${
          danger
            ? "bg-rose-500/15 text-rose-300 ring-rose-400/30 shadow-[0_0_30px_rgba(244,63,94,0.35)]"
            : "bg-emerald-400/15 text-emerald-300 ring-emerald-300/30 shadow-[0_0_30px_rgb(var(--ac-400)/0.35)]"
        }`}
      >
        {icon}
      </div>
      <h1 className="mt-5 text-xl font-semibold">{title}</h1>
      {subtitle && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-white/60">{subtitle}</p>
      )}
    </div>
  );
}

export const PAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
export const KEY_CLS =
  "h-[72px] w-[72px] touch-manipulation select-none rounded-full border border-white/10 bg-white/10 text-[28px] font-light tabular-nums text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm transition duration-100 active:scale-90 active:border-emerald-300/40 active:bg-emerald-400/30";

// ปุ่มกดตัวเลขกลมๆ + จุดแสดงจำนวนหลัก
// onComplete คืน true = รหัสถูก/ผ่านขั้นนี้ (ผู้เรียกไปต่อ), false = สั่นแล้วล้างให้กรอกใหม่
export function PinPad({
  len,
  disabled = false,
  message,
  error = false,
  onType,
  onComplete,
}: {
  len: number;
  disabled?: boolean;
  message?: string;
  error?: boolean;
  onType?: () => void;
  onComplete: (pin: string) => boolean | Promise<boolean>;
}) {
  const t = useT();
  const [val, setVal] = useState("");
  const [bad, setBad] = useState(false);
  const busy = useRef(false);
  const cb = useRef(onComplete);
  cb.current = onComplete;

  const press = (d: string) => {
    if (disabled || busy.current) return;
    onType?.();
    setVal((v) => (v.length < len ? v + d : v));
  };
  const del = () => {
    if (disabled || busy.current) return;
    setVal((v) => v.slice(0, -1));
  };
  const pressRef = useRef(press);
  pressRef.current = press;
  const delRef = useRef(del);
  delRef.current = del;

  useEffect(() => {
    if (val.length !== len) return;
    const timer = setTimeout(async () => {
      busy.current = true;
      const ok = await cb.current(val);
      if (ok) return;
      setBad(true);
      try {
        navigator.vibrate(180);
      } catch {
        /* ไม่รองรับ */
      }
      setTimeout(() => {
        setBad(false);
        setVal("");
        busy.current = false;
      }, 450);
    }, 140);
    return () => clearTimeout(timer);
  }, [val, len]);

  // รองรับคีย์บอร์ดจริงบนคอม
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) pressRef.current(e.key);
      else if (e.key === "Backspace") delRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const red = bad || error;
  return (
    <div className="flex w-full flex-col items-center">
      <div className={`mt-8 flex h-4 items-center gap-4 ${bad ? "pin-shake" : ""}`}>
        {Array.from({ length: len }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-150 ${
              i < val.length
                ? red
                  ? "scale-110 border-rose-400 bg-rose-400"
                  : "scale-110 border-emerald-300 bg-emerald-300 shadow-[0_0_12px_rgb(var(--ac-300)/0.85)]"
                : "border-white/40"
            }`}
          />
        ))}
      </div>
      <p
        className={`mt-4 min-h-[1.25rem] text-center text-sm ${
          red ? "text-rose-300" : "text-white/60"
        }`}
        aria-live="polite"
      >
        {message}
      </p>
      <div
        className={`mt-6 grid grid-cols-3 gap-x-6 gap-y-4 transition-opacity ${
          disabled ? "opacity-40" : ""
        }`}
      >
        {PAD_KEYS.map((d) => (
          <button key={d} onClick={() => press(d)} className={KEY_CLS}>
            {d}
          </button>
        ))}
        <span />
        <button onClick={() => press("0")} className={KEY_CLS}>
          0
        </button>
        <button
          onClick={del}
          aria-label={t("common.delete")}
          className="flex h-[72px] w-[72px] touch-manipulation items-center justify-center rounded-full text-white/70 transition active:scale-90 active:bg-white/10"
        >
          <BackspaceIcon size={26} />
        </button>
      </div>
    </div>
  );
}

export type FlowMode = "set" | "change" | "disable" | "newrec" | "reset";
export type FlowStep = "verify" | "new" | "confirm" | "recovery";

// ขั้นตอนตั้ง/เปลี่ยน/ปิดรหัส และสร้างรหัสกู้คืน (ใช้ทั้งในตั้งค่า และตอนรีเซ็ตจากหน้าลืมรหัส)
export function PinFlow({
  mode,
  lock,
  onDone,
  onCancel,
}: {
  mode: FlowMode;
  lock: LockData | null;
  onDone: (l: LockData | null) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [step, setStep] = useState<FlowStep>(mode === "set" || mode === "reset" ? "new" : "verify");
  const [len, setLen] = useState<4 | 6>(lock?.len ?? 6);
  const [first, setFirst] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(false);
  const [pending, setPending] = useState<LockData | null>(null);
  const [rec, setRec] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const toRecovery = async (base: { len: 4 | 6; salt: string; hash: string }) => {
    const code = makeRecoveryCode();
    const rSalt = randHex(16);
    const rHash = await hashSecret(normRec(code), rSalt);
    setPending({ ...base, rSalt, rHash });
    setRec(code);
    setStep("recovery");
  };

  const clearMsg = () => {
    if (msg || err) {
      setMsg("");
      setErr(false);
    }
  };

  const onVerify = async (pin: string) => {
    if (!lock) return false;
    if (!(await verifySecret(pin, lock.salt, lock.hash))) {
      setMsg(t("lock.wrong"));
      setErr(true);
      return false;
    }
    setMsg("");
    setErr(false);
    if (mode === "disable") {
      onDone(null);
      return true;
    }
    if (mode === "newrec") {
      await toRecovery({ len: lock.len, salt: lock.salt, hash: lock.hash });
      return true;
    }
    setStep("new");
    return true;
  };

  const onNew = (pin: string) => {
    setFirst(pin);
    setMsg("");
    setErr(false);
    setStep("confirm");
    return true;
  };

  const onConfirm = async (pin: string) => {
    if (pin !== first) {
      setMsg(t("lock.mismatch"));
      setErr(true);
      setTimeout(() => setStep("new"), 600);
      return false;
    }
    const salt = randHex(16);
    const hash = await hashSecret(pin, salt);
    setMsg("");
    setErr(false);
    if (mode === "change" && lock) {
      onDone({ ...lock, len, salt, hash }); // คงรหัสกู้คืนเดิมไว้
      return true;
    }
    await toRecovery({ len, salt, hash });
    return true;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rec);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ไม่รองรับ — ให้จดเอง */
    }
  };

  if (step === "recovery") {
    return (
      <LockShell onBack={onCancel}>
        <LockHeader icon={<KeyRound size={26} />} title={t("lock.recTitle")} subtitle={t("lock.recDesc")} />
        <div className="mt-7 w-full select-all rounded-2xl border border-white/10 bg-white/10 px-3 py-5 text-center font-mono text-2xl font-semibold tracking-[0.1em]">
          {rec}
        </div>
        <button
          onClick={copy}
          className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 active:bg-white/20"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? t("lock.copied") : t("lock.copy")}
        </button>
        <label className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="h-5 w-5 accent-emerald-500"
          />
          {t("lock.saved")}
        </label>
        <button
          disabled={!saved || !pending}
          onClick={() => pending && onDone(pending)}
          className="mt-4 w-full rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white transition disabled:opacity-40 active:bg-emerald-600"
        >
          {t("common.done")}
        </button>
      </LockShell>
    );
  }

  const title =
    step === "verify"
      ? t(mode === "disable" ? "lock.disableAsk" : mode === "newrec" ? "lock.newRecAsk" : "lock.oldPin")
      : step === "new"
      ? t("lock.newPin")
      : t("lock.confirmPin");
  const subtitle = step === "new" && mode === "reset" ? t("lock.resetNew") : undefined;
  const onBack =
    step === "confirm"
      ? () => {
          setStep("new");
          setMsg("");
          setErr(false);
        }
      : onCancel;

  return (
    <LockShell onBack={onBack}>
      <LockHeader icon={<Lock size={26} />} title={title} subtitle={subtitle} />
      {step === "new" && (
        <div className="mt-5 inline-flex rounded-full bg-white/10 p-1 text-sm">
          {([4, 6] as const).map((n) => (
            <button
              key={n}
              onClick={() => setLen(n)}
              className={`rounded-full px-4 py-1.5 transition ${
                len === n ? "bg-white font-semibold text-slate-900" : "text-white/70"
              }`}
            >
              {t("lock.digits", { n })}
            </button>
          ))}
        </div>
      )}
      <PinPad
        key={`${step}-${len}`}
        len={step === "verify" && lock ? lock.len : len}
        message={msg}
        error={err}
        onType={clearMsg}
        onComplete={step === "verify" ? onVerify : step === "new" ? onNew : onConfirm}
      />
    </LockShell>
  );
}

export function LockScreen({
  lock,
  profile,
  onUnlock,
  onReset,
}: {
  lock: LockData;
  profile: Profile | null;
  onUnlock: () => void;
  onReset: (l: LockData) => void;
}) {
  const t = useT();
  const [view, setView] = useState<"pin" | "forgot" | "rec" | "wipe" | "reset">("pin");
  const [fail, setFail] = useState<LockFail>(readFail);
  const [now, setNow] = useState(() => Date.now());
  const [msg, setMsg] = useState("");
  const [recIn, setRecIn] = useState("");
  const [recBad, setRecBad] = useState(false);
  const [checking, setChecking] = useState(false);
  const [wipeAsk, setWipeAsk] = useState(false);

  // นับถอยหลังตอนโดนล็อกเพราะใส่ผิดหลายครั้ง
  useEffect(() => {
    if (fail.until <= Date.now()) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= fail.until) clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, [fail.until]);
  const wait = Math.max(0, Math.ceil((fail.until - now) / 1000));

  const tryPin = async (pin: string) => {
    if (wait > 0) return false;
    if (await verifySecret(pin, lock.salt, lock.hash)) {
      clearFail();
      onUnlock();
      return true;
    }
    // ผิดครบทุก 5 ครั้ง = รอ 30 วิ แล้วเพิ่มเท่าตัวทุกรอบ (สูงสุด 15 นาที)
    const n = fail.n + 1;
    const until = n % 5 === 0 ? Date.now() + Math.min(30 * 2 ** (n / 5 - 1), 900) * 1000 : 0;
    const nf = { n, until };
    writeFail(nf);
    setFail(nf);
    setNow(Date.now());
    setMsg(t("lock.wrong"));
    return false;
  };

  const checkRec = async () => {
    setChecking(true);
    const ok = await verifySecret(normRec(recIn), lock.rSalt, lock.rHash);
    setChecking(false);
    if (ok) setView("reset");
    else setRecBad(true);
  };

  const wipe = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LOCK_FAIL_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  if (view === "reset") {
    return (
      <PinFlow
        mode="reset"
        lock={lock}
        onCancel={() => setView("pin")}
        onDone={(l) => {
          clearFail();
          if (l) onReset(l);
        }}
      />
    );
  }

  if (view === "forgot") {
    return (
      <LockShell onBack={() => setView("pin")}>
        <LockHeader icon={<KeyRound size={26} />} title={t("lock.forgot")} subtitle={t("lock.forgotDesc")} />
        <button
          onClick={() => setView("rec")}
          className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-left active:bg-white/20"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
            <KeyRound size={20} />
          </span>
          <span className="font-semibold">{t("lock.useRec")}</span>
          <ChevronRight size={20} className="ml-auto text-white/40" />
        </button>
        <button
          onClick={() => setView("wipe")}
          className="mt-6 text-sm text-white/60 underline underline-offset-4 active:text-white"
        >
          {t("lock.noRec")}
        </button>
      </LockShell>
    );
  }

  if (view === "rec") {
    return (
      <LockShell onBack={() => setView("forgot")}>
        <LockHeader icon={<KeyRound size={26} />} title={t("lock.recEnter")} subtitle={t("lock.recEnterDesc")} />
        <input
          value={recIn}
          onChange={(e) => {
            setRecIn(fmtRec(e.target.value));
            setRecBad(false);
          }}
          placeholder="XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          className="mt-8 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-center font-mono text-xl tracking-widest text-white outline-none placeholder:text-white/30 focus:border-emerald-300"
        />
        <p className="mt-3 min-h-[1.25rem] text-sm text-rose-300">{recBad ? t("lock.recBad") : ""}</p>
        <button
          disabled={recIn.length < 14 || checking}
          onClick={checkRec}
          className="mt-3 w-full rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white transition disabled:opacity-40 active:bg-emerald-600"
        >
          {t("lock.verify")}
        </button>
      </LockShell>
    );
  }

  if (view === "wipe") {
    return (
      <LockShell
        onBack={() => {
          setWipeAsk(false);
          setView("forgot");
        }}
      >
        <LockHeader
          danger
          icon={<AlertTriangle size={26} />}
          title={t("lock.wipe")}
          subtitle={t("lock.wipeWarn")}
        />
        {!wipeAsk ? (
          <button
            onClick={() => setWipeAsk(true)}
            className="mt-8 w-full rounded-2xl border border-rose-400/40 bg-rose-500/10 py-3.5 font-semibold text-rose-200 active:bg-rose-500/20"
          >
            {t("lock.wipe")}
          </button>
        ) : (
          <div className="mt-8 w-full space-y-3">
            <button
              onClick={wipe}
              className="w-full rounded-2xl bg-rose-500 py-3.5 font-semibold text-white active:bg-rose-600"
            >
              {t("lock.wipeConfirm")}
            </button>
            <button
              onClick={() => setWipeAsk(false)}
              className="w-full rounded-2xl bg-white/10 py-3.5 text-white/80 active:bg-white/20"
            >
              {t("common.cancel")}
            </button>
          </div>
        )}
      </LockShell>
    );
  }

  return (
    <LockShell>
      <LockHeader
        icon={
          profile ? (
            <AvatarView avatar={profile.avatar} className="h-full w-full" />
          ) : (
            <Lock size={26} />
          )
        }
        title={t("lock.enter")}
        subtitle={profile?.name || undefined}
      />
      <PinPad
        len={lock.len}
        disabled={wait > 0}
        error={wait > 0 || !!msg}
        message={wait > 0 ? t("lock.wait", { s: wait }) : msg}
        onType={() => setMsg("")}
        onComplete={tryPin}
      />
      <button
        onClick={() => setView("forgot")}
        className="mt-8 text-sm text-white/70 underline-offset-4 transition active:text-white hover:underline"
      >
        {t("lock.forgot")}
      </button>
    </LockShell>
  );
}

// การ์ดตั้งค่ารหัสผ่านในหน้า Settings
export function LockSettings({
  lock,
  onLock,
}: {
  lock: LockData | null;
  onLock: (l: LockData | null) => void;
}) {
  const t = useT();
  const [flow, setFlow] = useState<FlowMode | null>(null);
  const row =
    "flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5 text-left font-medium text-slate-700 active:bg-slate-100";
  return (
    <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Lock size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-800">{t("lock.title")}</h2>
          <p className="text-xs text-slate-500">{t("lock.desc")}</p>
        </div>
        {lock && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {t("lock.on")}
          </span>
        )}
      </div>
      {!lock ? (
        <button
          onClick={() => setFlow("set")}
          className="w-full rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white active:bg-emerald-600"
        >
          {t("lock.enable")}
        </button>
      ) : (
        <div className="space-y-2">
          <button className={row} onClick={() => setFlow("change")}>
            <Lock size={18} className="text-slate-400" />
            {t("lock.change")}
          </button>
          <button className={row} onClick={() => setFlow("newrec")}>
            <KeyRound size={18} className="text-slate-400" />
            {t("lock.newRecovery")}
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3.5 text-left font-medium text-rose-600 active:bg-rose-100"
            onClick={() => setFlow("disable")}
          >
            <X size={18} />
            {t("lock.disable")}
          </button>
          <p className="px-1 pt-1 text-xs text-slate-400">{t("lock.autoNote")}</p>
        </div>
      )}
      {flow && (
        <PinFlow
          mode={flow}
          lock={lock}
          onCancel={() => setFlow(null)}
          onDone={(l) => {
            onLock(l);
            setFlow(null);
          }}
        />
      )}
    </section>
  );
}
