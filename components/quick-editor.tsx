"use client";

import { useState } from "react";
import {
  Wallet,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { QuickItem } from "@/lib/types";
import { LANG_IDX, useT, useLang } from "@/lib/i18n";
import { quickLabel, ICON_GROUPS, ICONS } from "@/lib/constants";
import { CatView, catFind } from "@/lib/categories";
import { fmt } from "@/lib/utils";

/* ================================================================
   Quick Button Editor
================================================================ */
export function QuickEditor({
  item,
  isNew,
  cats,
  onSave,
  onDelete,
  onClose,
}: {
  item: QuickItem;
  isNew: boolean;
  cats: CatView[];
  onSave: (q: QuickItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const initialLabel = quickLabel(item, t);
  const [label, setLabel] = useState(initialLabel);
  const [amountStr, setAmountStr] = useState(item.amount ? String(item.amount) : "");
  const [category, setCategory] = useState(catFind(cats, item.category).id);
  const [icon, setIcon] = useState(item.icon);
  const [g, setG] = useState(() => {
    const i = ICON_GROUPS.findIndex((x) => item.icon in x.icons);
    return i >= 0 ? i : 0;
  });

  const group = ICON_GROUPS[g];
  const Preview = ICONS[icon] ?? Wallet;
  const amountNum = Number(amountStr);
  const canSave = label.trim().length > 0 && amountNum > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">
            {isNew ? t("qe.new") : t("qe.edit")}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400" aria-label={t("common.close")}>
            <X size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-4 flex h-16 items-center justify-between rounded-2xl bg-slate-100 px-4">
          <span className="flex min-w-0 items-center gap-2 text-slate-700">
            <Preview size={20} className="shrink-0" />
            <span className="truncate font-medium">{label || t("setup.itemName")}</span>
          </span>
          <span className="ml-2 font-bold text-slate-800">
            {amountNum > 0 ? fmt(amountNum) : "0"}
          </span>
        </div>

        <div className="mb-3 flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t("setup.itemName")}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-500"
          />
          <input
            type="number"
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder={t("qe.baht")}
            className="w-24 rounded-xl border border-slate-200 px-3 py-3 text-right text-lg font-bold outline-none focus:border-emerald-500"
          />
        </div>

        <p className="mb-1 text-xs font-medium text-slate-500">{t("qe.category")}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-full px-3 py-2 text-sm ${
                category === c.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <p className="mb-1 text-xs font-medium text-slate-500">{t("qe.pickIcon")}</p>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {ICON_GROUPS.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setG(i)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm ${
                g === i ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t(`grp.${x.id}`)}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {group.presets.map((p) => {
            const name = p[LANG_IDX[lang]];
            return (
              <button
                key={p[0]}
                onClick={() => {
                  setLabel(name);
                  setIcon(p[4]);
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 active:bg-emerald-50"
              >
                {name}
              </button>
            );
          })}
        </div>

        <div className="mb-5 grid grid-cols-6 gap-2">
          {Object.entries(group.icons).map(([key, Ic]) => (
            <button
              key={key}
              onClick={() => setIcon(key)}
              aria-label={key}
              className={`flex h-12 items-center justify-center rounded-xl ${
                icon === key ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Ic size={20} />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {!isNew && (
            <button
              onClick={() => onDelete(item.id)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 active:bg-rose-100"
              aria-label={t("qe.delete")}
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            disabled={!canSave}
            onClick={() =>
              onSave({
                id: item.id,
                // ถ้าไม่ได้แก้ชื่อ เก็บชื่อเดิมไว้ (ปุ่มเริ่มต้นจะยังแปลภาษาตามระบบได้)
                label: label.trim() === initialLabel ? item.label : label.trim(),
                amount: amountNum,
                category,
                icon,
              })
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Check size={18} /> {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
