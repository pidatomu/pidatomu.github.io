"use client";

import { useMemo, useState } from "react";

interface ThemeHeatmapProps {
  data: { date: string; count: number }[];
}

const CELL_SIZE = 12;
const CELL_GAP = 2;
const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getColor(count: number): string {
  if (count === 0) return "bg-black/[0.04]";
  if (count === 1) return "bg-[#fbbf24]";
  if (count === 2) return "bg-[#f59e0b]";
  if (count === 3) return "bg-[#d97706]";
  return "bg-[#b45309]";
}

function buildGrid(data: { date: string; count: number }[]) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const map = new Map(data.map((d) => [d.date, d.count]));
  const weeks: { date: string; count: number; day: number }[][] = [];
  let currentWeek: { date: string; count: number; day: number }[] = [];

  for (let i = 0; i < 371; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    const count = map.get(key) || 0;
    currentWeek.push({ date: key, count, day: d.getDay() });

    if (d.getDay() === 6 || i === 370) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}

export default function ThemeHeatmap({ data }: ThemeHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const grid = useMemo(() => buildGrid(data), [data]);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);

  const gridWidth = grid.length * (CELL_SIZE + CELL_GAP);
  const gridHeight = 7 * (CELL_SIZE + CELL_GAP);

  return (
    <div className="brutal-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wide">
          Aktivitas {total} naskah
        </h4>
        <div className="text-[0.6rem] text-black/40 font-semibold">
          {365} hari terakhir
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          width={40 + gridWidth}
          height={20 + gridHeight}
          className="block"
        >
          {/* Day labels */}
          {DAY_LABELS.map((label, i) => (
            <text
              key={label}
              x={0}
              y={20 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 1}
              className="text-[8px] fill-black/40 font-semibold"
              textAnchor="start"
            >
              {i % 2 === 1 ? label : ""}
            </text>
          ))}

          {/* Grid cells */}
          {grid.map((week, wi) =>
            week.map((cell) => (
              <rect
                key={cell.date}
                x={40 + wi * (CELL_SIZE + CELL_GAP)}
                y={20 + cell.day * (CELL_SIZE + CELL_GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                className={`${getColor(cell.count)} stroke-black/10 stroke-[0.5] transition-colors duration-200 cursor-pointer hover:stroke-black/30 hover:stroke-[1.5]`}
                rx={1}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    date: cell.date,
                    count: cell.count,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-[100] px-2 py-1 bg-[var(--color-ink)] text-white text-[0.65rem] font-bold border-2 border-black shadow-[2px_2px_0_var(--color-ink)] pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            {tooltip.count} naskah · {new Date(tooltip.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[0.6rem] text-black/40 font-semibold">Kurang</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 border border-black/10 ${getColor(
              level === 0 ? 0 : level
            )}`}
          />
        ))}
        <span className="text-[0.6rem] text-black/40 font-semibold">Lebih</span>
      </div>
    </div>
  );
}
