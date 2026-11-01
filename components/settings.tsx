"use client";

import {
  Wallet,
  Settings,
  Check,
  ChevronLeft,
  ChevronRight,
  Type,
  Languages,
} from "lucide-react";
import { Lang, LockData } from "@/lib/types";
import { LANGS, useT } from "@/lib/i18n";
import { FONTS, fontFamilyOf } from "@/lib/fonts";
import { PatternId, ThemeSettings } from "@/components/theme";
import { LockSettings } from "@/components/lock";

/* ================================================================
   Settings
================================================================ */
export function OptionRow({
  active,
  onClick,
  children,
  style,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const t = useT();
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={style}
      className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left transition ${
        active
          ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-[0_0_0_3px_rgb(var(--ac-400)/0.25),0_0_20px_rgb(var(--ac-500)/0.45)]"
          : "border-transparent bg-slate-50 text-slate-700 active:bg-slate-100"
      }`}
    >
      <span className={active ? "[text-shadow:0_0_10px_rgb(var(--ac-500)/0.55)]" : ""}>
        {children}
      </span>
      {active && (
        <span
          title={t("settings.active")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_12px_rgb(var(--ac-500)/0.8)]"
        >
          <Check size={16} strokeWidth={3} />
          <span className="sr-only">{t("settings.active")}</span>
        </span>
      )}
    </button>
  );
}

export function SettingsScreen({
  lang,
  font,
  lock,
  theme,
  pattern,
  onLang,
  onFont,
  onLock,
  onTheme,
  onPattern,
  onBudget,
  onBack,
}: {
  lang: Lang;
  font: string;
  lock: LockData | null;
  theme: string;
  pattern: string;
  onLang: (l: Lang) => void;
  onFont: (f: string) => void;
  onLock: (l: LockData | null) => void;
  onTheme: (id: string) => void;
  onPattern: (id: PatternId) => void;
  onBudget: () => void;
  onBack: () => void;
}) {
  const t = useT();
  return (
    <main className="min-h-screen pb-12">
      <div className="mx-auto max-w-md px-4 pt-6">
        <header className="mb-5 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-slate-100"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">{t("settings.title")}</h1>
        </header>

        {/* งบประมาณ */}
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
          <button
            onClick={onBudget}
            className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5 text-left active:bg-slate-100"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Wallet size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-slate-800">{t("setup.titleEdit")}</span>
              <span className="block text-xs text-slate-500">{t("settings.budgetDesc")}</span>
            </span>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </section>

        {/* รหัสผ่านเข้าแอป */}
        <LockSettings lock={lock} onLock={onLock} />

        {/* สีธีม + ลวดลาย */}
        <ThemeSettings theme={theme} pattern={pattern} onTheme={onTheme} onPattern={onPattern} />

        {/* ฟอนต์ */}
        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Type size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800">{t("settings.font")}</h2>
              <p className="text-xs text-slate-500">{t("settings.fontDesc")}</p>
            </div>
          </div>
          <div className="space-y-2">
            {FONTS.map((f) => (
              <OptionRow
                key={f.id}
                active={font === f.id}
                onClick={() => onFont(f.id)}
                style={{ fontFamily: fontFamilyOf(f.id) }}
              >
                <span className="block text-base font-semibold">{f.name}</span>
                <span className="block text-sm opacity-70">สวัสดี Hello Bonjour Äö ฿1,234</span>
              </OptionRow>
            ))}
          </div>
        </section>

        {/* ภาษา */}
        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Languages size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-slate-800">{t("settings.language")}</h2>
              <p className="text-xs text-slate-500">{t("settings.langDesc")}</p>
            </div>
          </div>
          <div className="space-y-2">
            {LANGS.map((l) => (
              <OptionRow key={l.id} active={lang === l.id} onClick={() => onLang(l.id)}>
                <span className="flex items-center gap-3 text-base font-semibold">
                  <span className="text-xl">{l.flag}</span>
                  {l.native}
                </span>
              </OptionRow>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
