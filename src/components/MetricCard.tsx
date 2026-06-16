import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  value: string;
  subValue?: string;
  percentage?: number;
  colorClass: string;
}

export function MetricCard({ title, icon: Icon, value, subValue, percentage, colorClass }: MetricCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/10 transition-all duration-300 shadow-xl group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-opacity-20 ${colorClass.replace('text-', 'bg-')} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <h3 className="text-gray-400 font-medium tracking-wider text-sm uppercase">{title}</h3>
      </div>
      
      <div className="mt-2">
        <div className="text-3xl font-bold text-white mb-1">
          {value}
        </div>
        {subValue && (
          <div className="text-sm text-gray-400">
            {subValue}
          </div>
        )}
      </div>

      {percentage !== undefined && (
        <div className="mt-6 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass.replace('text-', 'bg-')}`} 
            style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }} 
          />
        </div>
      )}
    </div>
  );
}
