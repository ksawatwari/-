// ค้นหา / กรองรายการ + แท็ก (#แท็ก ในโน้ต) — ฟังก์ชันล้วน ไม่แตะ React
export type TxFilter = {
  q: string;
  cats: string[]; // id หมวดที่เลือก (ว่าง = ทุกหมวด)
  type: "all" | "out" | "in";
  from: string; // yyyy-mm-dd หรือ ""
  to: string;
  min: string;
  max: string;
};

export const emptyFilter = (): TxFilter => ({
  q: "",
  cats: [],
  type: "all",
  from: "",
  to: "",
  min: "",
  max: "",
});

const TAG_RE = /#[^\s#]+/g;

export const tagsOf = (note: string): string[] => {
  const found = (note.match(TAG_RE) ?? []).map((s) => s.slice(1).toLowerCase());
  return found.filter((t, i) => found.indexOf(t) === i);
};

export const stripTags = (note: string): string =>
  note.replace(TAG_RE, "").replace(/\s+/g, " ").trim();

export const isFiltered = (f: TxFilter): boolean =>
  f.q.trim() !== "" ||
  f.cats.length > 0 ||
  f.type !== "all" ||
  f.from !== "" ||
  f.to !== "" ||
  f.min !== "" ||
  f.max !== "";

type Searchable = { amount: number; dateKey: string; income?: boolean };

// haystack = ข้อความที่ค้นได้ (โน้ต + ชื่อหมวด) / catId = id หมวดที่แก้ legacy แล้ว
export function matchTx(x: Searchable, f: TxFilter, haystack: string, catId: string): boolean {
  if (f.type === "out" && x.income) return false;
  if (f.type === "in" && !x.income) return false;
  if (f.cats.length > 0 && !f.cats.includes(catId)) return false;
  if (f.from && x.dateKey < f.from) return false;
  if (f.to && x.dateKey > f.to) return false;
  const min = f.min.trim() === "" ? NaN : Number(f.min);
  const max = f.max.trim() === "" ? NaN : Number(f.max);
  if (!Number.isNaN(min) && x.amount < min) return false;
  if (!Number.isNaN(max) && x.amount > max) return false;
  const tokens = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length > 0) {
    const hay = `${haystack} ${x.amount}`.toLowerCase();
    if (!tokens.every((tk) => hay.includes(tk))) return false;
  }
  return true;
}

export function summarize(list: Searchable[]): { out: number; inc: number } {
  let out = 0;
  let inc = 0;
  for (const x of list) {
    if (x.income) inc += x.amount;
    else out += x.amount;
  }
  return { out, inc };
}
