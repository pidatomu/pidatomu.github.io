"use client";

import { useState, useEffect, useCallback } from "react";
import { Target, Flame, Trophy, Plus, Minus } from "lucide-react";
import {
  getGoals,
  setGoal,
  getProgress,
  recordGeneration,
  type Goals,
  type GoalProgress,
} from "@/lib/goals";

export default function GoalTracker() {
  const [goals, setGoalsState] = useState<Goals>({ weekly: 0, target: 3 });
  const [progress, setProgressState] = useState<GoalProgress>({
    thisWeek: 0,
    streak: 0,
    totalThisMonth: 0,
    completed: false,
    weekKey: "",
  });
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(() => {
    setGoalsState(getGoals());
    setProgressState(getProgress());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const progressPct =
    goals.target > 0
      ? Math.min(100, Math.round((progress.thisWeek / goals.target) * 100))
      : 0;

  const handleAdjustGoal = (delta: number) => {
    const newTarget = Math.max(1, Math.min(50, goals.target + delta));
    setGoalsState(setGoal(newTarget));
    setProgressState(getProgress());
  };

  const handleRecord = () => {
    setProgressState(recordGeneration());
    setGoalsState(getGoals());
  };

  return (
    <div className="brutal-card p-4">
      <h4 className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
        <Target className="w-3 h-3" />
        Target Mingguan
      </h4>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span>{progress.thisWeek} / {goals.target} naskah</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-3 bg-black/5 border-2 border-[var(--color-ink)] overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {progress.completed && (
          <div className="text-[0.65rem] font-bold text-[#22c55e] mt-1">
            Target tercapai!
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-black/[0.03] border border-black/10">
          <Flame className="w-4 h-4 mx-auto text-[var(--color-danger)]" />
          <div className="text-sm font-bold mt-0.5">{progress.streak}</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Streak</div>
        </div>
        <div className="text-center p-2 bg-black/[0.03] border border-black/10">
          <Trophy className="w-4 h-4 mx-auto text-[var(--color-accent)]" />
          <div className="text-sm font-bold mt-0.5">{progress.totalThisMonth}</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Bulan Ini</div>
        </div>
        <div className="text-center p-2 bg-black/[0.03] border border-black/10">
          <Target className="w-4 h-4 mx-auto text-[var(--color-ink)]" />
          <div className="text-sm font-bold mt-0.5">{goals.target}</div>
          <div className="text-[0.6rem] font-semibold text-black/40 uppercase">Target</div>
        </div>
      </div>

      {/* Target adjuster */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleAdjustGoal(-1)}
          className="w-8 h-8 border-2 border-[var(--color-ink)] bg-white hover:bg-black/5 flex items-center justify-center transition-colors"
          aria-label="Kurangi target"
        >
          <Minus className="w-3 h-3" />
        </button>
        <div className="flex-1 text-center text-sm font-bold">
          {goals.target} naskah / minggu
        </div>
        <button
          onClick={() => handleAdjustGoal(1)}
          className="w-8 h-8 border-2 border-[var(--color-ink)] bg-white hover:bg-black/5 flex items-center justify-center transition-colors"
          aria-label="Tambah target"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
