import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon: Icon,
  color = 'emerald',
}) => {
  const colorMap = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200/70',
    amber: 'text-amber-700 bg-amber-50 border-amber-200/70',
    blue: 'text-blue-700 bg-blue-50 border-blue-200/70',
    purple: 'text-purple-700 bg-purple-50 border-purple-200/70',
  };

  return (
    <div className="glass-card rounded-2xl p-6 transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {change && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md shadow-xs">
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
