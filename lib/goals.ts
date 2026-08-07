// ─── Goal Tracker (localStorage) ────────────────────────────────────────────

import { storage } from "./storage";

const GOALS_KEY = "goals";
const PROGRESS_KEY = "goal_progress";

export interface Goals {
  weekly: number;
  target: number;
}

export interface GoalProgress {
  thisWeek: number;
  streak: number;
  totalThisMonth: number;
  completed: boolean;
  weekKey: string;
}

const DEFAULT_GOALS: Goals = { weekly: 0, target: 3 };

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getDefaultProgress(): GoalProgress {
  return {
    thisWeek: 0,
    streak: 0,
    totalThisMonth: 0,
    completed: false,
    weekKey: getWeekKey(),
  };
}

function getStoredProgress(): GoalProgress {
  const stored = storage.get<GoalProgress>(PROGRESS_KEY);
  if (!stored) return getDefaultProgress();
  return stored;
}

export function getGoals(): Goals {
  return { ...DEFAULT_GOALS, ...storage.get<Goals>(GOALS_KEY) };
}

export function setGoal(target: number): Goals {
  const goals = getGoals();
  goals.target = Math.max(1, Math.min(50, Math.floor(target)));
  goals.weekly = goals.target;
  storage.set(GOALS_KEY, goals);
  return goals;
}

export function getProgress(): GoalProgress {
  const progress = getStoredProgress();
  const goals = getGoals();
  const currentWeekKey = getWeekKey();

  if (progress.weekKey !== currentWeekKey) {
    const newProgress: GoalProgress = {
      thisWeek: 0,
      streak: progress.completed ? progress.streak : 0,
      totalThisMonth: progress.totalThisMonth,
      completed: false,
      weekKey: currentWeekKey,
    };
    storage.set(PROGRESS_KEY, newProgress);
    return newProgress;
  }

  return {
    ...progress,
    completed: progress.thisWeek >= goals.target,
  };
}

export function recordGeneration(): GoalProgress {
  const progress = getStoredProgress();
  const goals = getGoals();
  const currentWeekKey = getWeekKey();
  const currentMonthKey = getMonthKey();

  let streak = progress.streak;
  let totalThisMonth = progress.totalThisMonth;

  if (progress.weekKey !== currentWeekKey) {
    streak = 0;
  }

  const monthChanged =
    !progress.weekKey ||
    progress.weekKey.substring(0, 7) !== currentMonthKey;

  if (monthChanged) {
    totalThisMonth = 0;
  }

  const newProgress: GoalProgress = {
    thisWeek: (progress.weekKey === currentWeekKey ? progress.thisWeek : 0) + 1,
    streak:
      (progress.weekKey === currentWeekKey ? progress.thisWeek : 0) + 1 >=
      goals.target
        ? streak + 1
        : streak,
    totalThisMonth: totalThisMonth + 1,
    completed:
      (progress.weekKey === currentWeekKey ? progress.thisWeek : 0) + 1 >=
      goals.target,
    weekKey: currentWeekKey,
  };

  storage.set(PROGRESS_KEY, newProgress);
  return newProgress;
}

export function resetWeeklyIfNeeded(): GoalProgress {
  const progress = getStoredProgress();
  const currentWeekKey = getWeekKey();

  if (progress.weekKey !== currentWeekKey) {
    const newProgress: GoalProgress = {
      thisWeek: 0,
      streak: progress.completed ? progress.streak : 0,
      totalThisMonth: progress.totalThisMonth,
      completed: false,
      weekKey: currentWeekKey,
    };
    storage.set(PROGRESS_KEY, newProgress);
    return newProgress;
  }

  return progress;
}
