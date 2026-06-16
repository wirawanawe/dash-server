"use client";

import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, Home, ArrowLeft, Loader2, FileCode2 } from 'lucide-react';

interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For viewing files
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const fetchPath = async (targetPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(targetPath)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch');

      if (data.type === 'directory') {
        setItems(data.files);
        setCurrentPath(data.path);
        setViewingFile(null);
      } else if (data.type === 'file') {
        setFileContent(data.content);
        setViewingFile(data.path);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPath(currentPath);
  }, []);

  const handleItemClick = (item: FileItem) => {
    fetchPath(item.path);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    fetchPath(parent);
  };

  return (
    <div className="h-full flex flex-col font-sans">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">File Manager</h1>
        <p className="text-slate-400 mt-1">Browse and view server files</p>
      </header>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-2xl">
        
        {/* Breadcrumb / Path Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <button 
            onClick={handleNavigateUp}
            disabled={currentPath === '/' || viewingFile !== null}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 flex items-center px-4 py-2 bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            <Home className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
            <span className="text-slate-300 font-mono text-sm truncate">
              {viewingFile || currentPath}
            </span>
          </div>

          {viewingFile && (
            <button 
              onClick={() => fetchPath(currentPath)}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close File
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative p-2">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="inline-block p-4 bg-red-500/10 rounded-2xl border border-red-500/20 mb-4">
                <FileCode2 className="w-12 h-12 text-red-400 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error accessing path</h3>
              <p className="text-red-400">{error}</p>
            </div>
          ) : viewingFile ? (
            <div className="h-full bg-black/40 rounded-xl p-4 overflow-auto">
              <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap break-all">
                {fileContent}
              </pre>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors text-left group"
                >
                  <div className={`p-3 rounded-lg ${item.isDirectory ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-500/10 text-slate-400'} group-hover:scale-110 transition-transform`}>
                    {item.isDirectory ? <Folder className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{item.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.isDirectory ? 'Folder' : 'File'}</p>
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  This folder is empty.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
