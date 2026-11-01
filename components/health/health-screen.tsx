"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Data } from "@/lib/types";
import { HealthData } from "@/lib/health-types";
import { resolveQuotas } from "@/lib/health-calc";
import { getHealth } from "@/lib/health-store";
import { useT } from "@/lib/i18n";
import { TodayTab } from "@/components/health/today-tab";
import { BodyTab } from "@/components/health/body-tab";
import { QuotaTab } from "@/components/health/quota-tab";
import { ProgressTab } from "@/components/health/progress-tab";

export type HealthTabId = "today" | "body" | "quota" | "progress";
// ขั้น 7b จะเพิ่มแท็บ "plan" (แผนกิน/ออกกำลังกาย/ตาราง) ในลิสต์นี้
const TABS: HealthTabId[] = ["today", "progress", "quota", "body"];

/* ================================================================
   หน้าสุขภาพ (เต็มจอ) — เก็บข้อมูลใน data.health
================================================================ */
export function HealthScreen({
  data,
  setData,
  todayKey,
  initialTab,
  onBack,
}: {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  todayKey: string;
  initialTab: HealthTabId;
  onBack: () => void;
}) {
  const t = useT();
  const [tab, setTab] = useState<HealthTabId>(initialTab);
  const h = getHealth(data);
  const year = new Date().getFullYear();
  const q = resolveQuotas(h.body, h.quotas, year);

  const setH = (fn: (h: HealthData) => HealthData) =>
    setData((d) => ({ ...d, health: fn(getHealth(d)) }));

  return (
    <main className="min-h-screen pb-16">
      <div className="mx-auto max-w-md px-4 pt-6">
        <header className="mb-4 flex items-center gap-2">
          <button
            onClick={onBack}
            aria-label={t("common.back")}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm active:bg-slate-100"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">{t("health.title")}</h1>
        </header>

        <nav className="sticky top-0 z-10 -mx-4 mb-4 flex gap-2 overflow-x-auto bg-slate-50/90 px-4 py-2 backdrop-blur">
          {TABS.map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                tab === id ? "bg-emerald-500 text-white" : "bg-white text-slate-600 shadow-sm"
              }`}
            >
              {t(`htab.${id}`)}
            </button>
          ))}
        </nav>

        {tab === "today" && <TodayTab h={h} setH={setH} todayKey={todayKey} q={q} />}
        {tab === "progress" && <ProgressTab h={h} setH={setH} todayKey={todayKey} q={q} />}
        {tab === "quota" && <QuotaTab h={h} setH={setH} q={q} year={year} />}
        {tab === "body" && <BodyTab h={h} setH={setH} todayKey={todayKey} year={year} />}
      </div>
    </main>
  );
}
