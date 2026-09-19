import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-slate-200/60 dark:border-slate-800/60">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm animate-pulse flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      </div>
    </div>
  );
};
