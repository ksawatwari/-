"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, SlidersHorizontal, ListChecks, X, Check } from "lucide-react";
import { Tx } from "@/lib/types";
import { useT, getLocale } from "@/lib/i18n";
import { ICONS, noteLabel } from "@/lib/constants";
import { CatView, catFind } from "@/lib/categories";
import { TxFilter, emptyFilter, isFiltered, matchTx, summarize, tagsOf, stripTags } from "@/lib/search";
import { fmt, fromKey } from "@/lib/utils";

const PAGE = 30;

/* ================================================================
   รายการล่าสุด + ค้นหา / ตัวกรอง / แท็ก / เลือกหลายรายการ
================================================================ */
export function TxList({
  txs,
  cats,
  todayKey,
  onEdit,
  onRemove,
  onBulkMove,
  onBulkDelete,
}: {
  txs: Tx[];
  cats: CatView[];
  todayKey: string;
  onEdit: (x: Tx) => void;
  onRemove: (id: string) => void;
  onBulkMove: (ids: string[], catId: string) => void;
  onBulkDelete: (ids: string[]) => void;
}) {
  const t = useT();
  const [f, setF] = useState<TxFilter>(emptyFilter);
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [selecting, setSelecting] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);

  const active = isFiltered(f);
  const upd = (p: Partial<TxFilter>) => {
    setF((x) => ({ ...x, ...p }));
    setLimit(PAGE);
  };

  const rows = txs.map((x) => {
    const cat = catFind(cats, x.category);
    const note = x.note ? noteLabel(x.note, t) : "";
    return { x, cat, note, tags: tagsOf(note), hay: `${note} ${cat.name}` };
  });
  const matched = active ? rows.filter((r) => matchTx(r.x, f, r.hay, r.cat.id)) : rows;
  const shown = matched.slice(0, limit);
  const sum = summarize(matched.map((r) => r.x));

  const toggleCat = (id: string) =>
    upd({ cats: f.cats.includes(id) ? f.cats.filter((c) => c !== id) : [...f.cats, id] });

  const toggleSel = (id: string) =>
    setSel((s) => (s.includes(id) ? s.filter((v) => v !== id) : [...s, id]));

  const exitSelect = () => {
    setSelecting(false);
    setSel([]);
    setMoving(false);
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-600">{t("recent.title")}</h2>
        {txs.length > 0 && (
          <button
            onClick={() => (selecting ? exitSelect() : setSelecting(true))}
            className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium ${
              selecting ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {selecting ? <Check size={14} /> : <ListChecks size={14} />}
            {selecting ? t("common.done") : t("tl.select")}
          </button>
        )}
      </div>

      {txs.length > 0 && (
        <>
          <div className="mb-2 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={f.q}
                onChange={(e) => upd({ q: e.target.value })}
                placeholder={t("tl.search")}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-label={t("tl.filters")}
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl ${
                showFilters || f.cats.length || f.type !== "all" || f.from || f.to || f.min || f.max
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {showFilters && (
            <div className="mb-3 space-y-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex gap-2">
                {(["all", "out", "in"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => upd({ type: k })}
                    className={`flex-1 rounded-full py-2 text-sm ${
                      f.type === k ? "bg-slate-800 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {t(`tl.${k}`)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {cats.map((c) => {
                  const Icon = c.icon;
                  const on = f.cats.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCat(c.id)}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${
                        on ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
                      }`}
                    >
                      <Icon size={14} /> {c.name}
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">
                  {t("tl.from")}
                  <input
                    type="date"
                    value={f.from}
                    onChange={(e) => upd({ from: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="text-xs text-slate-500">
                  {t("tl.to")}
                  <input
                    type="date"
                    value={f.to}
                    onChange={(e) => upd({ to: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="text-xs text-slate-500">
                  {t("tl.min")}
                  <input
                    type="number"
                    inputMode="decimal"
                    value={f.min}
                    onChange={(e) => upd({ min: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="text-xs text-slate-500">
                  {t("tl.max")}
                  <input
                    type="number"
                    inputMode="decimal"
                    value={f.max}
                    onChange={(e) => upd({ max: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </label>
              </div>
            </div>
          )}

          {active && (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                {t("tl.result", { n: matched.length })}
                {sum.out > 0 && ` · ${t("tl.sumOut", { n: fmt(sum.out) })}`}
                {sum.inc > 0 && ` · ${t("tl.sumIn", { n: fmt(sum.inc) })}`}
              </span>
              <button
                onClick={() => setF(emptyFilter())}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"
              >
                <X size={12} /> {t("tl.clear")}
              </button>
            </div>
          )}
        </>
      )}

      {txs.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t("recent.empty")}</p>
      ) : matched.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{t("tl.noMatch")}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {shown.map(({ x, cat, note, tags }) => {
            const Icon = (x.icon && ICONS[x.icon]) || cat.icon;
            const isToday = x.dateKey === todayKey;
            const picked = sel.includes(x.id);
            const title = stripTags(note) || cat.name;
            return (
              <li key={x.id} className="flex items-center gap-3 py-3">
                {selecting && (
                  <button
                    onClick={() => toggleSel(x.id)}
                    aria-label={t("tl.select")}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                      picked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                    }`}
                  >
                    {picked && <Check size={14} />}
                  </button>
                )}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{title}</p>
                  <p className="text-xs text-slate-400">
                    {isToday
                      ? t("recent.today")
                      : fromKey(x.dateKey).toLocaleDateString(getLocale(), {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                    ·{" "}
                    {new Date(x.ts).toLocaleTimeString(getLocale(), {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {cat.name}
                  </p>
                  {tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tags.map((tg) => (
                        <button
                          key={tg}
                          onClick={() => upd({ q: "#" + tg })}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-600"
                        >
                          #{tg}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`font-bold ${x.income ? "text-emerald-600" : "text-slate-800"}`}>
                  {x.income ? "+" : "−"}
                  {fmt(x.amount)}
                </span>
                {!selecting && (
                  <>
                    <button
                      onClick={() => onEdit(x)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
                      aria-label={t("common.edit")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onRemove(x.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-400 active:bg-rose-50"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {matched.length > limit && (
        <button
          onClick={() => setLimit((n) => n + PAGE)}
          className="mt-3 w-full rounded-xl bg-slate-100 py-2.5 text-sm text-slate-600 active:bg-slate-200"
        >
          {t("tl.more")} ({matched.length - limit})
        </button>
      )}

      {selecting && (
        <div className="sticky bottom-3 mt-4 rounded-2xl bg-slate-800 p-3 text-white shadow-lg">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>{t("tl.selected", { n: sel.length })}</span>
            <button
              onClick={() => setSel(sel.length === matched.length ? [] : matched.map((r) => r.x.id))}
              className="text-emerald-300"
            >
              {t("tl.selAll")}
            </button>
          </div>
          {moving ? (
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onBulkMove(sel, c.id);
                    exitSelect();
                  }}
                  className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  {c.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                disabled={sel.length === 0}
                onClick={() => setMoving(true)}
                className="flex-1 rounded-xl bg-white/15 py-2.5 text-sm font-medium disabled:opacity-40"
              >
                {t("tl.move")}
              </button>
              <button
                disabled={sel.length === 0}
                onClick={() => {
                  if (!confirm(t("tl.delConfirm", { n: sel.length }))) return;
                  onBulkDelete(sel);
                  exitSelect();
                }}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 text-sm font-medium disabled:opacity-40"
              >
                {t("tl.delSel")}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
