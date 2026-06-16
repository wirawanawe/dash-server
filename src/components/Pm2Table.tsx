import React from 'react';
import { Server, Activity, MemoryStick, Cpu } from 'lucide-react';

interface Pm2App {
  id: number;
  name: string;
  status: string;
  memory: number; // bytes
  cpu: number; // percentage
  uptime: number; // timestamp
}

interface Pm2TableProps {
  apps: Pm2App[];
}

export function Pm2Table({ apps }: Pm2TableProps) {
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const calculateUptime = (pm_uptime: number) => {
    if (!pm_uptime) return '0s';
    const now = Date.now();
    const diff = now - pm_uptime;
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  if (!apps || apps.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center text-gray-400">
        <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No PM2 processes found running.</p>
        <p className="text-sm mt-2 opacity-70">Make sure PM2 is running on your server.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">PM2 Managed Services</h2>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">App Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Memory</th>
              <th className="px-6 py-4 font-medium">CPU</th>
              <th className="px-6 py-4 font-medium">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {apps.map((app) => {
              const isOnline = app.status === 'online';
              return (
                <tr key={app.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    {app.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className={`capitalize ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                        {app.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-gray-500" />
                      {formatBytes(app.memory)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-gray-500" />
                      {app.cpu}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {calculateUptime(app.uptime)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
