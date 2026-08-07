"use client";

import { useMemo, useState } from "react";
import { Sparkles, ArrowRight, Check } from "lucide-react";

interface VocabSuggestProps {
  text: string;
  onReplace: (oldWord: string, newWord: string) => void;
}

const REPLACEMENTS: [string, string][] = [
  ["nggak", "tidak"],
  ["gak", "tidak"],
  ["ga", "tidak"],
  ["ngga", "tidak"],
  ["gak", "tidak"],
  ["banget", "sangat"],
  ["bgt", "sangat"],
  ["ya", "iya"],
  ["nih", "ini"],
  ["dong", "tolong"],
  ["deh", "saja"],
  ["sih", ""],
  ["kan", ""],
  ["kok", ""],
  ["gitu", "begitu"],
  ["kayak", "seperti"],
  ["kaya", "seperti"],
  ["cuma", "hanya"],
  ["aja", "saja"],
  ["udah", "sudah"],
  ["udh", "sudah"],
  ["blm", "belum"],
  ["blum", "belum"],
  ["belom", "belum"],
  ["lg", "sedang"],
  ["lagi", "sedang"],
  ["bisa", "dapat"],
  ["moga", "semoga"],
  ["mudah2an", "semoga"],
  ["insyaallah", "insya Allah"],
  ["trs", "terus"],
  ["trus", "terus"],
  ["sampe", "sampai"],
  ["smpe", "sampai"],
  ["krn", "karena"],
  ["karna", "karena"],
  ["dr", "dari"],
  ["dri", "dari"],
  ["utk", "untuk"],
  ["untk", "untuk"],
  ["tp", "tetapi"],
  ["tpi", "tetapi"],
  ["tpii", "tetapi"],
  ["smua", "semua"],
  ["sma", "sama"],
  ["gw", "saya"],
  ["gue", "saya"],
  ["lu", "kamu"],
  ["lo", "kamu"],
  ["anak2", "anak-anak"],
  ["org2", "orang-orang"],
  ["yg", "yang"],
  ["bnyk", "banyak"],
  ["banyak", "banyak"],
  ["bgt", "sangat"],
  ["cm", "hanya"],
  ["tp", "tetapi"],
  ["jg", "juga"],
  ["gimana", "bagaimana"],
  ["gmana", "bagaimana"],
  ["kenapa", "mengapa"],
  ["knp", "mengapa"],
  ["dimana", "di mana"],
  ["dmn", "di mana"],
  ["kemana", "ke mana"],
  ["kmn", "ke mana"],
  ["darimana", "dari mana"],
  ["drmn", "dari mana"],
  ["kapan", "kapan"],
  ["kpn", "kapan"],
  ["apa", "apa"],
  ["siapa", "siapa"],
  ["sip", "bagus"],
  ["ok", "baik"],
  ["oke", "baik"],
  ["ojk", "baik"],
  ["mantap", "luar biasa"],
  ["jos", "luar biasa"],
  ["asik", "menyenangkan"],
  ["asyik", "menyenangkan"],
  ["kece", "kecewa"],
  ["capek", "lelah"],
  ["cape", "lelah"],
  ["males", "malas"],
  ["malas", "malas"],
  ["santai", "tenang"],
  ["seru", "menarik"],
  ["wah", "wah"],
  ["nah", "nah"],
  ["eh", "eh"],
  ["aduh", "aduh"],
  ["astaga", "astaga"],
  ["subhanallah", "subhanallah"],
  ["alhamdulillah", "alhamdulillah"],
  ["allahuakbar", "allahu akbar"],
];

export default function VocabSuggest({ text, onReplace }: VocabSuggestProps) {
  const [replaced, setReplaced] = useState<Set<string>>(new Set());

  const suggestions = useMemo(() => {
    if (!text.trim()) return [];
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    const unique = new Set(words);
    const found: { old: string; new: string }[] = [];

    for (const [informal, formal] of REPLACEMENTS) {
      if (unique.has(informal) && !found.some((f) => f.old === informal)) {
        found.push({ old: informal, new: formal || informal });
      }
    }

    return found;
  }, [text]);

  if (suggestions.length === 0) {
    return (
      <div className="brutal-card p-4 text-center text-sm text-black/40 font-semibold">
        Tidak ada saran kosakata
      </div>
    );
  }

  const handleReplace = (oldWord: string, newWord: string) => {
    onReplace(oldWord, newWord);
    setReplaced((prev) => new Set(prev).add(oldWord));
  };

  return (
    <div className="brutal-card p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Sparkles className="w-3 h-3" />
        Saran Kosakata
        <span className="ml-auto text-[0.65rem] font-bold px-2 py-0.5 bg-black/5">
          {suggestions.length} ditemukan
        </span>
      </h4>

      <div className="space-y-1.5">
        {suggestions.map(({ old: oldWord, new: newWord }) => {
          const isReplaced = replaced.has(oldWord);
          return (
            <button
              key={oldWord}
              onClick={() => !isReplaced && handleReplace(oldWord, newWord)}
              disabled={isReplaced}
              className={`w-full flex items-center gap-2 text-xs p-2 border-2 border-[var(--color-ink)] transition-all duration-150 text-left ${
                isReplaced
                  ? "bg-[var(--color-accent-2)] opacity-60"
                  : "bg-white hover:bg-[var(--color-accent)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--color-ink)]"
              }`}
            >
              <span className="font-mono font-bold text-[var(--color-danger)] line-through">
                {oldWord}
              </span>
              <ArrowRight className="w-3 h-3 flex-shrink-0 text-black/30" />
              <span className="font-mono font-bold text-[#22c55e]">
                {newWord}
              </span>
              {isReplaced && <Check className="w-3 h-3 ml-auto text-[#22c55e]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
