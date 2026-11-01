"use client";

import { useMemo } from "react";
import {
  Check,
  Palette,
  ImagePlus,
} from "lucide-react";
import { useT } from "@/lib/i18n";

/* ================================================================
   Theme (สีธีม + ลวดลายพื้นหลัง)
   สีทั้งแอปอ่านจากตัวแปร CSS (--ac-*, --sl-*) ที่ตั้งใน tailwind.config.ts + globals.css
================================================================ */
export const hslRgb = (h: number, s: number, l: number) => {
  const S = s / 100;
  const L = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((x) => Math.round(x * 255)).join(" ");
};
export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// [ความสว่าง, ตัวคูณความอิ่มสี] ของแต่ละเฉด — เฉดอ่อนจะ pastel เฉดเข้มไว้ให้ตัวหนังสืออ่านชัด
export const LADDER: [number, number][] = [
  [97, 0.55], [94, 0.65], [88, 0.8], [79, 0.9], [67, 1], [50, 1],
  [42, 1], [34, 1], [27, 0.9], [21, 0.85], [12, 0.8],
];
export const LADDER_DARK: [number, number][] = [
  [96, 0.3], [93, 0.3], [87, 0.3], [76, 0.3], [56, 0.3], [27, 0.3],
  [19, 0.3], [15, 0.3], [12, 0.3], [9, 0.3], [5, 0.3],
];
export const EMERALD_EXACT = [
  "236 253 245", "209 250 229", "167 243 208", "110 231 183", "52 211 153", "16 185 129",
  "5 150 105", "4 120 87", "6 95 70", "6 78 59", "2 44 34",
];

export type ThemeDef = {
  id: string;
  h: number; // hue
  s: number; // saturation
  dk?: number; // ลดความสว่างเฉด 400-700 (ให้ตัวหนังสือสีขาวบนปุ่มอ่านง่าย)
  altH?: number; // ขยับ hue ของสีปลายแบนเนอร์ (ค่าเริ่มต้น +14)
  bg?: [number, number]; // [hue, sat] ของพื้นหลังหน้า
  dark?: boolean;
};
export const THEMES: ThemeDef[] = [
  { id: "emerald", h: 160, s: 84 },
  { id: "lavender", h: 264, s: 30, bg: [264, 22] },
  { id: "rosegold", h: 352, s: 34, dk: -3, altH: -10, bg: [352, 24] },
  { id: "sage", h: 108, s: 22, dk: 6, bg: [100, 16] },
  { id: "terracotta", h: 16, s: 44, dk: 1, bg: [20, 26] },
  { id: "mist", h: 205, s: 32, dk: 2, bg: [205, 22] },
  { id: "mocha", h: 27, s: 28, dk: 3, bg: [30, 24] },
  { id: "charcoal", h: 222, s: 7, dark: true, bg: [220, 5] },
  { id: "pearl", h: 215, s: 14, dk: 1, bg: [40, 30] },
];
export const themeOf = (id: string) => THEMES.find((x) => x.id === id) ?? THEMES[0];

export function themeVars(id: string): Record<string, string> {
  const th = themeOf(id);
  const v: Record<string, string> = {};
  if (th.id === "emerald") {
    SHADES.forEach((s, i) => (v[`--ac-${s}`] = EMERALD_EXACT[i]));
    v["--ac-alt"] = "20 184 166";
    v["--sl-50"] = "248 250 252";
    v["--sl-100"] = "241 245 249";
    v["--sl-200"] = "226 232 240";
    return v;
  }
  const lad = th.dark ? LADDER_DARK : LADDER;
  SHADES.forEach((s, i) => {
    let l = lad[i][0];
    if (!th.dark && s >= 400 && s <= 700) l -= th.dk ?? 0;
    v[`--ac-${s}`] = hslRgb(th.h, th.s * lad[i][1], l);
  });
  v["--ac-alt"] = th.dark ? hslRgb(th.h, 5, 22) : hslRgb((th.h + (th.altH ?? 14) + 360) % 360, th.s, 45 - (th.dk ?? 0));
  const [bh, bs] = th.bg ?? [th.h, 10];
  v["--sl-50"] = hslRgb(bh, bs, 97.3);
  v["--sl-100"] = hslRgb(bh, bs, 94.5);
  v["--sl-200"] = hslRgb(bh, bs * 0.9, 90);
  return v;
}
export function applyTheme(id: string) {
  const st = document.documentElement.style;
  const v = themeVars(id);
  for (const k of Object.keys(v)) st.setProperty(k, v[k]);
}
export const swatchBg = (id: string) => {
  const v = themeVars(id);
  return `linear-gradient(135deg, rgb(${v["--ac-200"]}), rgb(${v["--ac-500"]}))`;
};

export type PatternId = "none" | "clouds" | "sprout" | "lilies" | "sunrise" | "meadow";
export const PATTERNS: { id: PatternId; group: "" | "cartoon" | "impress" }[] = [
  { id: "none", group: "" },
  { id: "clouds", group: "cartoon" },
  { id: "sprout", group: "cartoon" },
  { id: "lilies", group: "impress" },
  { id: "sunrise", group: "impress" },
  { id: "meadow", group: "impress" },
];

// สุ่มแบบกำหนด seed ได้ — ลายเหมือนเดิมทุกครั้งที่เปิด
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// "a300" = สีธีมเฉด 300, นอกนั้นเป็น hex คงที่
export const pc = (c: string) => (c[0] === "a" && c.length === 4 ? `rgb(var(--ac-${c.slice(1)}))` : c);
export const MUTED = {
  blue: "#9db8cc", sage: "#a9c19a", lilac: "#c2b2d6", peach: "#efc3a0",
  rose: "#e9a9ab", cream: "#f3e6c8", orange: "#f0b27a", poppy: "#e58f86",
};

export type Area = { x0: number; x1: number; y0: number; y1: number };
export function dabs(
  seed: number, n: number, a: Area, rx: [number, number], ry: [number, number],
  rot: [number, number], colors: string[], op: [number, number]
) {
  const r = mulberry32(seed);
  const rr = (lo: number, hi: number) => lo + r() * (hi - lo);
  return Array.from({ length: n }, (_, i) => {
    const x = rr(a.x0, a.x1);
    const y = rr(a.y0, a.y1);
    return (
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx={rr(rx[0], rx[1])}
        ry={rr(ry[0], ry[1])}
        transform={`rotate(${rr(rot[0], rot[1])} ${x} ${y})`}
        style={{ fill: pc(colors[Math.floor(r() * colors.length)]) }}
        opacity={rr(op[0], op[1])}
      />
    );
  });
}

export function Cloud({ x, y, s, face }: { x: number; y: number; s: number; face?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g style={{ fill: "rgb(var(--ac-200))" }} opacity="0.85">
        <circle cx="0" cy="0" r="16" />
        <circle cx="20" cy="-9" r="21" />
        <circle cx="44" cy="0" r="15" />
        <rect x="-14" y="-2" width="72" height="18" rx="9" />
      </g>
      {face && (
        <g style={{ fill: "rgb(var(--ac-500))", stroke: "rgb(var(--ac-500))" }} opacity="0.55">
          <circle cx="14" cy="4" r="1.8" stroke="none" />
          <circle cx="28" cy="4" r="1.8" stroke="none" />
          <path d="M18 9 Q21 12 24 9" fill="none" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}
export function Sparkle({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -8 Q1.2 -1.2 8 0 Q1.2 1.2 0 8 Q-1.2 1.2 -8 0 Q-1.2 -1.2 0 -8Z"
      style={{ fill: "rgb(var(--ac-300))" }}
      opacity="0.9"
    />
  );
}
export function Sprout({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q-1 -14 0 -24" fill="none" strokeWidth="2.4" strokeLinecap="round" style={{ stroke: "rgb(var(--ac-400))" }} />
      <ellipse cx="-8" cy="-22" rx="9" ry="4.5" transform="rotate(-28 -8 -22)" style={{ fill: "rgb(var(--ac-300))" }} />
      <ellipse cx="8" cy="-26" rx="9" ry="4.5" transform="rotate(28 8 -26)" style={{ fill: "rgb(var(--ac-200))" }} />
    </g>
  );
}

export function renderPattern(id: PatternId): React.ReactNode {
  switch (id) {
    case "clouds": {
      const r = mulberry32(7);
      return (
        <>
          {/* เนินเขาเรียบๆ ด้านล่าง */}
          <circle cx="70" cy="900" r="190" style={{ fill: "rgb(var(--ac-100))" }} />
          <circle cx="300" cy="880" r="170" style={{ fill: "rgb(var(--ac-200))" }} opacity="0.7" />
          <Cloud x={30} y={70} s={1.1} face />
          <Cloud x={250} y={130} s={0.8} />
          <Cloud x={60} y={640} s={0.9} />
          <Cloud x={255} y={575} s={1.15} face />
          <Cloud x={140} y={715} s={0.6} />
          {[[330, 40, 0.8], [190, 60, 0.6], [370, 230, 0.7], [20, 210, 0.6], [350, 520, 0.7], [30, 560, 0.55], [200, 520, 0.5]].map(([x, y, s], i) => (
            <Sparkle key={i} x={x} y={y} s={s} />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={r() * 400} cy={r() < 0.5 ? r() * 170 : 520 + r() * 270} r={1.6 + r() * 2.2} style={{ fill: "rgb(var(--ac-300))" }} opacity="0.7" />
          ))}
        </>
      );
    }
    case "sprout": {
      const r = mulberry32(21);
      const row = Array.from({ length: 11 }, (_, i) => (
        <Sprout key={i} x={14 + i * 37 + r() * 10} y={790 - r() * 36} s={0.9 + r() * 0.9} />
      ));
      const row2 = Array.from({ length: 6 }, (_, i) => (
        <Sprout key={`b${i}`} x={30 + i * 70 + r() * 20} y={720 + r() * 30} s={0.6 + r() * 0.4} />
      ));
      return (
        <>
          <rect x="0" y="788" width="400" height="20" style={{ fill: "rgb(var(--ac-200))" }} opacity="0.7" />
          {row2}
          {row}
          {/* ใบไม้ลอยมุมบน */}
          {[[48, 54, -30], [330, 90, 25], [364, 36, 10], [150, 28, 50], [20, 150, 20]].map(([x, y, a], i) => (
            <ellipse key={i} cx={x} cy={y} rx="11" ry="5" transform={`rotate(${a} ${x} ${y})`} style={{ fill: i % 2 ? "rgb(var(--ac-200))" : "rgb(var(--ac-300))" }} opacity="0.85" />
          ))}
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={r() * 400} cy={r() < 0.55 ? r() * 190 : 560 + r() * 160} r={1.8 + r() * 2.6} style={{ fill: i % 3 ? "rgb(var(--ac-300))" : "rgb(var(--ac-400))" }} opacity="0.55" />
          ))}
        </>
      );
    }
    case "lilies": {
      // สระบัวสไตล์โมเนต์ — ป้ายสีสั้นๆ เป็นน้ำ ใบบัว และดอกบัว
      const pads = [[70, 640], [250, 600], [180, 700], [330, 730], [60, 760], [290, 665]];
      return (
        <>
          {dabs(1, 70, { x0: 0, x1: 400, y0: 0, y1: 150 }, [14, 30], [3, 6], [-12, 12], ["a200", "a300", MUTED.blue, MUTED.lilac], [0.35, 0.7])}
          {/* ต้นหลิวห้อยจากมุมบน */}
          {[[18, 0, 60], [40, 0, 90], [372, 0, 70], [352, 0, 110]].map(([x, y, h], i) => (
            <path key={i} d={`M${x} ${y} Q${x + (i % 2 ? -14 : 14)} ${h / 2} ${x + (i % 2 ? -6 : 6)} ${h}`} fill="none" strokeWidth="3" strokeLinecap="round" style={{ stroke: MUTED.sage }} opacity="0.7" />
          ))}
          {dabs(2, 190, { x0: 0, x1: 400, y0: 540, y1: 800 }, [10, 28], [3, 6.5], [-8, 8], [MUTED.blue, MUTED.lilac, MUTED.sage, "a200", "a300", MUTED.cream], [0.45, 0.9])}
          {pads.map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx={34 + (i % 3) * 5} ry={10 + (i % 2) * 2} style={{ fill: i % 2 ? MUTED.sage : "#9fbd90" }} opacity="0.8" />
          ))}
          {[[88, 632], [262, 592], [196, 692], [338, 724], [72, 752]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="6" style={{ fill: MUTED.rose }} opacity="0.95" />
              <circle cx={x + 7} cy={y + 2} r="4.5" style={{ fill: "#f6dcdc" }} opacity="0.95" />
              <circle cx={x - 6} cy={y + 2} r="4" style={{ fill: MUTED.lilac }} opacity="0.9" />
            </g>
          ))}
        </>
      );
    }
    case "sunrise": {
      // Impression, Sunrise — ดวงอาทิตย์ส้มกลางหมอก ทะเลสีฟ้าเทาม่วง
      return (
        <>
          {dabs(3, 80, { x0: 0, x1: 400, y0: 0, y1: 170 }, [16, 36], [3, 6], [-6, 6], [MUTED.peach, MUTED.lilac, MUTED.cream, "a200"], [0.35, 0.7])}
          {dabs(4, 100, { x0: 0, x1: 400, y0: 610, y1: 690 }, [14, 34], [3, 6], [-4, 4], [MUTED.peach, MUTED.cream, MUTED.lilac, MUTED.blue], [0.45, 0.85])}
          <circle cx="250" cy="652" r="28" style={{ fill: MUTED.orange }} opacity="0.95" />
          {dabs(5, 150, { x0: 0, x1: 400, y0: 690, y1: 800 }, [14, 36], [2.6, 5.5], [-4, 4], [MUTED.blue, "a300", MUTED.lilac, "a200", "#8fa6bd"], [0.5, 0.9])}
          {/* ประกายสะท้อนน้ำใต้ดวงอาทิตย์ */}
          {dabs(6, 22, { x0: 220, x1: 285, y0: 690, y1: 790 }, [10, 22], [2.4, 4], [-3, 3], [MUTED.orange, MUTED.peach, MUTED.cream], [0.7, 1])}
          {/* เรือลำเล็ก */}
          <g style={{ fill: "#7d8fa8" }} opacity="0.85">
            <path d="M70 716 Q95 730 130 716 L124 722 Q98 734 76 722Z" />
            <rect x="99" y="696" width="2.6" height="20" />
            <path d="M101 697 L116 712 L101 712Z" />
          </g>
        </>
      );
    }
    case "meadow": {
      const r = mulberry32(11);
      return (
        <>
          {dabs(7, 60, { x0: 0, x1: 400, y0: 0, y1: 140 }, [14, 30], [3, 6], [-8, 8], [MUTED.blue, MUTED.cream, MUTED.lilac, "a200"], [0.3, 0.6])}
          {dabs(8, 210, { x0: 0, x1: 400, y0: 600, y1: 800 }, [3, 6], [9, 18], [-24, 24], [MUTED.sage, "#98b58a", "a300", "a400", "#b9cfa3"], [0.5, 0.95])}
          {Array.from({ length: 26 }, (_, i) => {
            const x = r() * 400;
            const y = 610 + r() * 180;
            const sz = 3.5 + r() * 3.5;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={sz} style={{ fill: i % 5 === 0 ? "#fbf6ee" : MUTED.poppy }} opacity="0.95" />
                {i % 5 !== 0 && <circle cx={x} cy={y} r={sz * 0.35} style={{ fill: "#6b4a4a" }} opacity="0.7" />}
              </g>
            );
          })}
          {/* กลีบดอกไม้ลอยมุมบน */}
          {dabs(9, 9, { x0: 0, x1: 400, y0: 20, y1: 170 }, [4, 7], [2.5, 4], [-60, 60], [MUTED.poppy, MUTED.rose, "#fbf6ee"], [0.5, 0.85])}
        </>
      );
    }
    default:
      return null;
  }
}

// จางตรงกลางจอ (ที่ข้อความอยู่) เด่นแค่ขอบบน-ล่าง — การ์ดสีขาวทึบทับอีกชั้น ตัวหนังสือจึงไม่โดนกลบ
export const VMASK =
  "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.6) 78%, #000 100%)";

export function PatternSvg({ id }: { id: PatternId }) {
  const art = useMemo(() => renderPattern(id), [id]);
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      style={{ WebkitMaskImage: VMASK, maskImage: VMASK }}
    >
      {art}
    </svg>
  );
}

export function ThemeBackdrop({ pattern }: { pattern: string }) {
  if (!PATTERNS.some((p) => p.id === pattern) || pattern === "none") return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 flex justify-center overflow-hidden"
    >
      <style>{`@media (min-width:640px){.theme-col{-webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent)}}`}</style>
      <div className="theme-col h-full w-full max-w-[560px] opacity-80">
        <PatternSvg id={pattern as PatternId} />
      </div>
    </div>
  );
}

export function ThemeSettings({
  theme,
  pattern,
  onTheme,
  onPattern,
}: {
  theme: string;
  pattern: string;
  onTheme: (id: string) => void;
  onPattern: (id: PatternId) => void;
}) {
  const t = useT();
  return (
    <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Palette size={20} />
        </span>
        <div>
          <h2 className="font-semibold text-slate-800">{t("theme.title")}</h2>
          <p className="text-xs text-slate-500">{t("theme.colorDesc")}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-4">
        {THEMES.map((th) => {
          const active = themeOf(theme).id === th.id;
          const v = themeVars(th.id);
          return (
            <button
              key={th.id}
              onClick={() => onTheme(th.id)}
              aria-pressed={active}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-white transition active:scale-90"
                style={{
                  background: swatchBg(th.id),
                  boxShadow: active
                    ? `0 0 0 2px #fff, 0 0 0 4px rgb(${v["--ac-500"]})`
                    : "inset 0 0 0 1px rgba(0,0,0,0.06)",
                }}
              >
                {active && <Check size={20} strokeWidth={3} />}
              </span>
              <span className={`text-xs ${active ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                {t(`theme.c.${th.id}`)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-3 mt-6 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ImagePlus size={20} />
        </span>
        <div>
          <h2 className="font-semibold text-slate-800">{t("theme.pattern")}</h2>
          <p className="text-xs text-slate-500">{t("theme.patternDesc")}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {PATTERNS.map((p) => {
          const active = pattern === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onPattern(p.id)}
              aria-pressed={active}
              className="flex flex-col items-stretch gap-1.5 text-left"
            >
              <span
                className={`relative block aspect-[3/4] overflow-hidden rounded-2xl transition active:scale-95 ${
                  active ? "ring-2 ring-emerald-500 ring-offset-2" : "ring-1 ring-slate-200"
                }`}
                style={{ background: "rgb(var(--sl-50))" }}
              >
                {p.id !== "none" && (
                  <span className="absolute inset-0 block">
                    <PatternSvg id={p.id} />
                  </span>
                )}
                {/* การ์ดจำลอง ให้เห็นว่าลายอยู่ขอบๆ ไม่ทับพื้นที่ข้อความ */}
                <span className="absolute inset-x-2.5 top-[30%] block rounded-lg bg-white p-1.5 shadow-sm">
                  <span className="block h-1.5 w-3/4 rounded-full bg-slate-200" />
                  <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-slate-100" />
                </span>
                {active && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className={`text-center text-xs leading-tight ${active ? "font-semibold text-slate-800" : "text-slate-600"}`}>
                {t(`theme.p.${p.id}`)}
                {p.group && (
                  <span className="block text-[10px] font-normal text-slate-400">
                    {t(p.group === "cartoon" ? "theme.cartoon" : "theme.impress")}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
