"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, TerminalSquare, Server } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Files', href: '/files', icon: FolderOpen },
    { name: 'Terminal', href: '/terminal', icon: TerminalSquare },
  ];

  return (
    <aside className="w-64 bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full z-20 shadow-2xl relative">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 bg-white/5">
        <Server className="w-6 h-6 text-indigo-500 mr-3" />
        <h1 className="text-lg font-bold text-white tracking-tight">Dash<span className="text-indigo-400">Server</span></h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
              }`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
            A
          </div>
          <div className="text-sm">
            <p className="text-slate-200 font-medium">Admin User</p>
            <p className="text-slate-500 text-xs">Ubuntu 22.04</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
