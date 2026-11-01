"use client";

import { useState } from "react";
import {
  Plus,
  X,
  ShieldCheck,
} from "lucide-react";
import { Data } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { FIXED_TH } from "@/lib/constants";
import { toKey, fromKey, addDays, diffDays, monthEndKey, fmt, uid } from "@/lib/utils";

/* ================================================================
   Setup (งบประมาณ)
================================================================ */
export function Setup({
  data,
  now,
  isEdit,
  onSave,
  onCancel,
}: {
  data: Data;
  now: Date;
  isEdit: boolean;
  onSave: (d: Data) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const todayKey = toKey(now);
  const defaultDaysLeft = Math.max(1, diffDays(now, fromKey(data.endDate)) + 1);

  const [budget, setBudget] = useState(String(data.budget));
  const [fixed, setFixed] = useState<{ id: string; name: string; amount: string }[]>(
    data.fixed.map((f) => ({
      id: f.id,
      name: FIXED_TH[f.id] === f.name ? t(`fixed.${f.id}`) : f.name,
      amount: f.amount ? String(f.amount) : "",
    }))
  );
  const [days, setDays] = useState(
    String(
      isEdit
        ? defaultDaysLeft
        : Math.max(1, diffDays(now, fromKey(monthEndKey(now))) + 1)
    )
  );

  const budgetNum = Number(budget) || 0;
  const fixedTotal = fixed.reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const net = budgetNum - fixedTotal;
  const daysNum = Math.max(1, Math.floor(Number(days) || 1));
  const perDay = net / daysNum;

  const submit = () => {
    if (budgetNum <= 0) return alert(t("setup.needBudget"));
    onSave({
      ...data,
      setupDone: true,
      budget: budgetNum,
      fixed: fixed
        .filter((f) => f.name.trim() || Number(f.amount))
        .map((f) => ({
          id: f.id,
          name: f.name.trim() || t("setup.unnamed"),
          amount: Number(f.amount) || 0,
        })),
      endDate: toKey(addDays(fromKey(todayKey), daysNum - 1)),
    });
  };

  return (
    <main className="min-h-screen pb-10">
      <div className="mx-auto max-w-md px-4 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEdit ? t("setup.titleEdit") : t("setup.titleFirst")}
            </h1>
            <p className="text-sm text-slate-500">Survival Mode · Daily Safe-to-Spend</p>
          </div>
        </div>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            {t("setup.budget")}
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold text-slate-800 outline-none focus:border-emerald-500"
          />
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">{t("setup.fixed")}</h2>
            <span className="text-sm font-semibold text-rose-500">−{fmt(fixedTotal)}</span>
          </div>
          <div className="space-y-2">
            {fixed.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <input
                  value={f.name}
                  placeholder={t("setup.itemName")}
                  onChange={(e) =>
                    setFixed((arr) => arr.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-base outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  value={f.amount}
                  placeholder="0"
                  onChange={(e) =>
                    setFixed((arr) => arr.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))
                  }
                  className="w-28 rounded-xl border border-slate-200 px-3 py-3 text-right text-base outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setFixed((arr) => arr.filter((_, j) => j !== i))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
                  aria-label={t("common.delete")}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setFixed((arr) => [...arr, { id: uid(), name: "", amount: "" }])}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 active:bg-slate-50"
          >
            <Plus size={16} /> {t("setup.addItem")}
          </button>
        </section>

        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-slate-600">
            {t("setup.days")}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-28 rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold outline-none focus:border-emerald-500"
            />
            <button
              onClick={() =>
                setDays(String(Math.max(1, diffDays(now, fromKey(monthEndKey(now))) + 1)))
              }
              className="rounded-xl bg-slate-100 px-3 py-3 text-sm font-medium text-slate-600 active:bg-slate-200"
            >
              {t("setup.toEnd")}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">{t("setup.daysHint")}</p>
        </section>

        <section className="mb-6 rounded-2xl bg-emerald-50 p-4">
          <div className="flex justify-between text-sm text-emerald-800">
            <span>{t("setup.net")}</span>
            <b>{fmt(net)} ฿</b>
          </div>
          <div className="mt-1 flex justify-between text-sm text-emerald-800">
            <span>{t("setup.perDay")}</span>
            <b>{fmt(Math.max(0, perDay))} ฿</b>
          </div>
          {net < 0 && <p className="mt-2 text-xs text-rose-600">{t("setup.negative")}</p>}
        </section>

        <div className="flex gap-3">
          {isEdit && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl bg-slate-200 py-4 text-base font-semibold text-slate-700 active:bg-slate-300"
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            onClick={submit}
            className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white active:bg-emerald-600"
          >
            {isEdit ? t("common.save") : t("setup.start")}
          </button>
        </div>
      </div>
    </main>
  );
}
