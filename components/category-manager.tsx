"use client";

import { useState } from "react";
import { Plus, Trash2, X, Check, Wallet } from "lucide-react";
import { CustomCat } from "@/lib/types";
import { useT } from "@/lib/i18n";
import { ICON_GROUPS, ICONS } from "@/lib/constants";
import { OTHER_ID, CatView } from "@/lib/categories";
import { uid } from "@/lib/utils";

type Row = {
  id: string;
  name: string; // ชื่อที่แสดงในช่อง
  defaultName: string; // ชื่อแปลของหมวดเริ่มต้น (ถ้าไม่แก้ จะไม่เก็บชื่อ เพื่อให้แปลภาษาตามระบบได้)
  icon: string;
  budget: string;
  builtin: boolean;
};

/* ================================================================
   จัดการหมวดหมู่ + ตั้งงบรายหมวด (bottom sheet)
================================================================ */
export function CategoryManager({
  cats,
  budgets,
  onSave,
  onClose,
}: {
  cats: CatView[];
  budgets: Record<string, number>;
  onSave: (cats: CustomCat[], budgets: Record<string, number>) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [rows, setRows] = useState<Row[]>(() =>
    cats.map((c) => ({
      id: c.id,
      name: c.name,
      defaultName: c.builtin ? t(`cat.${c.id}`) : "",
      icon: iconKeyOf(c),
      budget: budgets[c.id] ? String(budgets[c.id]) : "",
      builtin: c.builtin,
    }))
  );
  const [picker, setPicker] = useState<string | null>(null); // id แถวที่กำลังเลือกไอคอน
  const [grp, setGrp] = useState(0);
  const [err, setErr] = useState(false);

  const patch = (id: string, p: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const remove = (r: Row) => {
    if (!confirm(t("cm.delConfirm", { name: r.name || t("cm.newName") }))) return;
    setRows((rs) => rs.filter((x) => x.id !== r.id));
    if (picker === r.id) setPicker(null);
  };

  const add = () => {
    const id = "c_" + uid();
    // แทรกก่อน "อื่นๆ" เสมอ ให้ "อื่นๆ" อยู่ท้ายสุด
    setRows((rs) => {
      const row: Row = { id, name: "", defaultName: "", icon: "Wallet", budget: "", builtin: false };
      const i = rs.findIndex((r) => r.id === OTHER_ID);
      return i < 0 ? [...rs, row] : [...rs.slice(0, i), row, ...rs.slice(i)];
    });
    setPicker(id);
  };

  const save = () => {
    if (rows.some((r) => !r.name.trim())) {
      setErr(true);
      return;
    }
    const list: CustomCat[] = rows.map((r) => ({
      id: r.id,
      icon: r.icon,
      name: r.builtin && r.name.trim() === r.defaultName ? undefined : r.name.trim().slice(0, 24),
    }));
    const b: Record<string, number> = {};
    for (const r of rows) {
      const n = Number(r.budget);
      if (n > 0) b[r.id] = n;
    }
    onSave(list, b);
  };

  const group = ICON_GROUPS[grp];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{t("cm.title")}</h3>
          <button onClick={onClose} className="p-2 text-slate-400" aria-label={t("common.close")}>
            <X size={20} />
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-400">{t("cm.hint")}</p>

        <ul className="mb-3 space-y-2">
          {rows.map((r) => {
            const Icon = ICONS[r.icon] ?? Wallet;
            const open = picker === r.id;
            return (
              <li key={r.id} className="rounded-2xl bg-slate-50 p-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPicker(open ? null : r.id)}
                    aria-label={t("qe.pickIcon")}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      open ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    <Icon size={20} />
                  </button>
                  <input
                    value={r.name}
                    onChange={(e) => patch(r.id, { name: e.target.value })}
                    maxLength={24}
                    placeholder={t("cm.name")}
                    className={`min-w-0 flex-1 rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 ${
                      err && !r.name.trim() ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={r.budget}
                    onChange={(e) => patch(r.id, { budget: e.target.value })}
                    placeholder={t("cm.budget")}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                  />
                  {r.id === OTHER_ID ? (
                    <span className="w-9 shrink-0" title={t("cm.lockedOther")} />
                  ) : (
                    <button
                      onClick={() => remove(r)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-rose-400 active:bg-rose-50"
                      aria-label={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {open && (
                  <div className="mt-2">
                    <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                      {ICON_GROUPS.map((x, i) => (
                        <button
                          key={x.id}
                          onClick={() => setGrp(i)}
                          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
                            grp === i ? "bg-slate-800 text-white" : "bg-white text-slate-600"
                          }`}
                        >
                          {t(`grp.${x.id}`)}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {Object.entries(group.icons).map(([key, Ic]) => (
                        <button
                          key={key}
                          onClick={() => {
                            patch(r.id, { icon: key });
                            setPicker(null);
                          }}
                          aria-label={key}
                          className={`flex h-11 items-center justify-center rounded-xl ${
                            r.icon === key ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
                          }`}
                        >
                          <Ic size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <button
          onClick={add}
          className="mb-4 flex w-full items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-slate-500 active:bg-slate-50"
        >
          <Plus size={18} /> {t("cm.add")}
        </button>

        {err && <p className="mb-3 text-center text-sm text-rose-500">{t("cm.emptyName")}</p>}

        <button
          onClick={save}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600"
        >
          <Check size={18} /> {t("common.save")}
        </button>
      </div>
    </div>
  );
}

// หา key ไอคอน (ชื่อใน ICONS) จาก component ของหมวด
function iconKeyOf(c: CatView): string {
  const hit = Object.entries(ICONS).find(([, Ic]) => Ic === c.icon);
  return hit ? hit[0] : "Wallet";
}
