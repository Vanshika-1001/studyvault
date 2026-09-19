import React from 'react';
import { Star, Flame, Award, BookOpen } from 'lucide-react';

export const DifficultyBadge = ({ difficulty }) => {
  let color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (difficulty === 'Easy') {
    color = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  } else if (difficulty === 'Medium') {
    color = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  } else if (difficulty === 'Hard') {
    color = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {difficulty}
    </span>
  );
};

export const ImportantBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
      Important
    </span>
  );
};

export const FrequencyBadge = ({ frequency }) => {
  if (!frequency || frequency <= 1) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
      <Flame className="w-3 h-3 text-orange-500" />
      Asked {frequency}×
    </span>
  );
};

export const MarksBadge = ({ marks }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <Award className="w-3 h-3 text-brand-500" />
      {marks} Marks
    </span>
  );
};

export const UnitBadge = ({ unit }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
      <BookOpen className="w-3 h-3" />
      Unit {unit}
    </span>
  );
};
