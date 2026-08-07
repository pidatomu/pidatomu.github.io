"use client";

interface ToneSliderProps {
  value: number;
  onChange: (v: number) => void;
}

const TONE_LABELS: Record<number, string> = {
  1: "Sangat Santai",
  2: "Santai",
  3: "Normal",
  4: "Formal",
  5: "Sangat Formal",
};

const TONE_COLORS: Record<number, string> = {
  1: "bg-green-400",
  2: "bg-green-300",
  3: "bg-yellow-400",
  4: "bg-orange-400",
  5: "bg-red-500",
};

const SLIDER_GRADIENT =
  "linear-gradient(to right, #4ade80, #a3e635, #facc15, #fb923c, #ef4444)";

export default function ToneSlider({ value, onChange }: ToneSliderProps) {
  return (
    <div className="brutal-card p-4 flex flex-col justify-center h-full space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-tight">Nada Tulisan</span>
        <span
          className={`${TONE_COLORS[value]} border-2 border-black px-2 py-0.5 text-xs font-mono font-bold`}
        >
          {value} — {TONE_LABELS[value]}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 appearance-none cursor-pointer rounded-none border-2 border-black"
          style={{ background: SLIDER_GRADIENT }}
        />
        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            background: white;
            border: 3px solid black;
            border-radius: 0;
            cursor: pointer;
            box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border: 3px solid black;
            border-radius: 0;
            cursor: pointer;
            box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
          }
        `}</style>
      </div>

      <div className="flex justify-between text-[10px] font-mono opacity-60 px-1">
        <span>Santai</span>
        <span>Formal</span>
      </div>
    </div>
  );
}
