import React from 'react';
import { Database } from 'lucide-react';

interface ServiceStatusProps {
  serviceName: string;
  status: string; // 'active', 'stopped', 'failed', etc.
}

export function ServiceStatus({ serviceName, status }: ServiceStatusProps) {
  const isActive = status === 'active';

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex items-center justify-between hover:bg-white/10 transition-all duration-300 shadow-xl">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-opacity-20 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}>
          <Database className={`w-6 h-6 ${isActive ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">{serviceName}</h3>
          <p className="text-sm text-gray-400">System Service</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          {isActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </span>
        <span className={`text-sm font-medium uppercase tracking-wider ${isActive ? 'text-green-500' : 'text-red-500'}`}>
          {isActive ? 'Online' : 'Stopped'}
        </span>
      </div>
    </div>
  );
}
