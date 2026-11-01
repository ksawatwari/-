

/* ================================================================
   Fonts
================================================================ */
export const FONTS: { id: string; name: string; cssVar: string }[] = [
  { id: "anuphan", name: "Anuphan", cssVar: "--font-anuphan" },
  { id: "prompt", name: "Prompt", cssVar: "--font-prompt" },
  { id: "kanit", name: "Kanit", cssVar: "--font-kanit" },
  { id: "sarabun", name: "Sarabun", cssVar: "--font-sarabun" },
  { id: "mali", name: "Mali", cssVar: "--font-mali" },
  { id: "mitr", name: "Mitr", cssVar: "--font-mitr" },
];
export const fontFamilyOf = (id: string) => {
  const f = FONTS.find((x) => x.id === id) ?? FONTS[0];
  return `var(${f.cssVar}), system-ui, sans-serif`;
};
