"use client";

import React, { useEffect, useState } from 'react';
import { Cpu, HardDrive, MemoryStick, Activity, RefreshCw } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { ServiceStatus } from '@/components/ServiceStatus';
import { Pm2Table } from '@/components/Pm2Table';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [services, setServices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [metricsRes, servicesRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/services')
      ]);
      
      const metricsData = await metricsRes.json();
      const servicesData = await servicesRes.json();
      
      setMetrics(metricsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-indigo-200 font-medium tracking-widest uppercase text-sm">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="font-sans relative">

      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
            Home Server Dashboard
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Monitoring system metrics and services</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      <div className="space-y-8">
        {/* Hardware Metrics Row */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Hardware Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              title="CPU Usage"
              icon={Cpu}
              value={`${metrics?.cpu?.loadPercentage}%`}
              subValue={`${metrics?.cpu?.cores} Cores`}
              percentage={parseFloat(metrics?.cpu?.loadPercentage || '0')}
              colorClass="text-indigo-500"
            />
            <MetricCard 
              title="Memory Usage"
              icon={MemoryStick}
              value={formatBytes(metrics?.ram?.used || 0)}
              subValue={`of ${formatBytes(metrics?.ram?.total || 0)}`}
              percentage={parseFloat(metrics?.ram?.usedPercentage || '0')}
              colorClass="text-purple-500"
            />
            <MetricCard 
              title="Disk Usage (/)"
              icon={HardDrive}
              value={formatBytes(metrics?.disk?.used || 0)}
              subValue={`of ${formatBytes(metrics?.disk?.total || 0)}`}
              percentage={metrics?.disk?.usedPercentage || 0}
              colorClass="text-pink-500"
            />
          </div>
        </div>

        {/* Services Status Row */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Core Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceStatus 
              serviceName="MySQL Database" 
              status={services?.mysql?.status || 'stopped'} 
            />
          </div>
        </div>

        {/* PM2 Apps Table */}
        <div className="pt-4">
          <Pm2Table apps={services?.pm2 || []} />
        </div>
      </div>
    </div>
  );
}
