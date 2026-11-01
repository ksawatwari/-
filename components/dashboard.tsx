"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  Pencil,
  Settings,
  Plus,
  X,
  Check,
  Flame,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Tx, QuickItem, Data, CustomCat } from "@/lib/types";
import { useT, getLocale } from "@/lib/i18n";
import { quickLabel, noteLabel, ICONS } from "@/lib/constants";
import { rawCats, toViews, catFind } from "@/lib/categories";
import { toKey, fromKey, diffDays, fmt, uid, defaultData } from "@/lib/utils";
import { AvatarView } from "@/components/profile";
import { QuickEditor } from "@/components/quick-editor";
import { SlipScanner } from "@/components/slip-scanner";
import { CategoryBudgets } from "@/components/category-budgets";
import { CategoryManager } from "@/components/category-manager";
import { TxList } from "@/components/tx-list";

/* ================================================================
   Dashboard
================================================================ */
export function Dashboard({
  data,
  setData,
  now,
  onOpenSettings,
  onOpenProfile,
}: {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  now: Date;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}) {
  const t = useT();
  const todayKey = toKey(now);
  const cats = toViews(rawCats(data), t);
  const [catMgr, setCatMgr] = useState(false);

  const calc = useMemo(() => {
    const fixedTotal = data.fixed.reduce((s, f) => s + f.amount, 0);
    const net = data.budget - fixedTotal;
    // รายรับ (income) นับเป็นลบ = เพิ่มยอดคงเหลือ
    const signed = (x: Tx) => (x.income ? -x.amount : x.amount);
    const spentTotal = data.txs.reduce((s, x) => s + signed(x), 0);
    const spentToday = data.txs
      .filter((x) => x.dateKey === todayKey)
      .reduce((s, x) => s + signed(x), 0);
    const spentBeforeToday = spentTotal - spentToday;

    const rawDays = diffDays(now, fromKey(data.endDate)) + 1;
    const expired = rawDays < 1;
    const daysLeft = Math.max(1, rawDays);

    // งบที่เหลือ ณ เช้าวันนี้ ÷ จำนวนวันที่เหลือ (รวมวันนี้)
    // ใช้ไม่หมดเมื่อวาน → ยอดทบเข้ามาเอง / ใช้เกิน → โควตาลดลงเอง
    const allowanceToday = (net - spentBeforeToday) / daysLeft;
    const remainingToday = allowanceToday - spentToday;
    const remainingNet = net - spentTotal;
    const tomorrow = daysLeft > 1 ? remainingNet / (daysLeft - 1) : 0;
    const pct = net > 0 ? (remainingNet / net) * 100 : 0;

    return {
      net,
      spentTotal,
      spentToday,
      daysLeft,
      expired,
      allowanceToday,
      remainingToday,
      remainingNet,
      tomorrow,
      pct,
    };
  }, [data, now, todayKey]);

  const zone: "green" | "yellow" | "red" =
    calc.pct > 60 ? "green" : calc.pct >= 25 ? "yellow" : "red";

  const zoneStyle = {
    green: { bar: "bg-emerald-500", text: "text-emerald-600", emoji: "🟢", bg: "bg-emerald-50" },
    yellow: { bar: "bg-amber-400", text: "text-amber-600", emoji: "🟡", bg: "bg-amber-50" },
    red: { bar: "bg-rose-500", text: "text-rose-600", emoji: "🔴", bg: "bg-rose-50" },
  }[zone];

  const showSurvival = zone === "red" || calc.daysLeft <= 5;

  // Quick log
  const addTx = (amount: number, category: string, note = "", icon?: string) => {
    if (!(amount > 0)) return;
    const tx: Tx = {
      id: uid(),
      amount,
      category,
      note,
      dateKey: todayKey,
      ts: Date.now(),
      icon,
    };
    setData((d) => ({ ...d, txs: [tx, ...d.txs] }));
  };

  const [amountStr, setAmountStr] = useState("");
  const [categoryPick, setCategory] = useState("food");
  // ถ้าหมวดที่เลือกไว้ถูกลบไปแล้ว ให้ใช้หมวดแรกแทน
  const category = cats.some((c) => c.id === categoryPick) ? categoryPick : cats[0].id;
  const [note, setNote] = useState("");

  const submitCustom = () => {
    const n = Number(amountStr);
    if (!(n > 0)) return;
    addTx(n, category, note.trim());
    setAmountStr("");
    setNote("");
  };

  // Quick button customization
  const [quickEdit, setQuickEdit] = useState(false);
  const [qEditor, setQEditor] = useState<{ item: QuickItem; isNew: boolean } | null>(null);

  const saveQuick = (q: QuickItem) => {
    setData((d) => {
      const exists = d.quick.some((x) => x.id === q.id);
      return {
        ...d,
        quick: exists ? d.quick.map((x) => (x.id === q.id ? q : x)) : [...d.quick, q],
      };
    });
    setQEditor(null);
  };
  const deleteQuick = (id: string) => {
    setData((d) => ({ ...d, quick: d.quick.filter((x) => x.id !== id) }));
    setQEditor(null);
  };

  // Edit transaction
  const [editing, setEditing] = useState<Tx | null>(null);
  const [eAmount, setEAmount] = useState("");
  const [eCat, setECat] = useState("food");
  const [eNote, setENote] = useState("");

  const openEdit = (x: Tx) => {
    setEditing(x);
    setEAmount(String(x.amount));
    setECat(catFind(cats, x.category).id);
    setENote(noteLabel(x.note, t));
  };
  const saveEdit = () => {
    const n = Number(eAmount);
    if (!editing || !(n > 0)) return;
    const original = noteLabel(editing.note, t);
    setData((d) => ({
      ...d,
      txs: d.txs.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              amount: n,
              category: eCat,
              note: eNote.trim() === original ? x.note : eNote.trim(),
            }
          : x
      ),
    }));
    setEditing(null);
  };
  const removeTx = (id: string) =>
    setData((d) => ({ ...d, txs: d.txs.filter((x) => x.id !== id) }));

  const resetAll = () => {
    if (!confirm(t("reset.confirm"))) return;
    setData({
      ...defaultData(),
      setupDone: false,
      budget: data.budget,
      fixed: data.fixed,
      quick: data.quick,
      profile: data.profile,
      lang: data.lang,
      font: data.font,
      lock: data.lock,
      theme: data.theme,
      pattern: data.pattern,
      categories: data.categories,
      catBudgets: data.catBudgets,
    });
  };

  const bulkMove = (ids: string[], catId: string) =>
    setData((d) => ({
      ...d,
      txs: d.txs.map((x) => (ids.includes(x.id) ? { ...x, category: catId } : x)),
    }));
  const bulkDelete = (ids: string[]) =>
    setData((d) => ({ ...d, txs: d.txs.filter((x) => !ids.includes(x.id)) }));
  const saveCats = (list: CustomCat[], budgets: Record<string, number>) => {
    setData((d) => ({ ...d, categories: list, catBudgets: budgets }));
    setCatMgr(false);
  };

  const perMeal = Math.max(0, calc.allowanceToday) / 3;
  const perMealLeft = Math.max(0, calc.remainingToday) / 3;
  const barWidth = Math.max(0, Math.min(100, calc.pct));

  return (
    <main className="min-h-screen pb-16">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Profile banner */}
        <div className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 p-4 shadow-md">
          <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15" />
          <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <button
              onClick={onOpenProfile}
              aria-label={t("profile.edit")}
              className="shrink-0 rounded-full active:scale-95"
            >
              <AvatarView
                avatar={data.profile?.avatar ?? { kind: "default" }}
                className="h-16 w-16 border-4 border-white/70 shadow"
              />
            </button>
            <p className="min-w-0 truncate text-xl font-semibold text-white">
              {t("banner.hello", { name: data.profile?.name ?? "" })}
            </p>
          </div>
        </div>

        {/* Header */}
        <header className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">
              {now.toLocaleDateString(getLocale(), { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-lg font-bold text-slate-800">
              {t(calc.daysLeft === 1 ? "dash.daysLeft1" : "dash.daysLeft", { n: calc.daysLeft })}
            </h1>
          </div>
          <button
            onClick={onOpenSettings}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm active:bg-slate-100"
            aria-label={t("settings.title")}
          >
            <Settings size={20} />
          </button>
        </header>

        {calc.expired && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{t("dash.expired")}</span>
          </div>
        )}

        {/* Safe to spend */}
        <section className={`mb-4 rounded-3xl p-5 shadow-sm ${zoneStyle.bg}`}>
          <p className="text-sm font-medium text-slate-500">{t("dash.safe")}</p>
          <p
            className={`mt-1 text-5xl font-extrabold tracking-tight ${
              calc.remainingToday < 0 ? "text-rose-600" : zoneStyle.text
            }`}
          >
            {calc.remainingToday < 0 ? "−" : ""}฿{fmt(Math.abs(calc.remainingToday))}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {t("dash.todayBudget", {
              a: fmt(Math.max(0, calc.allowanceToday)),
              b: fmt(calc.spentToday),
            })}
          </p>
          {calc.daysLeft > 1 && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <TrendingUp size={14} className="shrink-0" />
              <span>
                {t("dash.tomorrow", { n: fmt(Math.max(0, calc.tomorrow)) })}
                {calc.remainingToday > 0 && ` ${t("dash.carried")}`}
                {calc.remainingToday < 0 && ` ${t("dash.cut")}`}
              </span>
            </p>
          )}
        </section>

        {/* Survival bar */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className={`font-semibold ${zoneStyle.text}`}>
              {zoneStyle.emoji} {t(`zone.${zone}`)}
            </span>
            <span className="text-slate-500">{Math.max(0, Math.round(calc.pct))}%</span>
          </div>
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${zoneStyle.bar}`}
              style={{ width: `${barWidth}%` }}
            />
            <div className="absolute inset-y-0 left-[25%] w-px bg-white/80" />
            <div className="absolute inset-y-0 left-[60%] w-px bg-white/80" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{t("bar.left", { n: fmt(calc.remainingNet) })}</span>
            <span>{t("bar.of", { n: fmt(calc.net) })}</span>
          </div>
        </section>

        {/* Survival insights */}
        {showSurvival && (
          <section className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="mb-1 flex items-center gap-2 font-semibold text-rose-700">
              <Flame size={18} /> {t("surv.title")}
            </div>
            <p className="text-sm font-semibold text-rose-800">
              {t("surv.line", {
                a: fmt(Math.max(0, calc.allowanceToday)),
                b: fmt(perMeal),
              })}
            </p>
            <p className="mt-1 text-xs text-rose-700">
              {t("surv.today", {
                a: fmt(Math.max(0, calc.remainingToday)),
                b: fmt(perMealLeft),
              })}
            </p>
            {calc.remainingNet < 0 && (
              <p className="mt-1 text-xs font-semibold text-rose-700">
                {t("surv.over", { n: fmt(Math.abs(calc.remainingNet)) })}
              </p>
            )}
          </section>
        )}

        {/* Category budgets */}
        <CategoryBudgets
          cats={cats}
          budgets={data.catBudgets ?? {}}
          txs={data.txs}
          onManage={() => setCatMgr(true)}
        />

        {/* Slip scanner */}
        <SlipScanner
          existing={data.txs}
          now={now}
          onSaveTxs={(list) =>
            setData((d) => ({
              ...d,
              txs: [...list, ...d.txs].sort((a, b) => b.ts - a.ts),
            }))
          }
        />

        {/* Quick log */}
        <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-600">
              {quickEdit ? t("quick.editTitle") : t("quick.title")}
            </h2>
            <button
              onClick={() => setQuickEdit((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium ${
                quickEdit ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {quickEdit ? <Check size={14} /> : <Pencil size={14} />}
              {quickEdit ? t("common.done") : t("quick.customize")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.quick.map((q) => {
              const Icon = ICONS[q.icon] ?? Wallet;
              return (
                <button
                  key={q.id}
                  onClick={() =>
                    quickEdit
                      ? setQEditor({ item: q, isNew: false })
                      : addTx(q.amount, q.category, q.label, q.icon)
                  }
                  className={`flex h-16 items-center justify-between rounded-2xl px-4 text-left active:scale-95 ${
                    quickEdit
                      ? "border-2 border-dashed border-emerald-300 bg-emerald-50"
                      : "bg-slate-100 active:bg-emerald-100"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 text-slate-700">
                    <Icon size={20} className="shrink-0" />
                    <span className="truncate font-medium">{quickLabel(q, t)}</span>
                  </span>
                  <span className="ml-2 font-bold text-slate-800">{fmt(q.amount)}</span>
                </button>
              );
            })}
            {quickEdit && (
              <button
                onClick={() =>
                  setQEditor({
                    item: { id: uid(), label: "", amount: 0, category: "food", icon: "Utensils" },
                    isNew: true,
                  })
                }
                className="flex h-16 items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 active:bg-slate-50"
              >
                <Plus size={18} /> {t("quick.add")}
              </button>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {cats.map((c) => {
                const Icon = c.icon;
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm ${
                      active ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={14} /> {c.name}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder={t("quick.amountPh")}
                className="w-32 rounded-xl border border-slate-200 px-3 py-3 text-lg font-bold outline-none focus:border-emerald-500"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitCustom()}
                placeholder={t("quick.notePh")}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">{t("tag.hint")}</p>
            <button
              onClick={submitCustom}
              disabled={!(Number(amountStr) > 0)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-base font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Plus size={20} /> {t("quick.log")}
            </button>
          </div>
        </section>

        {/* Recent + search */}
        <TxList
          txs={data.txs}
          cats={cats}
          todayKey={todayKey}
          onEdit={openEdit}
          onRemove={removeTx}
          onBulkMove={bulkMove}
          onBulkDelete={bulkDelete}
        />

        <button
          onClick={resetAll}
          className="mx-auto mt-6 flex items-center gap-1 text-xs text-slate-400 active:text-slate-600"
        >
          <RotateCcw size={12} /> {t("reset.btn")}
        </button>
      </div>

      {qEditor && (
        <QuickEditor
          key={qEditor.item.id}
          item={qEditor.item}
          isNew={qEditor.isNew}
          cats={cats}
          onSave={saveQuick}
          onDelete={deleteQuick}
          onClose={() => setQEditor(null)}
        />
      )}

      {catMgr && (
        <CategoryManager
          cats={cats}
          budgets={data.catBudgets ?? {}}
          onSave={saveCats}
          onClose={() => setCatMgr(false)}
        />
      )}

      {/* Edit sheet */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={() => setEditing(null)}>
          <div
            className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t("edit.title")}</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-2 text-slate-400"
                aria-label={t("common.close")}
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={eAmount}
              onChange={(e) => setEAmount(e.target.value)}
              className="mb-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-2xl font-bold outline-none focus:border-emerald-500"
            />
            <div className="mb-3 flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setECat(c.id)}
                  className={`rounded-full px-3 py-2 text-sm ${
                    eCat === c.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <input
              value={eNote}
              onChange={(e) => setENote(e.target.value)}
              placeholder={t("edit.notePh")}
              className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            />
            <button
              onClick={saveEdit}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600"
            >
              <Check size={18} /> {t("edit.save")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
