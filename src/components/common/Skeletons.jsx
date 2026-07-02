import React from 'react';

export const CategoryCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm animate-pulse">
    <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-4"></div>
    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-2"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
  </div>
);

export const HamperCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm animate-pulse">
    <div className="w-full h-56 bg-slate-200 dark:bg-slate-800"></div>
    <div className="p-6">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-3"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
      <div className="flex justify-between items-center mt-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
      </div>
    </div>
  </div>
);

export const DetailsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
    <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
    <div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6 mb-3"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
      <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
      <div className="space-y-2 mb-8">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
      </div>
      <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="p-4 bg-slate-150 dark:bg-slate-850 flex justify-between space-x-4">
      {Array.from({ length: cols }).map((_, idx) => (
        <div key={idx} className="h-5 bg-slate-250 dark:bg-slate-800 rounded w-1/6"></div>
      ))}
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="p-4 flex justify-between items-center space-x-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div key={cIdx} className={`h-4 bg-slate-200 dark:bg-slate-800 rounded ${cIdx === 0 ? 'w-1/4' : 'w-1/6'}`}></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
