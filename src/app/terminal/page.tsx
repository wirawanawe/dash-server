"use client";

import React, { useState, useRef, useEffect } from 'react';
import { TerminalSquare, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: number;
  command: string;
  stdout: string;
  stderr: string;
  cwd: string;
}

export default function TerminalPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmdToRun = input.trim();
    setInput('');
    setIsProcessing(true);

    // Basic intercept for 'clear'
    if (cmdToRun === 'clear') {
      setHistory([]);
      setIsProcessing(false);
      return;
    }

    // Basic intercept for 'cd' to keep track of state pseudo-cwd
    let targetCwd = cwd;
    if (cmdToRun.startsWith('cd ')) {
      const newDir = cmdToRun.substring(3).trim();
      // To properly resolve, we can send a pwd command chained or just let the API handle it.
      // For simplicity in this pseudo-terminal, we'll try to execute it as "cd dir && pwd" to get the new path.
      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: `cd ${newDir} && pwd`, cwd: targetCwd }),
        });
        const data = await res.json();
        if (!data.stderr && data.stdout) {
          targetCwd = data.stdout.trim();
          setCwd(targetCwd);
        }
        
        setHistory(prev => [...prev, {
          id: Date.now(),
          command: cmdToRun,
          stdout: data.stdout,
          stderr: data.stderr,
          cwd: targetCwd
        }]);
        setIsProcessing(false);
        return;
      } catch (e) {
        // Fallback
      }
    }

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdToRun, cwd: targetCwd }),
      });
      
      const data = await res.json();
      
      setHistory(prev => [...prev, {
        id: Date.now(),
        command: cmdToRun,
        stdout: data.stdout || '',
        stderr: data.stderr || '',
        cwd: targetCwd
      }]);
    } catch (err: any) {
      setHistory(prev => [...prev, {
        id: Date.now(),
        command: cmdToRun,
        stdout: '',
        stderr: err.message || 'Failed to execute',
        cwd: targetCwd
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col font-sans">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Terminal Server</h1>
          <p className="text-slate-400 mt-1">Execute commands directly on your Ubuntu server</p>
        </div>
        <button 
          onClick={() => setHistory([])}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </header>

      <div className="flex-1 bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden font-mono text-sm">
        
        {/* Terminal Header */}
        <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <div className="flex-1 text-center text-slate-500 text-xs font-sans font-medium flex items-center justify-center gap-2">
            <TerminalSquare className="w-3 h-3" /> bash
          </div>
        </div>

        {/* Terminal Output Area */}
        <div 
          className="flex-1 p-4 overflow-y-auto"
          onClick={() => inputRef.current?.focus()}
        >
          {history.length === 0 && (
            <div className="text-slate-500 mb-4">
              Type <span className="text-indigo-400">help</span> to see available commands or just start typing...
            </div>
          )}

          {history.map((item) => (
            <div key={item.id} className="mb-4">
              <div className="flex items-center text-slate-300">
                <span className="text-green-400 mr-2">admin@ubuntu:</span>
                <span className="text-blue-400 mr-2">{item.cwd}</span>
                <span className="text-slate-500 mr-2">$</span>
                <span className="text-white">{item.command}</span>
              </div>
              
              {item.stdout && (
                <pre className="text-slate-300 mt-1 whitespace-pre-wrap break-words">{item.stdout}</pre>
              )}
              {item.stderr && (
                <pre className="text-red-400 mt-1 whitespace-pre-wrap break-words">{item.stderr}</pre>
              )}
            </div>
          ))}

          {/* Current Input Line */}
          <div className="flex items-center text-slate-300 mt-2">
            <span className="text-green-400 mr-2">admin@ubuntu:</span>
            <span className="text-blue-400 mr-2">{cwd}</span>
            <span className="text-slate-500 mr-2">$</span>
            
            <form onSubmit={handleCommand} className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-transparent outline-none text-white disabled:opacity-50"
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </form>
          </div>
          
          <div ref={bottomRef} />
        </div>

      </div>
    </div>
  );
}
