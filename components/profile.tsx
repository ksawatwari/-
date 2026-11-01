"use client";

import { useRef, useState } from "react";
import {
  Pencil,
  User,
  ImagePlus,
} from "lucide-react";
import { Avatar, Profile } from "@/lib/types";
import { useT } from "@/lib/i18n";

/* ================================================================
   Avatars / Profile
================================================================ */
export const Face = ({ y = 36, smile = true }: { y?: number; smile?: boolean }) => (
  <>
    <circle cx="25" cy={y} r="2.3" fill="#374151" />
    <circle cx="39" cy={y} r="2.3" fill="#374151" />
    <circle cx="20" cy={y + 6} r="3.2" fill="#F9A8D4" opacity="0.6" />
    <circle cx="44" cy={y + 6} r="3.2" fill="#F9A8D4" opacity="0.6" />
    {smile && (
      <path
        d={`M29 ${y + 8} Q32 ${y + 11} 35 ${y + 8}`}
        stroke="#374151"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    )}
  </>
);

export const AVATARS: { key: string; bg: string; art: React.ReactNode }[] = [
  {
    key: "cat",
    bg: "#FDE68A",
    art: (
      <>
        <polygon points="14,28 17,8 30,20" fill="#FDBA74" />
        <polygon points="50,28 47,8 34,20" fill="#FDBA74" />
        <polygon points="18,24 19,13 26,20" fill="#FBCFE8" />
        <polygon points="46,24 45,13 38,20" fill="#FBCFE8" />
        <circle cx="32" cy="36" r="20" fill="#FDBA74" />
        <Face smile={false} />
        <polygon points="30,40 34,40 32,42.5" fill="#F472B6" />
        <path
          d="M32 42.5 Q29 46 26.5 44.5 M32 42.5 Q35 46 37.5 44.5"
          stroke="#374151"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: "dog",
    bg: "#BAE6FD",
    art: (
      <>
        <ellipse cx="14" cy="34" rx="6" ry="13" fill="#A16207" transform="rotate(12 14 34)" />
        <ellipse cx="50" cy="34" rx="6" ry="13" fill="#A16207" transform="rotate(-12 50 34)" />
        <circle cx="32" cy="36" r="19" fill="#FDE6C4" />
        <Face smile={false} />
        <ellipse cx="32" cy="41" rx="3.6" ry="2.6" fill="#374151" />
        <path
          d="M32 43.5 V46 M32 46 Q29.5 48.5 27.5 46.5 M32 46 Q34.5 48.5 36.5 46.5"
          stroke="#374151"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: "bunny",
    bg: "#FBCFE8",
    art: (
      <>
        <ellipse cx="23" cy="15" rx="5.5" ry="13" fill="#fff" />
        <ellipse cx="41" cy="15" rx="5.5" ry="13" fill="#fff" />
        <ellipse cx="23" cy="16" rx="2.8" ry="9" fill="#F9A8D4" />
        <ellipse cx="41" cy="16" rx="2.8" ry="9" fill="#F9A8D4" />
        <circle cx="32" cy="40" r="18" fill="#fff" />
        <Face y={40} />
        <ellipse cx="32" cy="44" rx="2" ry="1.4" fill="#F472B6" />
      </>
    ),
  },
  {
    key: "bear",
    bg: "#FED7AA",
    art: (
      <>
        <circle cx="16" cy="21" r="7.5" fill="#92400E" />
        <circle cx="48" cy="21" r="7.5" fill="#92400E" />
        <circle cx="16" cy="21" r="4" fill="#D6A77A" />
        <circle cx="48" cy="21" r="4" fill="#D6A77A" />
        <circle cx="32" cy="36" r="20" fill="#C08457" />
        <ellipse cx="32" cy="43" rx="9" ry="7" fill="#F3DDBF" />
        <Face smile={false} />
        <ellipse cx="32" cy="41" rx="3.2" ry="2.4" fill="#374151" />
        <path
          d="M32 43.5 V46 M32 46 Q29.5 48 28 46.5 M32 46 Q34.5 48 36 46.5"
          stroke="#374151"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    key: "panda",
    bg: "#D1FAE5",
    art: (
      <>
        <circle cx="15" cy="20" r="7" fill="#1F2937" />
        <circle cx="49" cy="20" r="7" fill="#1F2937" />
        <circle cx="32" cy="36" r="20" fill="#fff" />
        <ellipse cx="24" cy="34" rx="5" ry="6.5" fill="#1F2937" transform="rotate(20 24 34)" />
        <ellipse cx="40" cy="34" rx="5" ry="6.5" fill="#1F2937" transform="rotate(-20 40 34)" />
        <circle cx="24.5" cy="34" r="2" fill="#fff" />
        <circle cx="39.5" cy="34" r="2" fill="#fff" />
        <ellipse cx="32" cy="42" rx="3" ry="2.2" fill="#1F2937" />
        <path d="M29 46 Q32 49 35 46" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="19" cy="44" r="3" fill="#F9A8D4" opacity="0.7" />
        <circle cx="45" cy="44" r="3" fill="#F9A8D4" opacity="0.7" />
      </>
    ),
  },
  {
    key: "penguin",
    bg: "#BFDBFE",
    art: (
      <>
        <ellipse cx="32" cy="38" rx="19" ry="22" fill="#1F2937" />
        <ellipse cx="32" cy="41" rx="13" ry="17" fill="#fff" />
        <circle cx="26" cy="33" r="2.2" fill="#374151" />
        <circle cx="38" cy="33" r="2.2" fill="#374151" />
        <circle cx="21.5" cy="39" r="3" fill="#F9A8D4" opacity="0.6" />
        <circle cx="42.5" cy="39" r="3" fill="#F9A8D4" opacity="0.6" />
        <polygon points="28.5,37 35.5,37 32,42" fill="#FB923C" />
      </>
    ),
  },
  {
    key: "chick",
    bg: "#FEF9C3",
    art: (
      <>
        <path
          d="M28 17 Q29 9 32 15 Q34 8 37 17"
          fill="#FDE047"
          stroke="#FDE047"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="37" r="21" fill="#FDE047" />
        <ellipse cx="12" cy="42" rx="3.5" ry="6" fill="#FACC15" transform="rotate(15 12 42)" />
        <ellipse cx="52" cy="42" rx="3.5" ry="6" fill="#FACC15" transform="rotate(-15 52 42)" />
        <Face y={34} smile={false} />
        <polygon points="28.5,39 35.5,39 32,44" fill="#FB923C" />
      </>
    ),
  },
  {
    key: "fox",
    bg: "#FFEDD5",
    art: (
      <>
        <polygon points="12,30 14,8 29,19" fill="#FB923C" />
        <polygon points="52,30 50,8 35,19" fill="#FB923C" />
        <polygon points="16,24 17,14 24,20" fill="#1F2937" />
        <polygon points="48,24 47,14 40,20" fill="#1F2937" />
        <circle cx="32" cy="36" r="20" fill="#FB923C" />
        <polygon points="13,37 32,57 51,37 32,43" fill="#fff" />
        <Face y={35} smile={false} />
        <circle cx="32" cy="51" r="2.3" fill="#1F2937" />
      </>
    ),
  },
  {
    key: "frog",
    bg: "#D9F99D",
    art: (
      <>
        <ellipse cx="32" cy="40" rx="22" ry="17" fill="#4ADE80" />
        <circle cx="21" cy="24" r="9" fill="#4ADE80" />
        <circle cx="43" cy="24" r="9" fill="#4ADE80" />
        <circle cx="21" cy="24" r="5.5" fill="#fff" />
        <circle cx="43" cy="24" r="5.5" fill="#fff" />
        <circle cx="21.5" cy="24.5" r="2.7" fill="#1F2937" />
        <circle cx="42.5" cy="24.5" r="2.7" fill="#1F2937" />
        <path d="M22 42 Q32 52 42 42" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="41" r="3.2" fill="#F9A8D4" opacity="0.7" />
        <circle cx="48" cy="41" r="3.2" fill="#F9A8D4" opacity="0.7" />
      </>
    ),
  },
  {
    key: "kid",
    bg: "#E0E7FF",
    art: (
      <>
        <ellipse cx="32" cy="64" rx="22" ry="14" fill="#A5B4FC" />
        <circle cx="32" cy="30" r="15" fill="#5B3A29" />
        <rect x="18" y="30" width="28" height="20" rx="10" fill="#5B3A29" />
        <circle cx="32" cy="34" r="12" fill="#FDE2C8" />
        <path d="M19 32 Q20 19 32 19 Q44 19 45 32 Q38 25 32 26 Q25 25 19 32Z" fill="#5B3A29" />
        <circle cx="27" cy="35" r="1.9" fill="#374151" />
        <circle cx="37" cy="35" r="1.9" fill="#374151" />
        <circle cx="23.5" cy="40" r="2.5" fill="#F9A8D4" opacity="0.6" />
        <circle cx="40.5" cy="40" r="2.5" fill="#F9A8D4" opacity="0.6" />
        <path d="M30 41 Q32 43 34 41" stroke="#374151" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
];

export function AvatarView({ avatar, className = "" }: { avatar: Avatar; className?: string }) {
  let inner: React.ReactNode;
  if (avatar.kind === "photo") {
    // eslint-disable-next-line @next/next/no-img-element
    inner = <img src={avatar.src} alt="" className="h-full w-full object-cover" />;
  } else if (avatar.kind === "preset") {
    const a = AVATARS.find((x) => x.key === avatar.key);
    inner = a ? (
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill={a.bg} />
        {a.art}
      </svg>
    ) : (
      <User className="h-1/2 w-1/2 text-slate-300" strokeWidth={1.75} />
    );
  } else {
    inner = <User className="h-1/2 w-1/2 text-slate-300" strokeWidth={1.75} />;
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ${className}`}
    >
      {inner}
    </div>
  );
}

export function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        const s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProfileScreen({
  initial,
  isEdit,
  onSave,
  onCancel,
}: {
  initial: Profile | null;
  isEdit: boolean;
  onSave: (p: Profile) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(initial?.name ?? "");
  const [avatar, setAvatar] = useState<Avatar>(initial?.avatar ?? { kind: "default" });
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSave = name.trim().length > 0;
  const submit = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), avatar });
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const src = await resizeImage(f);
      setAvatar({ kind: "photo", src });
    } catch {
      alert(t("profile.uploadError"));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-slate-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-xl">
        <h1 className="mb-6 text-center text-lg font-semibold text-slate-700">
          {isEdit ? t("profile.edit") : t("profile.create")}
        </h1>

        <div className="relative mx-auto h-36 w-36">
          <AvatarView
            avatar={avatar}
            className="h-36 w-36 border-4 border-white shadow-lg ring-1 ring-slate-100"
          />
          <button
            onClick={() => setPicking((v) => !v)}
            aria-label={t("profile.change")}
            className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md active:bg-emerald-600"
          >
            <Pencil size={18} />
          </button>
        </div>

        {picking && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-3">
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map((a) => {
                const selected = avatar.kind === "preset" && avatar.key === a.key;
                return (
                  <button
                    key={a.key}
                    onClick={() => setAvatar({ kind: "preset", key: a.key })}
                    aria-label={a.key}
                    className={`overflow-hidden rounded-full ring-2 active:scale-95 ${
                      selected ? "ring-emerald-500" : "ring-transparent"
                    }`}
                  >
                    <AvatarView
                      avatar={{ kind: "preset", key: a.key }}
                      className="aspect-square w-full"
                    />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-slate-600 shadow-sm active:bg-slate-100"
            >
              <ImagePlus size={18} /> {t("profile.upload")}
            </button>
            <button
              onClick={() => setAvatar({ kind: "default" })}
              className="mt-2 w-full py-2 text-xs text-slate-400 active:text-slate-600"
            >
              {t("profile.default")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
          </div>
        )}

        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={t("profile.namePh")}
          className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-lg text-slate-700 outline-none placeholder:font-light placeholder:text-slate-300 focus:border-emerald-400"
        />

        <div className="mt-5 flex gap-3">
          {isEdit && (
            <button
              onClick={onCancel}
              className="flex-1 rounded-2xl bg-slate-100 py-4 font-semibold text-slate-600 active:bg-slate-200"
            >
              {t("common.cancel")}
            </button>
          )}
          <button
            onClick={submit}
            disabled={!canSave}
            className="flex-[2] rounded-2xl bg-emerald-500 py-4 font-bold text-white active:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isEdit ? t("common.save") : t("profile.start")}
          </button>
        </div>
      </div>
    </main>
  );
}
