"use client";

import { useState } from "react";
import { fmt } from "@/lib/utils";

/* กราฟ SVG เบาๆ (ซีรีส์เดียว → ไม่ต้องมี legend ชื่อกราฟบอกอยู่แล้ว)
   เส้นกริดจาง, เส้น 2px, แท่งมุมโค้งมนที่ปลาย, แตะที่จุด/แท่งเพื่อดูค่า, มีตารางสำรองสำหรับ screen reader */

const W = 320;
const H = 150;
const PAD = { l: 34, r: 8, t: 12, b: 22 };

function niceRange(min: number, max: number): [number, number] {
  if (max - min < 1) {
    max = min + 1;
  }
  const pad = (max - min) * 0.15;
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

export function WeightLine({
  points,
  target,
  unit = "kg",
  label,
}: {
  points: { dateKey: string; kg: number }[];
  target?: number;
  unit?: string;
  label: string;
}) {
  const [sel, setSel] = useState<number | null>(null);
  if (points.length === 0) return null;
  const vals = points.map((p) => p.kg).concat(target ? [target] : []);
  const [lo, hi] = niceRange(Math.min(...vals), Math.max(...vals));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * ih;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.kg).toFixed(1)}`).join(" ");
  const ticks = [lo, (lo + hi) / 2, hi];
  const short = (k: string) => k.slice(5).replace("-", "/");
  const s = sel !== null ? points[sel] : null;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tk)} y2={y(tk)} className="stroke-slate-100" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(tk) + 3} textAnchor="end" className="fill-slate-400" fontSize={9}>
              {Math.round(tk * 10) / 10}
            </text>
          </g>
        ))}
        {target ? (
          <g>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(target)}
              y2={y(target)}
              className="stroke-slate-400"
              strokeWidth={1}
              strokeDasharray="4 3"
            />
            <text x={W - PAD.r} y={y(target) - 4} textAnchor="end" className="fill-slate-500" fontSize={9}>
              🎯 {target}
            </text>
          </g>
        ) : null}
        <path d={d} fill="none" className="stroke-emerald-500" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.dateKey} onClick={() => setSel(sel === i ? null : i)} className="cursor-pointer">
            <circle cx={x(i)} cy={y(p.kg)} r={14} fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(p.kg)}
              r={sel === i ? 5 : 3.5}
              className="fill-emerald-500 stroke-white"
              strokeWidth={2}
            />
          </g>
        ))}
        <text x={PAD.l} y={H - 6} className="fill-slate-400" fontSize={9}>
          {short(points[0].dateKey)}
        </text>
        <text x={W - PAD.r} y={H - 6} textAnchor="end" className="fill-slate-400" fontSize={9}>
          {short(points[points.length - 1].dateKey)}
        </text>
      </svg>
      {s && (
        <p className="text-center text-xs text-slate-500">
          {short(s.dateKey)} · <b className="text-slate-700">{s.kg} {unit}</b>
        </p>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.dateKey}>
              <td>{p.dateKey}</td>
              <td>{p.kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KcalBars({
  days,
  values,
  target,
  label,
}: {
  days: string[]; // dateKey
  values: number[];
  target: number;
  label: string;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(target * 1.15, ...values, 1);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const slot = iw / days.length;
  const bw = Math.min(26, slot * 0.55);
  const y = (v: number) => PAD.t + (1 - v / max) * ih;
  const ticks = [0, Math.round(max / 2 / 100) * 100, Math.round(max / 100) * 100];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tk)} y2={y(tk)} className="stroke-slate-100" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(tk) + 3} textAnchor="end" className="fill-slate-400" fontSize={9}>
              {fmt(tk)}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const cx = PAD.l + slot * i + slot / 2;
          const over = v > target * 1.1;
          const h = Math.max(0, (v / max) * ih);
          return (
            <g key={days[i]} onClick={() => setSel(sel === i ? null : i)} className="cursor-pointer">
              <rect x={cx - slot / 2} y={PAD.t} width={slot} height={ih} fill="transparent" />
              {v > 0 && (
                <rect
                  x={cx - bw / 2}
                  y={PAD.t + ih - h}
                  width={bw}
                  height={h}
                  rx={4}
                  className={over ? "fill-rose-400" : "fill-emerald-500"}
                  opacity={sel === null || sel === i ? 1 : 0.45}
                />
              )}
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-slate-400" fontSize={9}>
                {days[i].slice(8)}
              </text>
            </g>
          );
        })}
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={y(target)}
          y2={y(target)}
          className="stroke-slate-500"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      </svg>
      {sel !== null && (
        <p className="text-center text-xs text-slate-500">
          {days[sel].slice(5).replace("-", "/")} · <b className="text-slate-700">{fmt(values[sel])} kcal</b>
        </p>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <tbody>
          {days.map((k, i) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{values[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
